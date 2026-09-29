import { useState, useEffect, useCallback, useRef } from 'react';
import { SOURCES, fetchJobsPage, mergeJobs } from '../api/jobsApi';
import { clearRequestMemo } from '../api/http';

/** @type {string[]} */
const ALL_SOURCE_IDS = SOURCES.map(s => s.id);

/**
 * Loads real jobs from every source, with "load more" pagination.
 * status: 'loading' (first page) | 'ready' | 'error' (no source succeeded)
 */
export default function useJobs() {
  const [jobs, setJobs] = useState(/** @type {import('../types').Job[]} */ ([]));
  const [status, setStatus] = useState('loading');
  const [loadingMore, setLoadingMore] = useState(false);
  const [errors, setErrors] = useState(/** @type {{ source: string, message: string }[]} */ ([]));
  const [openSources, setOpenSources] = useState(/** @type {string[]} */ (ALL_SOURCE_IDS));
  const nextPageRef = useRef(0);
  const requestIdRef = useRef(0);

  const loadFirstPage = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    const result = await fetchJobsPage(0, ALL_SOURCE_IDS);
    if (requestId !== requestIdRef.current) return;
    nextPageRef.current = 1;
    setJobs(result.jobs);
    setErrors(result.errors);
    setOpenSources(result.sourcesWithMore);
    setStatus(result.jobs.length === 0 && result.errors.length > 0 ? 'error' : 'ready');
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
    setJobs(prev => mergeJobs(prev, result.jobs));
    setErrors(result.errors);
    setOpenSources(result.sourcesWithMore);
  }, [loadingMore, openSources]);

  const retry = useCallback(() => {
    clearRequestMemo();
    setStatus('loading');
    loadFirstPage();
  }, [loadFirstPage]);

  return { jobs, status, errors, loadMore, loadingMore, canLoadMore: openSources.length > 0, retry };
}
