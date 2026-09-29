import { keywordScore, matchesPreferredLocation } from "./matching";
import { matchesJobTypes } from "../api/jobModel";

export function getMatchScore(job, profileSkills = []) {
  if (!job?.skills?.length) return 0;

  const normalized = (profileSkills || []).map((skill) => String(skill).toLowerCase());

  const matches = job.skills.filter((skill) =>
    normalized.includes(String(skill).toLowerCase()),
  ).length;

  return Math.round((matches / job.skills.length) * 100);
}

export function getSkillGaps(job, profileSkills = []) {
  const normalized = (profileSkills || []).map((skill) => String(skill).toLowerCase());

  return (job?.skills || []).filter((skill) => !normalized.includes(String(skill).toLowerCase()));
}

// A job is in a region if its location says so; worldwide-remote jobs count
// for every region (Prithvi's region filter).
function inRegion(job, region) {
  if (!region || region === "all") return true;
  const regions = job.regions || [];
  return regions.includes(region) || regions.includes("worldwide");
}

export function filterJobs(jobs, filters) {
  const words = String(filters?.query || "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  const minSalary = Number(filters?.minSalary || 0);

  return (jobs || []).filter((job) => {
    const searchable = [
      job.searchText,
      job.mode,
      job.type,
      ...(job.skills || []),
      ...(job.requirements || []),
    ]
      .join(" ")
      .toLowerCase();

    const matchesQuery = words.every((word) => searchable.includes(word));
    const matchesLocation =
      !filters?.location || filters.location === "all" || job.location === filters.location;
    const matchesMode = !filters?.mode || filters.mode === "all" || job.mode === filters.mode;
    const matchesType = !filters?.jobType || matchesJobTypes(job, [filters.jobType]);
    // Jobs that don't list pay are kept: most live postings don't.
    const matchesSalary = job.salaryMax == null || minSalary <= job.salaryMax;

    return (
      matchesQuery &&
      matchesLocation &&
      matchesMode &&
      matchesType &&
      matchesSalary &&
      inRegion(job, filters?.region)
    );
  });
}

export function recommendationScore(job, profile = {}) {
  const skills = profile.skills || [];

  const preferredLocations =
    profile.preferredLocations || (profile.location ? [profile.location] : []);

  const preferredModes = profile.preferredModes || [];

  const minSalary = Number(profile.minSalary ?? 0);

  const skillScore = getMatchScore(job, skills);

  const locationBoost = matchesPreferredLocation(job, preferredLocations) ? 10 : 0;

  const modeBoost = preferredModes.includes(job.mode) ? 8 : 0;

  const salaryBoost = job.salaryMax != null && job.salaryMax >= minSalary ? 5 : 0;

  // Saved keywords (0 when none are set, so the default ranking is unchanged).
  const keywordBoost = Math.min(15, keywordScore(job, profile.keywords) * 3);

  return Math.min(100, skillScore + locationBoost + modeBoost + salaryBoost + keywordBoost);
}

export function formatSalary(job) {
  if (!job) return "Salary unavailable";
  if (job.salary) return job.salary; // as listed by a live source
  if (job.salaryMin == null) return "Pay not listed";
  if (job.salaryMin === job.salaryMax) return `$${job.salaryMin}/hr`;
  return `$${job.salaryMin}–${job.salaryMax}/hr`;
}

// Orders jobs for the discovery list: "company" (A–Z), "salary" (highest max
// pay first, unlisted pay last) or, by default, "recommended" (highest recommendationScore first).
export function sortJobs(jobs, sort, profile) {
  if (sort === "company") return [...jobs].sort((a, b) => a.company.localeCompare(b.company));
  if (sort === "salary") return [...jobs].sort((a, b) => (b.salaryMax ?? -1) - (a.salaryMax ?? -1));
  // Score each job once (live data can have thousands of jobs).
  return jobs
    .map((job) => ({ job, score: recommendationScore(job, profile) }))
    .sort((a, b) => b.score - a.score)
    .map(({ job }) => job);
}

// Most-requested skills across jobs, as [skill, count] pairs (highest first).
export function topSkills(jobs, limit = 6) {
  const counts = {};
  jobs.forEach((job) => job.skills.forEach((skill) => (counts[skill] = (counts[skill] || 0) + 1)));
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

// Most common locations, for the location dropdown (live data has hundreds).
export function topLocations(jobs, limit = 60) {
  const counts = new Map();
  for (const job of jobs) counts.set(job.location, (counts.get(job.location) || 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([location]) => location)
    .sort((a, b) => a.localeCompare(b));
}
