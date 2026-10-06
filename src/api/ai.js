// Browser side of the AI features. The browser never sees the API key: it
// calls the dev server's /api/ai endpoints, which read api.key (server/).

/** { mode: "mock" | "llm" | "offline", ready, model?, problem? } */
export async function getAiStatus() {
  try {
    const res = await fetch("/api/ai/status");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    // Static build or no dev server: rule-based features only.
    return { mode: "offline", ready: false };
  }
}

/** Runs one server-side AI task ("interview" | "bullets"). Throws on failure. */
export async function aiReview(task, input) {
  const res = await fetch("/api/ai/review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task, input }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `AI request failed (HTTP ${res.status})`);
  return data.result;
}
