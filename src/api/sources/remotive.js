import { fetchJsonCached } from '../http';
import { makeJob, toIsoDate } from '../jobModel';

// Free, keyless, remote-only, often includes salary. Its terms ask for at most
// ~4 requests a day and attribution with a link back, so the response is cached
// in localStorage for 6 hours and every job links to its Remotive page.
const URL = 'https://remotive.com/api/remote-jobs';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

/** @param {any} raw */
function normalize(raw) {
  return makeJob({
    source: 'remotive',
    sourceName: 'Remotive',
    rawId: raw.id,
    title: raw.title,
    company: raw.company_name,
    companyLogo: raw.company_logo_url || raw.company_logo,
    location: raw.candidate_required_location ? `Remote (${raw.candidate_required_location})` : 'Remote',
    remote: true,
    jobTypes: raw.job_type ? [raw.job_type] : [],
    tags: [raw.category, ...(Array.isArray(raw.tags) ? raw.tags : [])],
    salary: raw.salary,
    postedAt: toIsoDate(raw.publication_date),
    descriptionHtml: raw.description,
    url: raw.url,
  });
}

export const remotive = {
  id: /** @type {const} */ ('remotive'),
  name: 'Remotive',
  /** @param {number} page 0-based; Remotive returns everything in one response */
  async fetchPage(page) {
    if (page > 0) return { jobs: [], hasMore: false };
    const data = await fetchJsonCached(URL, CACHE_TTL_MS);
    return { jobs: (Array.isArray(data.jobs) ? data.jobs : []).map(normalize), hasMore: false };
  },
};
