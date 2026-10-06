import { makeJob } from "../jobModel";
import { sampleJobData } from "../../data/jobs";
import { sampleJobPerks } from "../../data/sampleJobPerks";
import { detectPerks } from "../../utils/jobPerks";

// The 23 built-in sample jobs, in the shared Job shape. Used only when no live
// source responds (offline, APIs down), so the app never shows an empty page.

const DAY_MS = 24 * 60 * 60 * 1000;

/** "2 days ago" / "1 week ago" -> ISO timestamp relative to now. */
function postedToIso(posted, now = Date.now()) {
  const match = /(\d+)\s*(day|week)/.exec(posted);
  const days = match ? Number(match[1]) * (match[2] === "week" ? 7 : 1) : 0;
  return new Date(now - days * DAY_MS).toISOString();
}

const escapeHtml = (text) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function toSampleJob(raw) {
  const perksText = sampleJobPerks[raw.id];
  const descriptionHtml =
    `<p>${escapeHtml(raw.description)}</p>` +
    `<h4>Requirements</h4><ul>${raw.requirements.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}</ul>` +
    (perksText ? `<h4>Benefits &amp; work authorization</h4><p>${escapeHtml(perksText)}</p>` : "");
  const job = makeJob({
    source: "sample",
    sourceName: "Sample data",
    rawId: raw.id,
    title: raw.title,
    company: raw.company,
    location: raw.location,
    remote: raw.mode === "Remote",
    jobTypes: [raw.type],
    tags: raw.skills,
    postedAt: postedToIso(raw.posted),
    descriptionHtml,
    url: null,
  });
  // Sample jobs carry the richer fields Kai's pages were built around.
  return {
    ...job,
    // Sample "Remote" jobs don't name a region; treat them as open anywhere.
    regions: job.regions.length ? job.regions : ["worldwide"],
    skills: raw.skills,
    mode: raw.mode,
    type: raw.type,
    salaryMin: raw.salaryMin,
    salaryMax: raw.salaryMax,
    posted: raw.posted,
    requirements: raw.requirements,
    companyInsights: raw.companyInsights,
    ...detectPerks(job.descriptionText),
  };
}

let cached;
export function sampleJobs() {
  cached ??= sampleJobData.map((raw) => toSampleJob(raw));
  return cached;
}
