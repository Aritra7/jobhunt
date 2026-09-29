import { useMemo } from "react";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { useLocalStorage } from "../hooks/useLocalStorage";

function toggleId(ids, id) {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
}

// Saved and hidden job ids, persisted in localStorage.
export function useJobLists() {
  const [savedJobs, setSavedJobs] = useLocalStorage(STORAGE_KEYS.savedJobs, []);
  const [hiddenJobs, setHiddenJobs] = useLocalStorage(STORAGE_KEYS.hiddenJobs, []);
  const savedSet = useMemo(() => new Set(savedJobs), [savedJobs]);
  const hiddenSet = useMemo(() => new Set(hiddenJobs), [hiddenJobs]);

  return {
    savedJobs,
    savedSet,
    toggleSaved: (id) => setSavedJobs((ids) => toggleId(ids, id)),
    hiddenJobs,
    hiddenSet,
    toggleHidden: (id) => setHiddenJobs((ids) => toggleId(ids, id)),
  };
}
