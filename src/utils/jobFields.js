import { extractSkills } from "./ats";
import { timeAgo } from "./format";
import { detectPerks } from "./jobPerks";

// Live jobs only have free text. These helpers derive the structured fields
// the rest of the app uses (skills, work mode, hourly pay, job type, posted).

const HOURS_PER_YEAR = 2080;

/** "Remote" | "Hybrid" | "On-site" */
export function detectMode(job) {
  if (/hybrid/i.test(job.location) || /\bhybrid\b/i.test(job.title)) return "Hybrid";
  return job.remote ? "Remote" : "On-site";
}

/**
 * Parses a free-text salary into hourly numbers.
 * "$120k – $150k" -> { min: 58, max: 72 }, "$40-50/hour" -> { min: 40, max: 50 }.
 * Returns nulls when there is no usable number.
 */
export function parsePay(salary) {
  const empty = { salaryMin: null, salaryMax: null };
  if (!salary) return empty;
  const text = salary.toLowerCase().replace(/,/g, "");
  const numbers = [...text.matchAll(/(\d+(?:\.\d+)?)\s*(k)?/g)]
    .map(([, n, k]) => Number(n) * (k ? 1000 : 1))
    .filter((n) => n > 0);
  if (numbers.length === 0) return empty;
  const hourly = /hour|hr\b/.test(text) || Math.max(...numbers) < 500;
  const toHourly = (n) => Math.round(hourly ? n : n / HOURS_PER_YEAR);
  const values = numbers.slice(0, 2).map(toHourly);
  return { salaryMin: Math.min(...values), salaryMax: Math.max(...values) };
}

/** Adds the derived fields to a live job. Sample jobs already have them. */
export function enrichJob(job) {
  if (job.source === "sample") return job;
  return {
    ...job,
    skills: extractSkills([job.title, job.tags.join(", "), job.descriptionText].join("\n")),
    mode: detectMode(job),
    type: job.jobTypes[0] || "Full time",
    posted: timeAgo(job.postedAt),
    ...parsePay(job.salary),
    ...detectPerks(job.descriptionText),
  };
}

/**
 * A job object for a tracked application whose posting isn't in the loaded
 * list (live postings come and go, and manual entries have no posting).
 */
export function jobFromApplication(app) {
  return enrichJob({
    id: app.jobId || `tracked:${app.id}`,
    source: "tracked",
    sourceName: app.sourceName,
    title: app.title,
    company: app.company,
    location: app.location || "Location not listed",
    remote: /remote/i.test(app.location || ""),
    regions: [],
    jobTypes: [],
    tags: [],
    salary: null,
    level: null,
    postedAt: app.createdAt,
    descriptionHtml: "",
    descriptionText: app.descriptionText,
    searchText: [app.title, app.company, app.descriptionText].join(" ").toLowerCase(),
    url: app.url,
    companyLogo: null,
    companyProfile: null,
    detailsKey: null,
  });
}
