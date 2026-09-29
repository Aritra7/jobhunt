import { LEGACY_PROFILE_KEY } from "../constants/storageKeys";

function readLegacyProfile() {
  try {
    const raw = localStorage.getItem(LEGACY_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const unique = (items) => [...new Set(items)];

// Folds preferences saved by the old JobFind app into the current profile.
// Pure given `legacy`, so it is safe to run more than once.
export function mergeLegacyProfile(profile, legacy) {
  if (!legacy || typeof legacy !== "object") return profile;
  const keywords = Array.isArray(legacy.keywords)
    ? legacy.keywords.map((k) => String(k).trim()).filter(Boolean)
    : [];
  const location = typeof legacy.preferredLocation === "string" ? legacy.preferredLocation : "";
  // Prithvi's JobFind also saved a work mode and job types.
  const mode = { remote: "Remote", onsite: "On-site" }[legacy.workMode];
  const jobTypes = Array.isArray(legacy.jobTypes) ? legacy.jobTypes.filter(Boolean) : [];
  return {
    ...profile,
    keywords: unique([...profile.keywords, ...keywords]),
    preferredLocations: location
      ? unique([...profile.preferredLocations, location])
      : profile.preferredLocations,
    preferredModes: mode ? [mode] : profile.preferredModes,
    jobTypes: unique([...(profile.jobTypes || []), ...jobTypes]),
  };
}

export const withLegacyProfile = (profile) => mergeLegacyProfile(profile, readLegacyProfile());

// Called after the merged profile has been saved, so the merge happens once.
export function removeLegacyProfile() {
  try {
    localStorage.removeItem(LEGACY_PROFILE_KEY);
  } catch {
    // ignore
  }
}
