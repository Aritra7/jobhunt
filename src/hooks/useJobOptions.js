import { useCallback, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { useJobsData } from "../context/JobsContext";
import { sampleJobs } from "../api/sources/sample";
import { jobFromApplication } from "../utils/jobFields";
import { sortJobs } from "../utils/jobUtils";

const RECOMMENDED_COUNT = 30;

/**
 * Finds a job by id among loaded jobs, sample jobs (tracked earlier) and
 * tracked applications whose posting is no longer loaded.
 */
export function useJobLookup() {
  const { applications } = useApp();
  const { jobs } = useJobsData();
  const byId = useMemo(
    () => new Map([...sampleJobs(), ...jobs].map((job) => [job.id, job])),
    [jobs],
  );
  return useCallback(
    (id) => {
      if (!id) return null;
      if (byId.has(id)) return byId.get(id);
      const app = applications.find((a) => a.jobId === id || `tracked:${a.id}` === id);
      return app ? jobFromApplication(app) : null;
    },
    [byId, applications],
  );
}

/**
 * Jobs offered in pickers (apply, interview, insights): tracked jobs first,
 * then the top recommendations, instead of every loaded job.
 */
export function useJobOptions() {
  const { applications, profile } = useApp();
  const { jobs } = useJobsData();
  const lookup = useJobLookup();

  return useMemo(() => {
    const tracked = applications.map(
      (app) => lookup(app.jobId || `tracked:${app.id}`) || jobFromApplication(app),
    );
    const trackedIds = new Set(tracked.map((job) => job.id));
    const recommended = sortJobs(
      jobs.filter((job) => !trackedIds.has(job.id)),
      "recommended",
      profile,
    ).slice(0, RECOMMENDED_COUNT);
    return [...tracked, ...recommended];
  }, [applications, jobs, profile, lookup]);
}

/**
 * A job picker's state: the job with `selectedId` (or the first option) and
 * the choices to show, which always include the selected job.
 */
export function useJobChoice(selectedId) {
  const options = useJobOptions();
  const lookup = useJobLookup();
  const job = lookup(selectedId) || options[0] || null;
  const choices = job && !options.some((o) => o.id === job.id) ? [job, ...options] : options;
  return { job, choices };
}
