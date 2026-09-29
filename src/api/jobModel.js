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
 *   title: unknown, company: unknown, companyLogo?: unknown, museCompanyId?: unknown,
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

  return {
    id: `${fields.source}:${fields.rawId}`,
    source: fields.source,
    sourceName: fields.sourceName,
    title,
    company,
    companyLogo: safeUrl(str(fields.companyLogo)),
    museCompanyId: fields.museCompanyId != null ? String(fields.museCompanyId) : null,
    location,
    remote: fields.remote,
    jobTypes: normalizeJobTypes(fields.jobTypes),
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
 * @param {string} value
 * @returns {string}
 */
export function toIsoDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date(0).toISOString() : date.toISOString();
}
