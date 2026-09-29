import { useState, useMemo } from 'react';
import { sanitizeSearchInput, pickAllowed } from '../utils/sanitize';
import { JOB_TYPES } from '../api/jobModel';

const MAX_LOCATION_OPTIONS = 60;

/**
 * Every search word must appear somewhere in the job.
 * @param {import('../types').Job} job
 * @param {string[]} words
 */
function matchesWords(job, words) {
  return words.every(w => job.searchText.includes(w));
}

/**
 * Most common locations in the loaded jobs, for the location dropdown.
 * @param {import('../types').Job[]} jobs
 */
function locationOptions(jobs) {
  const counts = new Map();
  for (const job of jobs) counts.set(job.location, (counts.get(job.location) || 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_LOCATION_OPTIONS)
    .map(([location]) => location)
    .sort((a, b) => a.localeCompare(b));
}

/**
 * Owns the search/filter state and derives the filtered job list.
 * @param {import('../types').Job[]} jobs
 * @param {Set<string>} hiddenSet
 */
export default function useJobFilters(jobs, hiddenSet) {
  const [searchTerm, setSearchTermRaw] = useState('');
  const [locationFilter, setLocationFilterRaw] = useState('');
  const [jobType, setJobTypeRaw] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [showHidden, setShowHidden] = useState(false);

  const locations = useMemo(() => locationOptions(jobs), [jobs]);

  // SEC-4: inputs are normalized and filter values are whitelisted before use.
  /** @param {string} value */
  const setSearchTerm = (value) => setSearchTermRaw(sanitizeSearchInput(value));
  /** @param {string} value */
  const setLocationFilter = (value) => setLocationFilterRaw(value === '' || locations.includes(value) ? value : '');
  /** @param {string} value */
  const setJobType = (value) => setJobTypeRaw(pickAllowed(value, ['', ...JOB_TYPES], ''));

  const filteredJobs = useMemo(() => {
    const words = searchTerm.toLowerCase().split(' ').filter(Boolean);
    return jobs.filter(job =>
      (showHidden || !hiddenSet.has(job.id)) &&
      matchesWords(job, words) &&
      (locationFilter === '' || job.location === locationFilter) &&
      (jobType === '' || job.jobTypes.includes(jobType)) &&
      (!remoteOnly || job.remote)
    );
  }, [jobs, hiddenSet, showHidden, searchTerm, locationFilter, jobType, remoteOnly]);

  /**
   * "Use saved profile": fills the filters from the saved preferences.
   * @param {import('../types').Profile | null} profile
   */
  const applyProfile = (profile) => {
    if (!profile) return;
    setSearchTerm(profile.keywords[0] || '');
    const loc = profile.preferredLocation.toLowerCase();
    setLocationFilterRaw(loc ? (locations.find(l => l.toLowerCase().includes(loc)) || '') : '');
    setRemoteOnly(profile.workMode === 'remote');
    setJobTypeRaw(profile.jobTypes.length === 1 ? profile.jobTypes[0] : '');
  };

  const resetFilters = () => {
    setSearchTermRaw('');
    setLocationFilterRaw('');
    setJobTypeRaw('');
    setRemoteOnly(false);
  };

  return {
    searchTerm, setSearchTerm,
    locationFilter, setLocationFilter, locations,
    jobType, setJobType,
    remoteOnly, setRemoteOnly,
    showHidden, setShowHidden,
    filteredJobs, applyProfile, resetFilters,
  };
}
