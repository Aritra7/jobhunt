import { useMemo } from "react";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { toJobId } from "./migrations";

// Hidden job ids, persisted in localStorage. (Saved jobs live in the tracker.)
export function useJobLists() {
  const [hiddenJobs, setHiddenJobs] = useLocalStorage(STORAGE_KEYS.hiddenJobs, [], (ids) =>
    ids.map(toJobId),
  );
  const hiddenSet = useMemo(() => new Set(hiddenJobs), [hiddenJobs]);

  const toggleHidden = (id) =>
    setHiddenJobs((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  return { hiddenJobs, hiddenSet, toggleHidden };
}
