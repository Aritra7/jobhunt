import { matchesJobTypes } from "../api/jobModel";

// Keyword matching, with the weights from Prithvi's matchJobs (his later
// version of main's): title hits count most, then tags, company, description.
export const TITLE_WEIGHT = 5;
export const TAG_WEIGHT = 3;
export const COMPANY_WEIGHT = 2;
export const DESCRIPTION_WEIGHT = 1;
export const LOCATION_WEIGHT = 3;

export function keywordScore(job, keywords = []) {
  const title = job.title.toLowerCase();
  const tags = (job.tags || []).join(" ").toLowerCase();
  const company = job.company.toLowerCase();
  const description = (job.descriptionText || "").toLowerCase();
  let score = 0;
  for (const keyword of keywords) {
    const k = String(keyword).trim().toLowerCase();
    if (!k) continue;
    if (title.includes(k)) score += TITLE_WEIGHT;
    if (tags.includes(k)) score += TAG_WEIGHT;
    if (company.includes(k)) score += COMPANY_WEIGHT;
    if (description.includes(k)) score += DESCRIPTION_WEIGHT;
  }
  return score;
}

// Preferred locations are free text matched inside the job's location
// ("Pittsburgh" matches "Pittsburgh, PA"); "Remote" also matches remote jobs.
export function matchesPreferredLocation(job, preferredLocations = []) {
  const location = job.location.toLowerCase();
  return preferredLocations.some((preferred) => {
    const p = preferred.trim().toLowerCase();
    return (p && location.includes(p)) || (p === "remote" && job.mode === "Remote");
  });
}

export function preferenceScore(job, profile) {
  const locationScore = matchesPreferredLocation(job, profile.preferredLocations)
    ? LOCATION_WEIGHT
    : 0;
  return keywordScore(job, profile.keywords) + locationScore;
}

// Jobs that match the saved keywords or locations (and job types, if any are
// chosen), best first.
export function matchJobs(jobs, profile) {
  return (
    jobs
      .filter((job) => matchesJobTypes(job, profile.jobTypes || []))
      // Someone who needs sponsorship never wants jobs that rule it out.
      .filter((job) => !profile.needsSponsorship || job.sponsorship?.status !== "not-offered")
      .map((job) => ({ job, score: preferenceScore(job, profile) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ job }) => job)
  );
}

export function hasPreferences(profile) {
  return (profile.keywords?.length || 0) > 0 || (profile.preferredLocations?.length || 0) > 0;
}

// Filter values that reproduce the saved preferences ("Use saved profile").
// Picks the first dropdown location that contains a preferred location.
export function filtersFromProfile(profile, locations) {
  const wanted = (profile.preferredLocations || []).map((loc) => loc.toLowerCase());
  const location = locations.find((option) =>
    wanted.some((loc) => loc && option.toLowerCase().includes(loc)),
  );
  const modes = profile.preferredModes || [];
  const types = profile.jobTypes || [];
  return {
    query: profile.keywords?.[0] || "",
    location: location || "all",
    mode: modes.length === 1 ? modes[0] : "all",
    jobType: types.length === 1 ? types[0] : "",
    sponsorship: profile.needsSponsorship ? "not-excluded" : "any",
    minSalary: Number(profile.minSalary || 0),
  };
}
