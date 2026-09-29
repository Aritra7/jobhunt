import { useEffect, useState } from "react";

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

// Stored objects are merged over the defaults so data saved by an older
// version (missing newly added fields) still has every field the UI reads.
export function readStored(key, initialValue) {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return initialValue;
    const parsed = JSON.parse(stored);
    if (isPlainObject(initialValue)) {
      return isPlainObject(parsed) ? { ...initialValue, ...parsed } : initialValue;
    }
    if (Array.isArray(initialValue) && !Array.isArray(parsed)) return initialValue;
    return parsed;
  } catch {
    return initialValue;
  }
}

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readStored(key, initialValue));

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage unavailable (private mode, quota): keep the value in memory only.
    }
  }, [key, value]);

  return [value, setValue];
}
