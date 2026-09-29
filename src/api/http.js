const DEFAULT_TIMEOUT_MS = 15000;

// In-flight/finished requests by URL, so StrictMode double effects and repeat
// navigation don't hit the APIs twice in one session.
const memo = new Map();

/**
 * @param {string} url
 * @param {{ timeoutMs?: number }} [options]
 * @returns {Promise<any>}
 */
export async function fetchJson(url, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') throw new Error('Request timed out');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * fetchJson, deduplicated for the lifetime of the page.
 * @param {string} url
 * @returns {Promise<any>}
 */
export function fetchJsonOnce(url) {
  if (!memo.has(url)) {
    const promise = fetchJson(url).catch((err) => {
      memo.delete(url);
      throw err;
    });
    memo.set(url, promise);
  }
  return memo.get(url);
}

/**
 * fetchJsonOnce plus a localStorage copy that survives reloads for ttlMs.
 * Only use for small responses (localStorage is ~5 MB).
 * @param {string} url
 * @param {number} ttlMs
 * @returns {Promise<any>}
 */
export async function fetchJsonCached(url, ttlMs) {
  const key = `jobfind.cache.${url}`;
  try {
    const cached = JSON.parse(localStorage.getItem(key) || 'null');
    if (cached && Date.now() - cached.savedAt < ttlMs) return cached.data;
  } catch {
    // Unreadable cache - fall through to the network.
  }
  const data = await fetchJsonOnce(url);
  try {
    localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data }));
  } catch {
    // Quota exceeded or storage disabled - the in-memory copy still works.
  }
  return data;
}

export function clearRequestMemo() {
  memo.clear();
}
