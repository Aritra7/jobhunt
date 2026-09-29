import useLocalStorage from './useLocalStorage';
import { cleanText } from '../utils/sanitize';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { defaultResume } from '../data/profile';
import { upgradeResume } from '../context/migrations';

/** @type {import('../types').Resume} */
export const EMPTY_RESUME = {
  contact: { name: '', email: '', phone: '', location: '', linkedin: '' },
  summary: '',
  skillsText: '',
  experience: [],
  education: [],
};

function newId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

/**
 * @param {any} raw
 * @returns {import('../types').Resume}
 */
function normalizeResume(raw) {
  if (!raw || typeof raw !== 'object') return EMPTY_RESUME;
  const c = raw.contact || {};
  return {
    contact: {
      name: cleanText(c.name, 100),
      email: cleanText(c.email, 120),
      phone: cleanText(c.phone, 40),
      location: cleanText(c.location, 100),
      linkedin: cleanText(c.linkedin, 200),
    },
    summary: cleanText(raw.summary, 1500),
    skillsText: cleanText(raw.skillsText, 1500),
    experience: (Array.isArray(raw.experience) ? raw.experience : []).map(e => ({
      id: typeof e.id === 'string' ? e.id : newId(),
      title: cleanText(e.title, 120),
      company: cleanText(e.company, 120),
      start: cleanText(e.start, 30),
      end: cleanText(e.end, 30),
      bulletsText: cleanText(e.bulletsText, 3000),
    })),
    education: (Array.isArray(raw.education) ? raw.education : []).map(e => ({
      id: typeof e.id === 'string' ? e.id : newId(),
      school: cleanText(e.school, 150),
      degree: cleanText(e.degree, 150),
      start: cleanText(e.start, 30),
      end: cleanText(e.end, 30),
    })),
  };
}

/** @param {import('../types').Resume} resume */
export function resumeSkills(resume) {
  return resume.skillsText.split(',').map(s => s.trim()).filter(Boolean);
}

/** @param {string} bulletsText */
export function bulletLines(bulletsText) {
  return bulletsText.split('\n').map(b => b.replace(/^\s*[-•*]\s*/, '').trim()).filter(Boolean);
}

/** @param {import('../types').Resume} resume */
export function resumeText(resume) {
  return [
    resume.summary,
    resume.skillsText,
    ...resume.experience.flatMap(e => [e.title, e.company, e.bulletsText]),
    ...resume.education.flatMap(e => [e.school, e.degree]),
  ].join('\n');
}

// The resume being built in Resume Tools, persisted across reloads.
export default function useResume() {
  const [resume, setResume] = useLocalStorage(STORAGE_KEYS.resume, defaultResume,
    raw => normalizeResume(upgradeResume(raw)));

  /** @param {(prev: import('../types').Resume) => any} updater */
  const updateResume = (updater) => setResume(prev => normalizeResume(updater(prev)));

  const addExperience = () => updateResume(r => ({
    ...r, experience: [...r.experience, { id: newId(), title: '', company: '', start: '', end: '', bulletsText: '' }],
  }));
  const addEducation = () => updateResume(r => ({
    ...r, education: [...r.education, { id: newId(), school: '', degree: '', start: '', end: '' }],
  }));

  return { resume, updateResume, addExperience, addEducation };
}
