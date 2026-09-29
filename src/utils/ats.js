import { SKILLS, CASE_SENSITIVE_SKILLS } from '../data/skills';
import { resumeSkills, resumeText } from '../hooks/useResume';

/** @param {string} s */
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Word-boundary matching that also works for names like "C++", "C#" and ".NET".
/**
 * @param {string[]} terms
 * @param {string} flags
 */
function termsPattern(terms, flags) {
  return new RegExp(`(^|[^A-Za-z0-9+#.])(${terms.map(escapeRegex).join('|')})(?=$|[^A-Za-z0-9+#])`, flags);
}

// Case-sensitive names (e.g. "Go") only match capitalized; their aliases
// (e.g. "golang") match in any case.
const SKILL_PATTERNS = SKILLS.map(([name, ...aliases]) => {
  const sensitive = CASE_SENSITIVE_SKILLS.has(name);
  const patterns = sensitive
    ? [termsPattern([name], ''), ...(aliases.length ? [termsPattern(aliases, 'i')] : [])]
    : [termsPattern([name, ...aliases], 'i')];
  return { name, patterns };
});

/**
 * @param {string} text
 * @returns {string[]} skill names found in the text
 */
export function extractSkills(text) {
  return SKILL_PATTERNS.filter(({ patterns }) => patterns.some(p => p.test(text))).map(({ name }) => name);
}

const KEYWORD_WEIGHT = 0.7;
const SECTIONS_WEIGHT = 0.3;

/**
 * @param {import('../types').Resume} resume
 */
export function sectionChecks(resume) {
  return [
    { label: 'Name and email', ok: resume.contact.name.trim() !== '' && /\S+@\S+\.\S+/.test(resume.contact.email) },
    { label: 'Summary', ok: resume.summary.trim().split(/\s+/).length >= 15 },
    { label: 'Skills (5+)', ok: resumeSkills(resume).length >= 5 },
    { label: 'Experience with bullets', ok: resume.experience.some(e => e.bulletsText.trim() !== '') },
    { label: 'Education', ok: resume.education.some(e => e.school.trim() !== '') },
  ];
}

/**
 * Approximates how an applicant tracking system would rank the resume for a job:
 * mostly keyword coverage, partly whether standard sections are present.
 * @param {import('../types').Resume} resume
 * @param {string} jobDescription
 */
export function atsScore(resume, jobDescription) {
  const wanted = extractSkills(jobDescription);
  const have = new Set(extractSkills(resumeText(resume)).map(s => s.toLowerCase()));
  // Skills typed in the skills list count even if they aren't in the dictionary.
  resumeSkills(resume).forEach(s => have.add(s.toLowerCase()));

  const matched = wanted.filter(s => have.has(s.toLowerCase()));
  const missing = wanted.filter(s => !have.has(s.toLowerCase()));
  const sections = sectionChecks(resume);

  const keywordRatio = wanted.length === 0 ? 0 : matched.length / wanted.length;
  const sectionRatio = sections.filter(s => s.ok).length / sections.length;
  const score = Math.round(100 * (KEYWORD_WEIGHT * keywordRatio + SECTIONS_WEIGHT * sectionRatio));

  return { score, matched, missing, sections, keywordsFound: wanted.length };
}
