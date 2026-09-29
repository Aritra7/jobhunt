import useLocalStorage from './useLocalStorage';
import { STATUS_IDS } from '../data/applicationStatuses';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { legacyTrackerEntries } from '../context/migrations';
import { cleanText, safeUrl, pickAllowed } from '../utils/sanitize';

const MAX_DESCRIPTION_CHARS = 8000;

function newId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

/**
 * Coerces stored/entered data into a valid Application.
 * @param {any} raw
 * @returns {import('../types').Application}
 */
function normalizeApplication(raw) {
  const status = pickAllowed(raw.status, STATUS_IDS, 'saved');
  const now = new Date().toISOString();
  return {
    id: typeof raw.id === 'string' ? raw.id : newId(),
    jobId: typeof raw.jobId === 'string' ? raw.jobId : null,
    title: cleanText(raw.title, 150).trim() || 'Untitled role',
    company: cleanText(raw.company, 120).trim() || 'Unknown company',
    location: cleanText(raw.location, 120).trim(),
    url: safeUrl(raw.url),
    sourceName: cleanText(raw.sourceName, 40) || 'Manual entry',
    descriptionText: cleanText(raw.descriptionText, MAX_DESCRIPTION_CHARS),
    status,
    notes: cleanText(raw.notes, 5000),
    reminder: cleanText(raw.reminder, 200),
    deadline: /^\d{4}-\d{2}-\d{2}$/.test(raw.deadline) ? raw.deadline : '',
    interviewAt: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(raw.interviewAt) ? raw.interviewAt.slice(0, 16) : '',
    checklist: raw.checklist && typeof raw.checklist === 'object' ? raw.checklist : {},
    history: Array.isArray(raw.history) && raw.history.length > 0 ? raw.history : [{ status, at: now }],
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : now,
    appliedAt: typeof raw.appliedAt === 'string' ? raw.appliedAt : (status === 'applied' ? now : null),
  };
}

// The user's tracked applications (saved jobs, status pipeline, notes, deadlines).
export default function useTracker() {
  // Nothing saved yet (null) -> start from data saved by earlier versions.
  const [applications, setApplications] = useLocalStorage(STORAGE_KEYS.tracker,
    /** @type {import('../types').Application[] | null} */ (null),
    raw => {
      const list = raw === null ? legacyTrackerEntries() : raw;
      return Array.isArray(list) ? list.filter(a => a && typeof a === 'object').map(normalizeApplication) : [];
    });

  /**
   * Starts tracking a job from search. No-op if it's already tracked.
   * @param {import('../types').Job} job
   * @param {import('../types').ApplicationStatus} [status]
   */
  const trackJob = (job, status = 'saved') => setApplications(prev =>
    prev.some(a => a.jobId === job.id) ? prev : [normalizeApplication({
      jobId: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      url: job.url,
      sourceName: job.sourceName,
      descriptionText: job.descriptionText,
      status,
    }), ...prev]);

  /** @param {Record<string, any>} fields */
  const addApplication = (fields) => setApplications(prev => [normalizeApplication(fields), ...prev]);

  /**
   * @param {string} id
   * @param {Partial<import('../types').Application>} patch
   */
  const updateApplication = (id, patch) => setApplications(prev => prev.map(app => {
    if (app.id !== id) return app;
    const next = normalizeApplication({ ...app, ...patch });
    if (patch.status && patch.status !== app.status) {
      const at = new Date().toISOString();
      next.history = [...app.history, { status: next.status, at }];
      if (next.status === 'applied' && !app.appliedAt) next.appliedAt = at;
    }
    return next;
  }));

  /**
   * Fills in fields for the application tracking this job (no status change).
   * @param {string} jobId
   * @param {Partial<import('../types').Application>} patch
   */
  const updateByJobId = (jobId, patch) => setApplications(prev => prev.map(app =>
    (app.jobId === jobId ? normalizeApplication({ ...app, ...patch }) : app)));

  /** @param {string} id */
  const removeApplication = (id) => setApplications(prev => prev.filter(a => a.id !== id));

  /** @param {string} jobId */
  const findByJobId = (jobId) => applications.find(a => a.jobId === jobId) || null;

  return { applications, trackJob, addApplication, updateApplication, updateByJobId, removeApplication, findByJobId };
}
