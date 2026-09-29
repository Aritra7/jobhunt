import { beforeEach } from "vitest";

// Minimal in-memory Web Storage so components that read localStorage /
// sessionStorage during render work under Node.
function createStorage() {
  let store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => (store = new Map()),
    key: (i) => [...store.keys()][i] ?? null,
    get length() {
      return store.size;
    },
  };
}

// jsdom provides real storage; only stub it under plain Node.
if (typeof window === "undefined") {
  globalThis.localStorage = createStorage();
  globalThis.sessionStorage = createStorage();
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

// Tests run offline: every live job source fails, so the app shows the sample
// jobs. LIVE_JOBS=1 keeps the real network for the live smoke test.
if (!process.env.LIVE_JOBS) {
  globalThis.fetch = () => Promise.reject(new Error("No network in tests"));
}
