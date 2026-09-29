import { fetchJsonOnce } from '../http';
import { makeJob, toIsoDate, withDescription } from '../jobModel';

// Greenhouse powers the careers pages of many US tech companies. Its public
// Job Board API is free, keyless and browser-friendly. Lists are fetched
// without descriptions (they're ~18x larger); a job's description is loaded
// when it's opened or tracked.
const API = 'https://boards-api.greenhouse.io/v1/boards';

// Board tokens (the name in boards.greenhouse.io/<token>). Mostly US-heavy.
export const GREENHOUSE_BOARDS = [
  'airbnb', 'stripe', 'figma', 'duolingo', 'robinhood', 'reddit', 'discord', 'dropbox',
  'pinterest', 'lyft', 'coinbase', 'databricks', 'gitlab', 'instacart', 'asana', 'twilio',
  'affirm', 'squarespace', 'datadog', 'mongodb', 'okta', 'roblox', 'anthropic', 'scaleai',
  'brex', 'gusto', 'chime', 'samsara', 'vercel', 'webflow', 'elastic', 'flexport',
];
const BOARDS_PER_PAGE = 8;

/**
 * @param {any} raw
 * @param {string} board
 */
function normalize(raw, board) {
  const location = raw.location && raw.location.name ? String(raw.location.name) : '';
  return makeJob({
    source: 'greenhouse',
    sourceName: 'Greenhouse',
    rawId: `${board}-${raw.id}`,
    title: raw.title,
    company: raw.company_name || board,
    companyProfile: { source: 'greenhouse', id: board },
    detailsKey: `${board}/${raw.id}`,
    location,
    remote: /remote/i.test(location),
    postedAt: toIsoDate(raw.first_published || raw.updated_at),
    descriptionHtml: '',
    url: raw.absolute_url,
  });
}

/** @param {string} board */
async function fetchBoard(board) {
  const data = await fetchJsonOnce(`${API}/${encodeURIComponent(board)}/jobs`);
  return (Array.isArray(data.jobs) ? data.jobs : []).map(raw => normalize(raw, board));
}

export const greenhouse = {
  id: /** @type {const} */ ('greenhouse'),
  name: 'Greenhouse',
  /** @param {number} page 0-based; each page is a batch of company boards */
  async fetchPage(page) {
    const boards = GREENHOUSE_BOARDS.slice(page * BOARDS_PER_PAGE, (page + 1) * BOARDS_PER_PAGE);
    // One company's board failing shouldn't hide everyone else's jobs.
    const results = await Promise.allSettled(boards.map(fetchBoard));
    const jobs = results.flatMap(r => (r.status === 'fulfilled' ? r.value : []));
    if (boards.length > 0 && jobs.length === 0) throw new Error('No company boards responded');
    return { jobs, hasMore: (page + 1) * BOARDS_PER_PAGE < GREENHOUSE_BOARDS.length };
  },
  /**
   * @param {import('../../types').Job} job
   * @returns {Promise<import('../../types').Job>}
   */
  async fetchDetails(job) {
    const [board, id] = String(job.detailsKey).split('/');
    const raw = await fetchJsonOnce(`${API}/${encodeURIComponent(board)}/jobs/${encodeURIComponent(id)}`);
    const departments = (Array.isArray(raw.departments) ? raw.departments : []).map(d => String(d.name || ''));
    return withDescription(job, String(raw.content || ''), departments);
  },
};
