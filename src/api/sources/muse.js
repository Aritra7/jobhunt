import { fetchJsonOnce } from '../http';
import { makeJob, toIsoDate } from '../jobModel';

// Free, keyless, large and US-focused, but its public feed is not always fresh -
// every card shows the posted date so users can judge that themselves.
const BASE_URL = 'https://www.themuse.com/api/public/jobs';
export const MUSE_CATEGORIES = [
  'Software Engineering',
  'Data and Analytics',
  'Design and UX',
  'Product Management',
  'Project Management',
];
// The Muse returns 20 jobs per page; fetch a few per "load more".
const MUSE_PAGES_PER_BATCH = 3;

/** @param {any} raw */
function normalize(raw) {
  const locations = (Array.isArray(raw.locations) ? raw.locations : []).map(l => String(l.name || '')).filter(Boolean);
  const levels = (Array.isArray(raw.levels) ? raw.levels : []).map(l => String(l.name || ''));
  const remote = locations.some(l => /remote|flexible/i.test(l));
  return makeJob({
    source: 'muse',
    sourceName: 'The Muse',
    rawId: raw.id,
    title: raw.name,
    company: raw.company && raw.company.name,
    museCompanyId: raw.company && raw.company.id,
    location: locations.slice(0, 3).join(' · ') + (locations.length > 3 ? ` +${locations.length - 3} more` : ''),
    remote,
    jobTypes: levels.includes('Internship') ? ['Internship'] : [],
    tags: (Array.isArray(raw.categories) ? raw.categories : []).map(c => c.name),
    level: levels[0] || null,
    postedAt: toIsoDate(raw.publication_date),
    descriptionHtml: raw.contents,
    url: raw.refs && raw.refs.landing_page,
  });
}

/** @param {number} musePage */
function pageUrl(musePage) {
  const params = new URLSearchParams({ page: String(musePage), descending: 'true' });
  MUSE_CATEGORIES.forEach(c => params.append('category', c));
  return `${BASE_URL}?${params}`;
}

export const muse = {
  id: /** @type {const} */ ('muse'),
  name: 'The Muse',
  /** @param {number} page 0-based batch index */
  async fetchPage(page) {
    const first = page * MUSE_PAGES_PER_BATCH;
    const pages = await Promise.all(
      Array.from({ length: MUSE_PAGES_PER_BATCH }, (_, i) => fetchJsonOnce(pageUrl(first + i)))
    );
    const last = pages[pages.length - 1];
    return {
      jobs: pages.flatMap(p => (Array.isArray(p.results) ? p.results : []).map(normalize)),
      hasMore: typeof last.page_count === 'number' && first + MUSE_PAGES_PER_BATCH < last.page_count,
    };
  },
};
