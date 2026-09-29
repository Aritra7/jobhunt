import { fetchJsonOnce } from './http';
import { safeUrl } from '../utils/sanitize';

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
