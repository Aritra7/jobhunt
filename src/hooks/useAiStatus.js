import { useEffect, useState } from "react";
import { getAiStatus } from "../api/ai";

let cached;

// Whether LLM features are available (api.key set to llm with a key).
// Fetched once per page load.
export function useAiStatus() {
  const [status, setStatus] = useState(cached || { mode: "loading", ready: false });
  useEffect(() => {
    if (cached) return undefined;
    let active = true;
    getAiStatus().then((s) => {
      cached = s;
      if (active) setStatus(s);
    });
    return () => {
      active = false;
    };
  }, []);
  return status;
}

/** Test helper: forget the cached status. */
export function resetAiStatusCache() {
  cached = undefined;
}
