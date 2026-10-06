// One JSON chat call to Groq's OpenAI-compatible API, with rate-limit-aware
// retries (free tiers cap tokens per minute), modelled on Truvay's LLM client.

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const TIMEOUT_MS = 30_000;
const RATE_LIMIT_RETRIES = 3;
const RATE_LIMIT_MAX_WAIT_S = 20;
const RETRY_IN = /try again in ([\d.]+)(ms|s)/i;

export class LLMError extends Error {}

/** Seconds to wait, from Groq's "Please try again in 5.93s" message (default 2s). */
export function retryAfter(message) {
  const m = RETRY_IN.exec(message || "");
  if (!m) return 2;
  const secs = Number(m[1]) / (m[2].toLowerCase() === "ms" ? 1000 : 1);
  return Math.min(secs + 0.25, RATE_LIMIT_MAX_WAIT_S);
}

const sleep = (s) => new Promise((resolve) => setTimeout(resolve, s * 1000));

/**
 * Sends one chat request that must return a JSON object and returns it.
 * `settings` comes from loadAiSettings; the key is only used in the header.
 * @param {{ model: string, apiKey: string }} settings
 * @param {string} system
 * @param {string} user
 * @param {{ fetchImpl?: (url: string, init: any) => Promise<any>, wait?: (seconds: number) => Promise<any> }} [options]
 */
export async function chatJson(settings, system, user, { fetchImpl = fetch, wait = sleep } = {}) {
  const model = settings.model.replace(/^groq\//, "");
  const body = JSON.stringify({
    model,
    temperature: 0.2,
    max_tokens: 1500,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  for (let attempt = 0; attempt <= RATE_LIMIT_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let res;
    try {
      res = await fetchImpl(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${settings.apiKey}`,
        },
        body,
        signal: controller.signal,
      });
    } catch (err) {
      throw new LLMError(
        err?.name === "AbortError" ? "LLM request timed out" : `LLM call failed: ${err?.message}`,
      );
    } finally {
      clearTimeout(timer);
    }

    if (res.status === 429 && attempt < RATE_LIMIT_RETRIES) {
      await wait(retryAfter(await res.text()));
      continue;
    }
    if (!res.ok) {
      // The provider's error text never contains our key, but keep it short.
      throw new LLMError(`LLM call failed: HTTP ${res.status}`);
    }
    const data = await res.json();
    try {
      return JSON.parse(data.choices[0].message.content);
    } catch {
      throw new LLMError("LLM did not return valid JSON");
    }
  }
  throw new LLMError(`${settings.model} still rate-limited after ${RATE_LIMIT_RETRIES} retries`);
}
