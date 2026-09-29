import { useState, useCallback } from 'react';

/**
 * @template T
 * @param {string} key
 * @param {T} fallback
 * @returns {T}
 */
function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * useState that persists to localStorage. Storage failures (private mode,
 * quota) degrade to in-memory state instead of crashing.
 * @template T
 * @param {string} key
 * @param {T} fallback
 * @param {(stored: any) => T} [migrate]  Repairs data saved by older versions
 * @returns {[T, (next: T | ((prev: T) => T)) => void]}
 */
export default function useLocalStorage(key, fallback, migrate) {
  const [value, setValue] = useState(() => {
    const stored = read(key, fallback);
    return migrate ? migrate(stored) : stored;
  });

  const update = useCallback((next) => {
    setValue(prev => {
      const resolved = typeof next === 'function' ? next(prev) : next;
      try {
        localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        // Keep the in-memory value.
      }
      return resolved;
    });
  }, [key]);

  return [value, update];
}
