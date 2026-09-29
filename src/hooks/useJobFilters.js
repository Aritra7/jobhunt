import { useState, useMemo } from 'react';
import { sanitizeSearchInput, pickAllowed } from '../utils/sanitize';
import { JOB_TYPES, matchesJobTypes } from '../api/jobModel';
import useLocalStorage from './useLocalStorage';

export const REGIONS = [
  { id: 'us', label: 'United States' },
  { id: 'europe', label: 'Europe & UK' },
  { id: 'all', label: 'All regions' },
];
const REGION_IDS = REGIONS.map(r => r.id);

/**
 * Worldwide-remote jobs count for every region.
 * @param {import('../types').Job} job
 * @param {string} region
 */
function inRegion(job, region) {
  return region === 'all' || job.regions.includes(/** @type {any} */ (region)) || job.regions.includes('worldwide');
}

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
  const [region, setRegionRaw] = useLocalStorage('jobfind.region', 'us', raw => pickAllowed(raw, REGION_IDS, 'us'));

  const regionJobs = useMemo(() => jobs.filter(job => inRegion(job, region)), [jobs, region]);
  const locations = useMemo(() => locationOptions(regionJobs), [regionJobs]);

  // SEC-4: inputs are normalized and filter values are whitelisted before use.
  /** @param {string} value */
  const setSearchTerm = (value) => setSearchTermRaw(sanitizeSearchInput(value));
  /** @param {string} value */
  const setLocationFilter = (value) => setLocationFilterRaw(value === '' || locations.includes(value) ? value : '');
  /** @param {string} value */
  const setRegion = (value) => {
    setRegionRaw(pickAllowed(value, REGION_IDS, 'us'));
    setLocationFilterRaw('');
  };
  /** @param {string} value */
  const setJobType = (value) => setJobTypeRaw(pickAllowed(value, ['', ...JOB_TYPES], ''));

  const filteredJobs = useMemo(() => {
    const words = searchTerm.toLowerCase().split(' ').filter(Boolean);
    return regionJobs.filter(job =>
      (showHidden || !hiddenSet.has(job.id)) &&
      matchesWords(job, words) &&
      (locationFilter === '' || job.location === locationFilter) &&
      (jobType === '' || matchesJobTypes(job, [jobType])) &&
      (!remoteOnly || job.remote)
    );
  }, [regionJobs, hiddenSet, showHidden, searchTerm, locationFilter, jobType, remoteOnly]);

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
    region, setRegion,
    locationFilter, setLocationFilter, locations,
    jobType, setJobType,
    remoteOnly, setRemoteOnly,
    showHidden, setShowHidden,
    regionJobs, filteredJobs, applyProfile, resetFilters,
  };
}
