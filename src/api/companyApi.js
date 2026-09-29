import { fetchJsonOnce } from './http';
import { safeUrl, htmlToText } from '../utils/sanitize';

/**
 * @typedef {Object} CompanyInfo
 * @property {string} name
 * @property {string} description
 * @property {string[]} industries
 * @property {string} size
 * @property {string[]} locations
 * @property {string | null} url
 */

/**
 * Company profile from The Muse (only Muse jobs carry a company id).
 * @param {string} museCompanyId
 * @returns {Promise<CompanyInfo>}
 */
export async function fetchMuseCompany(museCompanyId) {
  const id = encodeURIComponent(museCompanyId);
  const raw = await fetchJsonOnce(`https://www.themuse.com/api/public/companies/${id}`);
  return {
    name: String(raw.name || ''),
    description: String(raw.description || ''),
    industries: (Array.isArray(raw.industries) ? raw.industries : []).map(i => String(i.name)),
    size: raw.size && raw.size.name ? String(raw.size.name) : '',
    locations: (Array.isArray(raw.locations) ? raw.locations : []).map(l => String(l.name)),
    url: safeUrl(raw.refs && raw.refs.landing_page),
  };
}

const MAX_ABOUT_CHARS = 700;

/**
 * "About the company" text from a Greenhouse job board.
 * @param {string} board
 * @returns {Promise<CompanyInfo>}
 */
export async function fetchGreenhouseCompany(board) {
  const raw = await fetchJsonOnce(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(board)}`);
  const about = htmlToText(String(raw.content || ''));
  return {
    name: String(raw.name || board),
    description: about.length > MAX_ABOUT_CHARS ? about.slice(0, MAX_ABOUT_CHARS).trimEnd() + '…' : about,
    industries: [],
    size: '',
    locations: [],
    url: safeUrl(`https://boards.greenhouse.io/${encodeURIComponent(board)}`),
  };
}

/**
 * @param {{ source: 'muse' | 'greenhouse', id: string }} profile
 * @returns {Promise<CompanyInfo>}
 */
export function fetchCompanyProfile(profile) {
  return profile.source === 'muse' ? fetchMuseCompany(profile.id) : fetchGreenhouseCompany(profile.id);
}
