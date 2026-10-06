// Rule-based grammar and formatting checks for resume bullets. They catch the
// mistakes recruiters notice most: mis-cased tech names, a/an, spacing,
// present-tense openers and inconsistent date formats.

// Official spelling of common tech terms, keyed by lowercase.
const TERMS = Object.fromEntries(
  [
    "JavaScript",
    "TypeScript",
    "Node.js",
    "GitHub",
    "GitLab",
    "PostgreSQL",
    "MySQL",
    "MongoDB",
    "AWS",
    "GCP",
    "SQL",
    "HTML",
    "CSS",
    "iOS",
    "LinkedIn",
    "Python",
    "Kubernetes",
    "Docker",
    "GraphQL",
    "FastAPI",
    "PyTorch",
    "TensorFlow",
    "NumPy",
    "Redis",
    "React",
    "Django",
    "Kafka",
  ].map((t) => [t.toLowerCase(), t]),
);
const TERM_ALIASES = {
  nodejs: "Node.js",
  reactjs: "React",
  postgres: "PostgreSQL",
  github: "GitHub",
};
// Words that are also ordinary English, only checked when they look like a name.
const COMMON_WORDS = new Set(["react", "python", "docker", "redis"]);

// Present-tense openers and their past tense (bullets describe past work).
const PAST = {
  build: "Built",
  create: "Created",
  deploy: "Deployed",
  design: "Designed",
  develop: "Developed",
  implement: "Implemented",
  improve: "Improved",
  lead: "Led",
  maintain: "Maintained",
  manage: "Managed",
  optimize: "Optimized",
  own: "Owned",
  reduce: "Reduced",
  run: "Ran",
  ship: "Shipped",
  use: "Used",
  work: "Worked",
  write: "Wrote",
};

// "a"/"an" go by sound, so a few words are exceptions to the vowel rule.
const A_EXCEPTIONS = /^(uni|use|usa|user|util|one|once|eu|ur)/i;
const AN_EXCEPTIONS = /^(hour|honest|honor|heir)/i;

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function termIssues(text) {
  const issues = [];
  const words = text.match(/[A-Za-z][A-Za-z0-9.+#-]*[A-Za-z0-9]|[A-Za-z]/g) || [];
  for (const word of new Set(words)) {
    const key = word.toLowerCase().replace(/\.$/, "");
    const correct = TERM_ALIASES[key] || TERMS[key];
    if (!correct || word === correct) continue;
    // "react to feedback" is fine; only lowercase variants of names in the middle
    // of a sentence that are clearly words are skipped.
    if (COMMON_WORDS.has(key) && word === key) continue;
    issues.push(`Write "${correct}", not "${word}".`);
  }
  return issues;
}

/** Grammar and formatting problems in one bullet (empty if none). */
export function checkGrammar(bullet) {
  const text = bullet.trim();
  if (!text) return [];
  const issues = termIssues(text);

  const first = text.split(/\s+/)[0].replace(/[^A-Za-z]/g, "");
  const base = first.toLowerCase().replace(/s$/, "");
  if (PAST[first.toLowerCase()] || (first.toLowerCase().endsWith("s") && PAST[base])) {
    const past = PAST[first.toLowerCase()] || PAST[base];
    issues.push(`Starts with "${first}". Use the past tense for past work: "${past}".`);
  }

  for (const m of text.matchAll(/\ba ([A-Za-z]+)/g)) {
    const next = m[1];
    const vowelSound = /^[aeiou]/i.test(next) ? !A_EXCEPTIONS.test(next) : AN_EXCEPTIONS.test(next);
    if (vowelSound && next !== next.toUpperCase()) {
      issues.push(`Use "an" before "${next}".`);
    }
  }
  for (const m of text.matchAll(/\ban ([A-Za-z]+)/g)) {
    const next = m[1];
    const consonantSound = /^[aeiou]/i.test(next)
      ? A_EXCEPTIONS.test(next)
      : !AN_EXCEPTIONS.test(next);
    if (consonantSound && next !== next.toUpperCase()) {
      issues.push(`Use "a" before "${next}".`);
    }
  }

  if (/\bi\b/.test(text)) issues.push('Capitalize "I" (or drop first person).');
  if (/,(?=[A-Za-z])/.test(text)) issues.push("Add a space after each comma.");
  if (/\s[,.;:!?]/.test(text)) issues.push("Remove the space before punctuation.");
  if (/[!?]/.test(text)) issues.push("Avoid exclamation and question marks in bullets.");
  return issues;
}

/** Date styles used in a resume's entries ("Jun 2025", "06/2025", "2025", …). */
function dateStyle(date) {
  const d = date.trim();
  if (!d || /^(present|current|now)$/i.test(d)) return null;
  if (/^[A-Za-z]{3}\.? \d{4}$/.test(d)) return "Jun 2025";
  if (/^[A-Za-z]{4,} \d{4}$/.test(d)) return "June 2025";
  if (/^\d{1,2}\/\d{4}$/.test(d)) return "06/2025";
  if (/^\d{4}$/.test(d)) return "2025";
  return "other";
}

/** A note when entries mix date formats, or null. */
export function checkDateFormats(dates) {
  const styles = new Set(dates.map(dateStyle).filter(Boolean));
  if (styles.size <= 1) return null;
  return `Dates use ${styles.size} formats (${[...styles].join(", ")}). Pick one, e.g. "Jun 2025".`;
}

/** Fixes the issues that have one clear answer (term casing, comma spacing). */
export function autoFix(bullet) {
  let fixed = bullet;
  for (const [wrong, right] of Object.entries({ ...TERMS, ...TERM_ALIASES })) {
    if (COMMON_WORDS.has(wrong)) continue;
    fixed = fixed.replace(new RegExp(`\\b${escapeRegex(wrong)}\\b`, "gi"), right);
  }
  return fixed.replace(/\s+([,.;:])/g, "$1").replace(/,(?=[A-Za-z])/g, ", ");
}
