import { useEffect, useState } from 'react';
import { fetchJobDetails } from '../api/jobsApi';

/**
 * Returns the job with its full description, fetching it first for sources
 * that only send descriptions on request (e.g. Greenhouse).
 * @param {import('../types').Job} job
 */
export default function useJobDetails(job) {
  const [loaded, setLoaded] = useState(/** @type {import('../types').Job | null} */ (null));
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!job.detailsKey) return undefined;
    let cancelled = false;
    fetchJobDetails(job)
      .then(full => { if (!cancelled) { setLoaded(full); setError(false); } })
      .catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [job]);

  if (!job.detailsKey) return { job, loading: false, error: false };
  const current = loaded && loaded.id === job.id ? loaded : null;
  return { job: current || job, loading: !current && !error, error: !current && error };
}
