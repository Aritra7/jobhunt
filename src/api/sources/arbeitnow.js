import { fetchJsonOnce } from '../http';
import { makeJob, toIsoDate } from '../jobModel';

// Free, keyless, updated hourly. ~300 jobs per page, mostly Europe + remote.
// Terms ask for a link back, which every job card/detail provides.
const BASE_URL = 'https://www.arbeitnow.com/api/job-board-api';

/** @param {any} raw */
function normalize(raw) {
  const types = Array.isArray(raw.job_types) ? raw.job_types : [];
  const isEntry = types.some(t => /entry|berufseinstieg|no experience/i.test(String(t)));
  return makeJob({
    source: 'arbeitnow',
    sourceName: 'Arbeitnow',
    rawId: raw.slug,
    title: raw.title,
    company: raw.company_name,
    location: raw.location,
    remote: Boolean(raw.remote),
    jobTypes: types,
    tags: raw.tags,
    level: isEntry ? 'Entry Level' : null,
    postedAt: toIsoDate(new Date(Number(raw.created_at) * 1000).toISOString()),
    descriptionHtml: raw.description,
    url: raw.url,
  });
}

export const arbeitnow = {
  id: /** @type {const} */ ('arbeitnow'),
  name: 'Arbeitnow',
  /** @param {number} page 0-based */
  async fetchPage(page) {
    const data = await fetchJsonOnce(`${BASE_URL}?page=${page + 1}`);
    return {
      jobs: (Array.isArray(data.data) ? data.data : []).map(normalize),
      hasMore: Boolean(data.links && data.links.next),
    };
  },
};
