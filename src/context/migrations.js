import { STORAGE_KEYS } from "../constants/storageKeys";
import { sampleJobs } from "../api/sources/sample";
import { readStored } from "../hooks/useLocalStorage";

// Upgrades data saved by earlier versions: getajob used numeric ids for its
// sample jobs and kept applications as a { [jobId]: {...} } record; Prithvi's
// JobFind app stored its tracker under "jobfind.applications".

/** 3 -> "sample:3"; string ids are kept. */
export function toJobId(id) {
  return /^\d+$/.test(String(id)) ? `sample:${id}` : String(id);
}

export const mapKeys = (record, fn) =>
  Object.fromEntries(Object.entries(record || {}).map(([k, v]) => [fn(k), v]));

const OLD_STATUS = {
  Saved: "saved",
  Applied: "applied",
  Interview: "interviewing",
  Offer: "offer",
  Rejected: "rejected",
};

/** Snapshot fields the tracker keeps for each job. */
export function jobSnapshot(job) {
  return {
    jobId: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    url: job.url,
    sourceName: job.sourceName,
    descriptionText: job.descriptionText,
  };
}

/**
 * getajob's { [id]: { status, deadline, reminder, notes } } record plus its
 * separate saved-jobs list -> tracker entries.
 */
export function upgradeOldApplications(record, savedIds = []) {
  const byId = new Map(sampleJobs().map((job) => [job.id, job]));
  const entries = Object.entries(record || {}).flatMap(([id, app]) => {
    const job = byId.get(toJobId(id));
    if (!job) return [];
    return [
      {
        ...jobSnapshot(job),
        status: OLD_STATUS[app.status] || "saved",
        deadline: app.deadline || "",
        reminder: app.reminder || "",
        notes: app.notes || "",
        appliedAt: app.submittedAt || null,
      },
    ];
  });
  const tracked = new Set(entries.map((e) => e.jobId));
  const saved = savedIds
    .map(toJobId)
    .filter((id) => !tracked.has(id) && byId.has(id))
    .map((id) => ({ ...jobSnapshot(byId.get(id)), status: "saved" }));
  return [...entries, ...saved];
}

/** Tracker contents for a first run of this version. */
export function legacyTrackerEntries() {
  const old = readStored(STORAGE_KEYS.applications, null);
  const saved = readStored(STORAGE_KEYS.savedJobs, []);
  if (old || saved.length) return upgradeOldApplications(old, saved);
  const jobfind = readStored("jobfind.applications", []);
  return Array.isArray(jobfind) ? jobfind : [];
}

/**
 * getajob's first resume shape ({ skills: [], experience: "text" }) -> the
 * structured shape ({ skillsText, experience: [entries] }).
 */
export function upgradeResume(raw) {
  if (!raw || typeof raw !== "object") return raw;
  const next = { ...raw };
  if (Array.isArray(raw.skills)) next.skillsText = raw.skills.join(", ");
  if (typeof raw.experience === "string") {
    next.experience = raw.experience.trim()
      ? [{ title: "Experience", company: "", start: "", end: "", bulletsText: raw.experience }]
      : [];
  }
  return next;
}
