import { useMemo, useState } from "react";
import { filterJobs, sortJobs } from "../utils/jobUtils";

export const DEFAULT_FILTERS = {
  query: "",
  location: "all",
  mode: "all",
  minSalary: 0,
  sort: "recommended",
};

// Owns the Job Discovery filter state and derives the filtered, sorted list.
export function useJobFilters(jobs, profile) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const results = useMemo(
    () => sortJobs(filterJobs(jobs, filters), filters.sort, profile),
    [jobs, filters, profile],
  );

  const setFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  // Replaces several filters at once, e.g. from the saved profile.
  const applyFilters = (values) => setFilters((current) => ({ ...current, ...values }));

  return { filters, setFilter, applyFilters, results };
}
