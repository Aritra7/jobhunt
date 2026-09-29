// Keyword matching ported from main's matchJobs: a keyword hit in the title
// counts more than one in the company, which counts more than the description,
// so the best fits float to the top.
export const TITLE_WEIGHT = 3;
export const COMPANY_WEIGHT = 2;
export const DESCRIPTION_WEIGHT = 1;
export const LOCATION_WEIGHT = 2;

export function keywordScore(job, keywords = []) {
  let score = 0;
  for (const keyword of keywords) {
    const k = String(keyword).trim().toLowerCase();
    if (!k) continue;
    if (job.title.toLowerCase().includes(k)) score += TITLE_WEIGHT;
    if (job.company.toLowerCase().includes(k)) score += COMPANY_WEIGHT;
    if ((job.description || "").toLowerCase().includes(k)) score += DESCRIPTION_WEIGHT;
  }
  return score;
}

// "Remote" in the preferences also matches any job whose work mode is Remote.
export function matchesPreferredLocation(job, preferredLocations = []) {
  return preferredLocations.some(
    (location) =>
      location === job.location ||
      location === job.mode ||
      (location === "Remote" && job.mode === "Remote"),
  );
}

export function preferenceScore(job, profile) {
  const locationScore = matchesPreferredLocation(job, profile.preferredLocations)
    ? LOCATION_WEIGHT
    : 0;
  return keywordScore(job, profile.keywords) + locationScore;
}

// Jobs that match the saved keywords or locations, best first.
export function matchJobs(jobs, profile) {
  return jobs
    .map((job) => ({ job, score: preferenceScore(job, profile) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ job }) => job);
}

export function hasPreferences(profile) {
  return (profile.keywords?.length || 0) > 0 || (profile.preferredLocations?.length || 0) > 0;
}

// Filter values that reproduce the saved preferences ("Use saved profile").
// Only uses a location that exists in the dropdown.
export function filtersFromProfile(profile, locations) {
  const location = (profile.preferredLocations || []).find((loc) => locations.includes(loc));
  return {
    query: profile.keywords?.[0] || "",
    location: location || "all",
    minSalary: Number(profile.minSalary || 0),
  };
}
