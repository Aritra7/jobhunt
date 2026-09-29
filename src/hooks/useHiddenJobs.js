import { useMemo } from 'react';
import useLocalStorage from './useLocalStorage';

// Job ids the user chose to hide from search results.
export default function useHiddenJobs() {
  const [hiddenIds, setHiddenIds] = useLocalStorage('jobfind.hiddenJobs', /** @type {string[]} */ ([]),
    raw => (Array.isArray(raw) ? raw.filter(id => typeof id === 'string') : []));

  const hiddenSet = useMemo(() => new Set(hiddenIds), [hiddenIds]);

  /** @param {string} jobId */
  const toggleHidden = (jobId) => setHiddenIds(prev =>
    prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]);

  return { hiddenSet, toggleHidden, hiddenCount: hiddenIds.length };
}
