// Rule-based resume bullet review. No AI: each rule is a common recruiter guideline.

const WEAK_OPENERS = [
  'responsible for', 'worked on', 'helped', 'assisted', 'participated in', 'involved in',
  'tasked with', 'duties included', 'in charge of', 'did', 'was', 'were', 'handled',
];

const STRONG_VERBS = [
  'Built', 'Designed', 'Led', 'Launched', 'Implemented', 'Automated', 'Reduced', 'Increased',
  'Improved', 'Optimized', 'Shipped', 'Developed', 'Migrated', 'Created', 'Delivered', 'Streamlined',
];

const FIRST_PERSON = /\b(i|me|my|we|our|us)\b/i;
const HAS_METRIC = /\d|%|\$/;
const MIN_WORDS = 8;
const MAX_WORDS = 35;

/**
 * @param {string} bullet
 * @returns {{ id: string, message: string }[]} issues, empty if the bullet looks good
 */
export function checkBullet(bullet) {
  const text = bullet.trim();
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const issues = [];

  const weak = WEAK_OPENERS.find(w => lower.startsWith(w + ' ') || lower === w);
  if (weak) {
    issues.push({ id: 'weak-opener', message: `Starts with "${weak}". Lead with a strong action verb, e.g. ${STRONG_VERBS.slice(0, 4).join(', ')}.` });
  }
  if (!HAS_METRIC.test(text)) {
    issues.push({ id: 'no-metric', message: 'No number. Quantify the impact (users, %, time saved, $, size).' });
  }
  if (FIRST_PERSON.test(text)) {
    issues.push({ id: 'first-person', message: 'Uses first person (I/my/we). Resume bullets drop the pronoun.' });
  }
  if (words.length < MIN_WORDS) {
    issues.push({ id: 'too-short', message: `Only ${words.length} words. Add what you did, how, and the result.` });
  }
  if (words.length > MAX_WORDS) {
    issues.push({ id: 'too-long', message: `${words.length} words. Aim for under ${MAX_WORDS} so it fits on 1–2 lines.` });
  }
  if (/^[a-z]/.test(text)) {
    issues.push({ id: 'lowercase', message: 'Starts with a lowercase letter.' });
  }
  if (/ {2,}/.test(text)) {
    issues.push({ id: 'double-space', message: 'Contains double spaces.' });
  }
  const repeated = lower.match(/\b(\w{3,})\s+\1\b/);
  if (repeated) {
    issues.push({ id: 'repeated-word', message: `Repeated word: "${repeated[1]}".` });
  }
  return issues;
}

/**
 * Formatting consistency across all bullets (e.g. mixed trailing periods).
 * @param {string[]} bullets
 * @returns {string[]}
 */
export function checkConsistency(bullets) {
  const notes = [];
  const withPeriod = bullets.filter(b => b.trim().endsWith('.')).length;
  if (withPeriod > 0 && withPeriod < bullets.length) {
    notes.push(`${withPeriod} of ${bullets.length} bullets end with a period. Pick one style and use it everywhere.`);
  }
  return notes;
}
