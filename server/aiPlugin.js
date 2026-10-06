// Vite plugin that serves the AI endpoints from the dev and preview servers:
//   GET  /api/ai/status          -> { mode, model, ready, problem? } (never the key)
//   POST /api/ai/review {task, input} -> { result } | { error }
// The key is read from api.key on the server only. A static build without
// this server simply runs in mock mode.
import { loadAiSettings, publicStatus } from "./apiKey.js";
import { chatJson } from "./llm.js";
import { TASKS } from "./aiTasks.js";

const MAX_BODY_BYTES = 64 * 1024;
const RATE_LIMIT = { calls: 20, windowMs: 60_000 };

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) reject(new Error("request too large"));
      else chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

/** Handles one AI request. Exported for tests. */
export function createAiHandler({ rootDir, env = process.env, chat = chatJson, now = Date.now }) {
  const recent = [];

  return async function handle(req, res, next) {
    const url = (req.url || "").split("?")[0];
    if (!url.startsWith("/api/ai/")) return next();
    // Re-read on every request so editing api.key needs no restart.
    const settings = loadAiSettings(rootDir, env);
    const status = publicStatus(settings);

    if (url === "/api/ai/status" && req.method === "GET") return send(res, 200, status);
    if (url !== "/api/ai/review" || req.method !== "POST") {
      return send(res, 404, { error: "Not found" });
    }
    if (!status.ready) {
      return send(res, 503, { error: status.problem || "AI is in mock mode (GETAJOB_AI=mock)" });
    }

    const t = now();
    while (recent.length && t - recent[0] > RATE_LIMIT.windowMs) recent.shift();
    if (recent.length >= RATE_LIMIT.calls) {
      return send(res, 429, { error: "Too many AI requests; try again in a minute" });
    }

    let task;
    let user;
    try {
      const body = JSON.parse(await readBody(req));
      task = TASKS[body?.task];
      if (!task) return send(res, 400, { error: "Unknown task" });
      user = task.buildUser(body.input || {});
    } catch (err) {
      return send(res, 400, { error: `Bad request: ${err.message}` });
    }

    recent.push(t);
    try {
      const raw = await chat(settings, task.system, user);
      return send(res, 200, { result: task.parse(raw) });
    } catch (err) {
      return send(res, 502, { error: err.message || "AI request failed" });
    }
  };
}

export function aiPlugin() {
  let handler;
  return {
    name: "getajob-ai",
    configResolved(config) {
      handler = createAiHandler({ rootDir: config.root });
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => handler(req, res, next));
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => handler(req, res, next));
    },
  };
}
