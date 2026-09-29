import useLocalStorage from './useLocalStorage';
import { JOB_TYPES } from '../api/jobModel';
import { cleanText, pickAllowed } from '../utils/sanitize';

const STORAGE_KEY = 'jobfind.profile';
const WORK_MODES = /** @type {const} */ (['any', 'remote', 'onsite']);

/**
 * Accepts anything (including profiles saved by older versions) and returns a valid Profile.
 * @param {any} raw
 * @returns {import('../types').Profile | null}
 */
function normalizeProfile(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    keywords: (Array.isArray(raw.keywords) ? raw.keywords : [])
      .map(k => cleanText(k, 60).trim())
      .filter(Boolean)
      .slice(0, 15),
    preferredLocation: cleanText(raw.preferredLocation, 80).trim(),
    workMode: pickAllowed(raw.workMode, WORK_MODES, 'any'),
    jobTypes: (Array.isArray(raw.jobTypes) ? raw.jobTypes : []).filter(t => JOB_TYPES.includes(t)),
  };
}

// The user's saved job preferences, persisted across reloads.
export default function useProfile() {
  const [profile, setProfile] = useLocalStorage(STORAGE_KEY, /** @type {import('../types').Profile | null} */ (null), normalizeProfile);

  /**
   * @param {any} next
   * @returns {import('../types').Profile | null} the profile as saved
   */
  const saveProfile = (next) => {
    const normalized = normalizeProfile(next);
    setProfile(normalized);
    return normalized;
  };
  const clearProfile = () => setProfile(null);

  const hasProfile = !!profile && (
    profile.keywords.length > 0 || profile.preferredLocation !== '' ||
    profile.workMode !== 'any' || profile.jobTypes.length > 0
  );

  return { profile, hasProfile, saveProfile, clearProfile };
}
