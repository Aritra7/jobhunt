// @vitest-environment node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadAiSettings, parseApiKeyFile, publicStatus } from "./apiKey.js";
import { chatJson, retryAfter } from "./llm.js";
import { createAiHandler } from "./aiPlugin.js";
import { TASKS } from "./aiTasks.js";

const SECRET = "gsk_test_secret_value";

function tempRoot(contents) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "getajob-ai-"));
  if (contents !== undefined) fs.writeFileSync(path.join(dir, "api.key"), contents);
  return dir;
}

describe("api.key", () => {
  it("parses KEY=VALUE lines with comments and quotes", () => {
    expect(
      parseApiKeyFile("# comment\nGETAJOB_AI=llm   # mock | llm\nGROQ_API_KEY='abc'\n\nBAD LINE\n"),
    ).toEqual({ GETAJOB_AI: "llm", GROQ_API_KEY: "abc" });
  });

  it("defaults to mock mode when there is no api.key", () => {
    const settings = loadAiSettings(tempRoot(), {});
    expect(settings).toMatchObject({ mode: "mock", model: "groq/openai/gpt-oss-20b", apiKey: "" });
    expect(publicStatus(settings)).toEqual({
      mode: "mock",
      model: "groq/openai/gpt-oss-20b",
      ready: false,
    });
  });

  it("reads the key from the file, lets env vars win, and never exposes the key", () => {
    const root = tempRoot(`GETAJOB_AI=llm\nGROQ_API_KEY=${SECRET}\n`);
    expect(loadAiSettings(root, {}).apiKey).toBe(SECRET);
    expect(loadAiSettings(root, { GROQ_API_KEY: "from-env" }).apiKey).toBe("from-env");
    const status = publicStatus(loadAiSettings(root, {}));
    expect(status).toEqual({ mode: "llm", model: "groq/openai/gpt-oss-20b", ready: true });
    expect(JSON.stringify(status)).not.toContain(SECRET);
  });

  it("explains a missing key", () => {
    const status = publicStatus(loadAiSettings(tempRoot("GETAJOB_AI=llm\n"), {}));
    expect(status.problem).toBe(
      "GROQ_API_KEY is not set (needed for groq/openai/gpt-oss-20b); add it to api.key",
    );
  });

  it("is git-ignored, and the committed example has no key", () => {
    const gitignore = fs.readFileSync(new URL("../.gitignore", import.meta.url), "utf8");
    expect(gitignore.split("\n")).toContain("api.key");
    const example = fs.readFileSync(new URL("../api.key.example", import.meta.url), "utf8");
    expect(parseApiKeyFile(example)).toMatchObject({ GETAJOB_AI: "mock", GROQ_API_KEY: "" });
  });
});

describe("chatJson", () => {
  const settings = { model: "groq/openai/gpt-oss-20b", apiKey: SECRET };
  const ok = (content) => ({
    ok: true,
    status: 200,
    json: async () => ({ choices: [{ message: { content } }] }),
  });

  it("calls Groq with the key in the header and returns parsed JSON", async () => {
    let request;
    const fetchImpl = async (url, init) => {
      request = { url, init };
      return ok('{"score": 80}');
    };
    expect(await chatJson(settings, "sys", "user", { fetchImpl })).toEqual({ score: 80 });
    expect(request.url).toBe("https://api.groq.com/openai/v1/chat/completions");
    expect(request.init.headers.Authorization).toBe(`Bearer ${SECRET}`);
    expect(JSON.parse(request.init.body)).toMatchObject({
      model: "openai/gpt-oss-20b",
      response_format: { type: "json_object" },
    });
  });

  it("waits and retries when rate-limited", async () => {
    const waits = [];
    let calls = 0;
    const fetchImpl = async () =>
      ++calls === 1
        ? { ok: false, status: 429, text: async () => "Please try again in 1.5s" }
        : ok("{}");
    await chatJson(settings, "s", "u", { fetchImpl, wait: async (s) => waits.push(s) });
    expect(waits).toEqual([1.75]);
    expect(retryAfter("try again in 900ms")).toBeCloseTo(1.15);
  });

  it("reports provider errors without the key", async () => {
    const fetchImpl = async () => ({ ok: false, status: 401, text: async () => "bad key" });
    await expect(chatJson(settings, "s", "u", { fetchImpl })).rejects.toThrow("HTTP 401");
  });
});

describe("AI endpoint", () => {
  function call(handler, method, url, body) {
    return new Promise((resolve) => {
      const listeners = {};
      const req = {
        method,
        url,
        on: (event, fn) => {
          listeners[event] = fn;
          if (event === "end") {
            if (body !== undefined) listeners.data?.(Buffer.from(JSON.stringify(body)));
            setTimeout(() => fn(), 0);
          }
        },
      };
      const res = {
        statusCode: 0,
        setHeader() {},
        end: (text) => resolve({ status: res.statusCode, body: JSON.parse(text) }),
      };
      handler(req, res, () => resolve({ status: "next" }));
    });
  }

  it("serves status, ignores other routes, and refuses in mock mode", async () => {
    const handler = createAiHandler({ rootDir: tempRoot(), env: {} });
    expect((await call(handler, "GET", "/api/ai/status")).body.mode).toBe("mock");
    expect((await call(handler, "GET", "/jobs")).status).toBe("next");
    const refused = await call(handler, "POST", "/api/ai/review", { task: "interview" });
    expect(refused.status).toBe(503);
  });

  it("runs only known tasks with server-side prompts and checks the output", async () => {
    const seen = [];
    const chat = async (settings, system, user) => {
      seen.push({ settings, system, user });
      return { score: 140, strengths: ["Clear"], improvements: ["Add a number", 2, "", "x", "y"] };
    };
    const root = tempRoot(`GETAJOB_AI=llm\nGROQ_API_KEY=${SECRET}\n`);
    const handler = createAiHandler({ rootDir: root, env: {}, chat });

    const bad = await call(handler, "POST", "/api/ai/review", { task: "anything", input: {} });
    expect(bad.status).toBe(400);
    const res = await call(handler, "POST", "/api/ai/review", {
      task: "interview",
      input: { question: "Tell me about yourself", answer: "I built a thing", company: "Acme" },
    });
    expect(res.status).toBe(200);
    expect(res.body.result).toEqual({
      score: 100,
      strengths: ["Clear"],
      improvements: ["Add a number", "2", "x"],
    });
    expect(seen[0].system).toBe(TASKS.interview.system);
    expect(seen[0].user).toContain("Answer:\nI built a thing");
    expect(JSON.stringify(res.body)).not.toContain(SECRET);
  });

  it("rate-limits AI calls", async () => {
    let t = 0;
    const handler = createAiHandler({
      rootDir: tempRoot(`GETAJOB_AI=llm\nGROQ_API_KEY=${SECRET}\n`),
      env: {},
      chat: async () => ({ reviews: [] }),
      now: () => t,
    });
    const review = () =>
      call(handler, "POST", "/api/ai/review", { task: "bullets", input: { bullets: ["Built x"] } });
    for (let i = 0; i < 20; i++) expect((await review()).status).toBe(200);
    expect((await review()).status).toBe(429);
    t = 61_000;
    expect((await review()).status).toBe(200);
  });
});
