import { fetchJsonCached } from '../http';
import { makeJob, toIsoDate } from '../jobModel';

// Free, keyless remote jobs open to US candidates, often with salary. Terms:
// credit Jobicy with a link and send applicants to the original job URL.
const URL = 'https://jobicy.com/api/v2/remote-jobs?count=50&geo=usa';
const CACHE_TTL_MS = 60 * 60 * 1000;

/** @param {unknown} value */
function list(value) {
  return Array.isArray(value) ? value.map(String) : typeof value === 'string' && value ? [value] : [];
}

/** @param {any} raw */
function salary(raw) {
  const min = Number(raw.annualSalaryMin);
  const max = Number(raw.annualSalaryMax);
  if (!min && !max) return null;
  const currency = raw.salaryCurrency === 'USD' || !raw.salaryCurrency ? '$' : `${raw.salaryCurrency} `;
  /** @param {number} n */
  const k = (n) => `${currency}${Math.round(n / 1000)}k`;
  return min && max ? `${k(min)} – ${k(max)}` : k(min || max);
}

/** @param {any} raw */
function normalize(raw) {
  return makeJob({
    source: 'jobicy',
    sourceName: 'Jobicy',
    rawId: raw.id,
    title: raw.jobTitle,
    company: raw.companyName,
    companyLogo: raw.companyLogo,
    location: raw.jobGeo ? `Remote (${raw.jobGeo})` : 'Remote (USA)',
    remote: true,
    jobTypes: list(raw.jobType),
    tags: list(raw.jobIndustry),
    salary: salary(raw),
    level: raw.jobLevel && raw.jobLevel !== 'Any' ? raw.jobLevel : null,
    postedAt: toIsoDate(raw.pubDate),
    descriptionHtml: raw.jobDescription,
    url: raw.url,
  });
}

export const jobicy = {
  id: /** @type {const} */ ('jobicy'),
  name: 'Jobicy',
  /** @param {number} page 0-based; Jobicy returns one batch */
  async fetchPage(page) {
    if (page > 0) return { jobs: [], hasMore: false };
    const data = await fetchJsonCached(URL, CACHE_TTL_MS);
    return { jobs: (Array.isArray(data.jobs) ? data.jobs : []).map(normalize), hasMore: false };
  },
};
