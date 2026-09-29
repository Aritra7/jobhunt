import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SOURCES, fetchJobsPage, mergeJobs } from "../api/jobsApi";
import { clearRequestMemo } from "../api/http";
import { sampleJobs } from "../api/sources/sample";
import { enrichJob } from "../utils/jobFields";

const ALL_SOURCE_IDS = SOURCES.map((s) => s.id);

/**
 * Loads live jobs from every source with "load more" paging (Prithvi's
 * useJobs). If no source responds, falls back to the built-in sample jobs.
 * status: "loading" | "ready" | "sample" (showing sample jobs)
 */
export function useJobs() {
  const [liveJobs, setLiveJobs] = useState([]);
  const [status, setStatus] = useState("loading");
  const [loadingMore, setLoadingMore] = useState(false);
  const [errors, setErrors] = useState([]);
  const [openSources, setOpenSources] = useState(ALL_SOURCE_IDS);
  const nextPageRef = useRef(0);
  const requestIdRef = useRef(0);

  const loadFirstPage = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    const result = await fetchJobsPage(0, ALL_SOURCE_IDS);
    if (requestId !== requestIdRef.current) return;
    nextPageRef.current = 1;
    setLiveJobs(result.jobs);
    setErrors(result.errors);
    setOpenSources(result.sourcesWithMore);
    setStatus(result.jobs.length === 0 ? "sample" : "ready");
  }, []);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  const loadMore = useCallback(async () => {
    if (loadingMore || openSources.length === 0) return;
    const requestId = requestIdRef.current;
    setLoadingMore(true);
    const result = await fetchJobsPage(nextPageRef.current, openSources);
    setLoadingMore(false);
    if (requestId !== requestIdRef.current) return;
    nextPageRef.current += 1;
    setLiveJobs((prev) => mergeJobs(prev, result.jobs));
    setErrors(result.errors);
    setOpenSources(result.sourcesWithMore);
  }, [loadingMore, openSources]);

  const retry = useCallback(() => {
    clearRequestMemo();
    setStatus("loading");
    loadFirstPage();
  }, [loadFirstPage]);

  const jobs = useMemo(
    () => (status === "sample" ? sampleJobs() : liveJobs.map(enrichJob)),
    [status, liveJobs],
  );

  return {
    jobs,
    status,
    errors,
    loadMore,
    loadingMore,
    canLoadMore: status === "ready" && openSources.length > 0,
    retry,
  };
}
