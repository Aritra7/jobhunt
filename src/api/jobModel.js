import { htmlToText, safeUrl } from '../utils/sanitize';

export const JOB_TYPES = ['Full time', 'Part time', 'Contract', 'Internship', 'Freelance'];

// Sources label job types inconsistently ("Full-time", "fulltime permanent",
// "CDI", "Working student"...). Order matters: first match wins.
/** @type {[RegExp, string][]} */
const JOB_TYPE_RULES = [
  [/intern|trainee|working student|student/, 'Internship'],
  [/freelance/, 'Freelance'],
  [/contract|fixed.?term|temporary/, 'Contract'],
  [/part/, 'Part time'],
  [/full|permanent|cdi|unbefristet/, 'Full time'],
];

/** @param {string} raw */
function normalizeJobType(raw) {
  const value = raw.toLowerCase().replace(/[_-]/g, ' ');
  const types = JOB_TYPE_RULES.filter(([pattern]) => pattern.test(value)).map(([, type]) => type);
  // "Full or part time" legitimately maps to both.
  return value.includes('full') && value.includes('part') ? ['Full time', 'Part time'] : types.slice(0, 1);
}

/**
 * @param {unknown} list
 * @returns {string[]}
 */
function normalizeJobTypes(list) {
  if (!Array.isArray(list)) return [];
  return [...new Set(list.filter(v => typeof v === 'string').flatMap(normalizeJobType))];
}

const ESCAPED_TAG = /&lt;\/?[a-z][a-z0-9]*(\s[^&]*)?&gt;/i;

/**
 * Some sources double-encode their HTML ("&lt;p&gt;"), which would show up as
 * literal tags. Decode one level so it renders as formatting. The result is
 * still untrusted and is sanitized before display like any other description.
 * @param {string} html
 */
export function decodeEscapedHtml(html) {
  if (!ESCAPED_TAG.test(html)) return html;
  return new DOMParser().parseFromString(html, 'text/html').body.textContent || '';
}

/** @param {unknown} value */
function str(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Builds a normalized Job from source fields. Every source adapter funnels
 * through here so the rest of the app only knows one job shape.
 * @param {{
 *   source: import('../types').JobSourceId, sourceName: string, rawId: string | number,
 *   title: unknown, company: unknown, companyLogo?: unknown,
 *   companyProfile?: import('../types').Job['companyProfile'], detailsKey?: string | null,
 *   location: unknown, remote: boolean, jobTypes?: unknown, tags?: unknown,
 *   salary?: unknown, level?: unknown, postedAt: string, descriptionHtml: unknown, url: unknown
 * }} fields
 * @returns {import('../types').Job}
 */
export function makeJob(fields) {
  const title = str(fields.title) || 'Untitled role';
  const company = str(fields.company) || 'Unknown company';
  const location = str(fields.location) || (fields.remote ? 'Remote' : 'Location not listed');
  const tags = Array.isArray(fields.tags) ? fields.tags.filter(t => typeof t === 'string').map(t => t.trim()).filter(Boolean) : [];
  const descriptionHtml = decodeEscapedHtml(str(fields.descriptionHtml));
  const descriptionText = htmlToText(descriptionHtml);
  const jobTypes = normalizeJobTypes(fields.jobTypes);

  return {
    id: `${fields.source}:${fields.rawId}`,
    source: fields.source,
    sourceName: fields.sourceName,
    title,
    company,
    companyLogo: safeUrl(str(fields.companyLogo)),
    companyProfile: fields.companyProfile || null,
    detailsKey: fields.detailsKey || null,
    location,
    remote: fields.remote,
    regions: detectRegions(location, fields.remote),
    jobTypes: jobTypes.length > 0 ? jobTypes : inferJobTypesFromTitle(title),
    tags,
    salary: str(fields.salary) || null,
    level: str(fields.level) || null,
    postedAt: fields.postedAt,
    descriptionHtml,
    descriptionText,
    searchText: [title, company, location, tags.join(' '), descriptionText].join(' ').toLowerCase(),
    url: safeUrl(str(fields.url)),
  };
}

/**
 * Returns a copy of the job with its full description filled in
 * (for sources that only send descriptions on request).
 * @param {import('../types').Job} job
 * @param {string} descriptionHtml
 * @param {string[]} [extraTags]
 * @returns {import('../types').Job}
 */
export function withDescription(job, descriptionHtml, extraTags = []) {
  const html = decodeEscapedHtml(descriptionHtml);
  const descriptionText = htmlToText(html);
  const tags = [...new Set([...job.tags, ...extraTags.filter(Boolean)])];
  return {
    ...job,
    tags,
    descriptionHtml: html,
    descriptionText,
    detailsKey: null,
    searchText: [job.title, job.company, job.location, tags.join(' '), descriptionText].join(' ').toLowerCase(),
  };
}

/**
 * Sources without an explicit job type still say "Intern" or "Contract" in the title.
 * @param {string} title
 */
function inferJobTypesFromTitle(title) {
  if (/\bintern(ship)?\b|co-?op\b/i.test(title)) return ['Internship'];
  if (/\bcontract(or)?\b/i.test(title)) return ['Contract'];
  if (/\bpart[- ]time\b/i.test(title)) return ['Part time'];
  return [];
}

// ---- Regions -------------------------------------------------------------

const US_STATES = 'AL|AK|AZ|AR|CA|CO|CT|DE|DC|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY';
const US_PATTERN = new RegExp(
  `\\b(United States|USA|U\\.S\\.A?\\.?|US|Americas?|North America|Northern America)\\b|,\\s*(${US_STATES})\\b|` +
  '\\b(San Francisco|New York|NYC|Seattle|Austin|Boston|Chicago|Los Angeles|Denver|Atlanta|Pittsburgh|' +
  'Washington|Palo Alto|Mountain View|Menlo Park|Sunnyvale|San Jose|Cupertino|Bellevue|Miami|Dallas|Houston|' +
  'Philadelphia|Portland|San Diego|Salt Lake City|Phoenix|Minneapolis|Detroit|Nashville|Raleigh|Remote - US)\\b'
);
const EUROPE_PATTERN = new RegExp(
  '\\b(UK|United Kingdom|England|Scotland|Ireland|Europe|EMEA|EU|Germany|Deutschland|France|Netherlands|Spain|' +
  'Italy|Switzerland|Austria|Belgium|Sweden|Norway|Denmark|Finland|Poland|Portugal|Czechia|Czech Republic|' +
  'London|Manchester|Birmingham|Edinburgh|Glasgow|Leeds|Bristol|Dublin|Berlin|Munich|München|Hamburg|' +
  'Frankfurt|Cologne|Köln|Düsseldorf|Stuttgart|Leipzig|Paris|Lyon|Amsterdam|Rotterdam|Madrid|Barcelona|' +
  'Milan|Rome|Zurich|Zürich|Geneva|Vienna|Wien|Brussels|Stockholm|Oslo|Copenhagen|Helsinki|Warsaw|Krakow|' +
  'Lisbon|Prague)\\b', 'i'
);
const WORLDWIDE_PATTERN = /\b(worldwide|anywhere|global)\b/i;

/**
 * Which regions a job is open to, based on its location text.
 * @param {string} location
 * @param {boolean} remote
 * @returns {('us' | 'europe' | 'worldwide')[]}
 */
export function detectRegions(location, remote) {
  /** @type {('us' | 'europe' | 'worldwide')[]} */
  const regions = [];
  if (US_PATTERN.test(location)) regions.push('us');
  if (EUROPE_PATTERN.test(location)) regions.push('europe');
  if (remote && WORLDWIDE_PATTERN.test(location)) regions.push('worldwide');
  return regions;
}

/**
 * @param {string} value
 * @returns {string}
 */
export function toIsoDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date(0).toISOString() : date.toISOString();
}
