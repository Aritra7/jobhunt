import { greenhouse } from './sources/greenhouse';
import { jobicy } from './sources/jobicy';
import { arbeitnow } from './sources/arbeitnow';
import { remotive } from './sources/remotive';
import { muse } from './sources/muse';

// Adding a source = one adapter file with { id, name, fetchPage, fetchDetails? } + one line here.
/** @type {{ id: string, name: string, fetchPage: (page: number) => Promise<{ jobs: import('../types').Job[], hasMore: boolean }>, fetchDetails?: (job: import('../types').Job) => Promise<import('../types').Job> }[]} */
export const SOURCES = [greenhouse, jobicy, muse, remotive, arbeitnow];

/**
 * Loads the full job (description etc.) for sources that send it on request.
 * Jobs that already have everything are returned as-is.
 * @param {import('../types').Job} job
 * @returns {Promise<import('../types').Job>}
 */
export async function fetchJobDetails(job) {
  if (!job.detailsKey) return job;
  const source = SOURCES.find(s => s.id === job.source);
  return source && source.fetchDetails ? source.fetchDetails(job) : job;
}

/** @param {import('../types').Job} job */
function dedupeKey(job) {
  return `${job.title}|${job.company}`.toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Merges job lists, dropping cross-source duplicates and sorting newest first.
 * @param {import('../types').Job[]} existing
 * @param {import('../types').Job[]} incoming
 */
export function mergeJobs(existing, incoming) {
  const seen = new Set(existing.map(dedupeKey));
  const merged = [...existing];
  for (const job of incoming) {
    const key = dedupeKey(job);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(job);
    }
  }
  return merged.sort((a, b) => b.postedAt.localeCompare(a.postedAt));
}

/**
 * Fetches one page from each requested source in parallel. A failing source
 * is reported in `errors` instead of breaking the whole search.
 * @param {number} page
 * @param {string[]} sourceIds
 */
export async function fetchJobsPage(page, sourceIds) {
  const sources = SOURCES.filter(s => sourceIds.includes(s.id));
  const results = await Promise.allSettled(sources.map(s => s.fetchPage(page)));

  /** @type {import('../types').Job[]} */
  let jobs = [];
  /** @type {{ source: string, message: string }[]} */
  const errors = [];
  /** @type {string[]} */
  const sourcesWithMore = [];

  results.forEach((result, i) => {
    const source = sources[i];
    if (result.status === 'fulfilled') {
      jobs = mergeJobs(jobs, result.value.jobs);
      if (result.value.hasMore) sourcesWithMore.push(source.id);
    } else {
      const reason = result.reason;
      errors.push({ source: source.name, message: reason instanceof Error ? reason.message : String(reason) });
    }
  });

  return { jobs, errors, sourcesWithMore };
}
