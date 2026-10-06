// Runtime AI settings from the project-root `api.key` file (git-ignored).
// Copy `api.key.example` to `api.key` and edit it. Nothing secret is
// hardcoded, and every setting has a working default: with no api.key the app
// runs in mock mode (rule-based feedback only). Real environment variables win
// over the file, so CI or a shell export can override it.
import fs from "node:fs";
import path from "node:path";

export const API_KEY_FILE = "api.key";

// Which environment variable holds the key for each provider prefix.
export const PROVIDER_KEYS = { "groq/": "GROQ_API_KEY" };

const DEFAULTS = { GETAJOB_AI: "mock", LLM_MODEL: "groq/openai/gpt-oss-20b" };

/** Parses KEY=VALUE lines; `#` starts a comment (whole line or after a space). */
export function parseApiKeyFile(text) {
  const values = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    const value = line
      .slice(eq + 1)
      .replace(/\s+#.*$/, "")
      .trim()
      .replace(/^(['"])(.*)\1$/, "$2");
    values[key] = value;
  }
  return values;
}

function readFile(rootDir) {
  try {
    return parseApiKeyFile(fs.readFileSync(path.join(rootDir, API_KEY_FILE), "utf8"));
  } catch {
    return {}; // no api.key: mock mode
  }
}

/**
 * Settings for the AI features: { mode, model, apiKey, keyName }.
 * `apiKey` must never leave the server.
 */
export function loadAiSettings(rootDir, env = process.env) {
  const file = readFile(rootDir);
  const get = (name) => (env[name] ?? file[name] ?? DEFAULTS[name] ?? "").trim();
  const model = get("LLM_MODEL");
  const keyName = Object.entries(PROVIDER_KEYS).find(([prefix]) => model.startsWith(prefix))?.[1];
  return {
    mode: get("GETAJOB_AI") === "llm" ? "llm" : "mock",
    model,
    keyName: keyName || null,
    apiKey: keyName ? get(keyName) : "",
  };
}

/** What the browser may know: mode, model and whether calls can work. Never the key. */
export function publicStatus(settings) {
  if (settings.mode === "mock") return { mode: "mock", model: settings.model, ready: false };
  if (!settings.keyName) {
    return {
      mode: "llm",
      model: settings.model,
      ready: false,
      problem: `Unsupported LLM_MODEL "${settings.model}"; use a groq/... model`,
    };
  }
  if (!settings.apiKey) {
    return {
      mode: "llm",
      model: settings.model,
      ready: false,
      problem: `${settings.keyName} is not set (needed for ${settings.model}); add it to ${API_KEY_FILE}`,
    };
  }
  return { mode: "llm", model: settings.model, ready: true };
}
