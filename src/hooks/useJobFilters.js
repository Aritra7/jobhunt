import { useMemo, useState } from "react";
import { JOB_TYPES } from "../api/jobModel";
import { WORK_MODES } from "../data/jobs";
import { filterJobs, sortJobs } from "../utils/jobUtils";
import { pickAllowed, sanitizeSearchInput } from "../utils/sanitize";

export const REGIONS = [
  { id: "us", label: "United States" },
  { id: "europe", label: "Europe & UK" },
  { id: "all", label: "All regions" },
];
const SORTS = ["recommended", "salary", "company"];

export const DEFAULT_FILTERS = {
  query: "",
  region: "us",
  location: "all",
  mode: "all",
  jobType: "",
  minSalary: 0,
  sort: "recommended",
};

// SEC-4 (from Prithvi's branch): search text is normalized and every other
// filter value is whitelisted before it's used.
function cleanFilter(key, value) {
  switch (key) {
    case "query":
      return sanitizeSearchInput(value);
    case "region":
      return pickAllowed(
        value,
        REGIONS.map((r) => r.id),
        "us",
      );
    case "mode":
      return pickAllowed(value, ["all", ...WORK_MODES], "all");
    case "jobType":
      return pickAllowed(value, ["", ...JOB_TYPES], "");
    case "sort":
      return pickAllowed(value, SORTS, "recommended");
    case "minSalary":
      return Math.max(0, Number(value) || 0);
    default:
      return value;
  }
}

// Owns the Job Discovery filter state and derives the filtered, sorted list.
export function useJobFilters(jobs, profile) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const results = useMemo(
    () => sortJobs(filterJobs(jobs, filters), filters.sort, profile),
    [jobs, filters, profile],
  );

  const setFilter = (key, value) =>
    setFilters((current) => ({ ...current, [key]: cleanFilter(key, value) }));

  // Replaces several filters at once, e.g. from the saved profile.
  const applyFilters = (values) =>
    setFilters((current) => {
      const next = { ...current };
      for (const [key, value] of Object.entries(values)) next[key] = cleanFilter(key, value);
      return next;
    });

  return { filters, setFilter, applyFilters, results };
}
