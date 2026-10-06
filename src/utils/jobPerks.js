// Visa sponsorship and benefits, detected from a job's description text.
// Rule-based: each pattern is a phrase postings commonly use.

// Checked first: "no sponsorship available" also contains "sponsorship available".
const NO_SPONSORSHIP = [
  /\bno (visa )?sponsorship\b/i,
  /\b(not|unable to|cannot|can't|won't|will not|do not|does not|don't|doesn't) (offer |provide |support )?(visa |immigration |employment visa )?sponsor/i,
  /\bwithout (the need for |requiring |needing )?(current or future )?(visa |employment )?sponsorship\b/i,
  /\bsponsorship (is )?not (available|offered|provided)\b/i,
  /\b(us|u\.s\.) citizens?( or permanent residents?)? only\b/i,
];

const SPONSORSHIP_OFFERED = [
  /\bvisa sponsorship (is )?(available|offered|provided)\b/i,
  /\b(we |will |can |happy to |able to )sponsor\b/i,
  /\bsponsorship (is )?available\b/i,
  /\bh-?1b (sponsorship|transfers?)\b/i,
  /\bopen to sponsoring\b/i,
  /\bvisa support\b/i,
];

/** @type {[string, RegExp][]} */
export const BENEFITS = [
  ["Health insurance", /\b(health|medical|dental|vision) (insurance|coverage|benefits|plans?)\b/i],
  ["401(k) / retirement", /\b401\s?\(?k\)?|\bretirement (plan|match|savings)\b|\bpension\b/i],
  [
    "Paid time off",
    /\bpaid time off\b|\bPTO\b|\bunlimited (vacation|pto)\b|\bpaid (vacation|holidays)\b/i,
  ],
  ["Parental leave", /\b(parental|maternity|paternity|family) leave\b/i],
  ["Equity", /\bequity\b|\bstock options?\b|\bRSUs?\b/],
  ["Bonus", /\b(annual|performance|signing|sign-on) bonus\b/i],
  [
    "Learning budget",
    /\b(learning|education|professional development) (budget|stipend|allowance)\b|\btuition (reimbursement|assistance)\b/i,
  ],
  ["Remote stipend", /\b(home office|remote work|wfh|equipment) (stipend|allowance|budget)\b/i],
  ["Relocation", /\brelocation (assistance|support|package|bonus)\b/i],
  [
    "Wellness",
    /\bwellness (stipend|program|budget)\b|\bgym (membership|stipend)\b|\bmental health\b/i,
  ],
];

/** The sentence around a match, as evidence for the user. */
function sentenceAround(text, index) {
  const start = Math.max(text.lastIndexOf(".", index), text.lastIndexOf("\n", index)) + 1;
  const ends = [text.indexOf(".", index), text.indexOf("\n", index)].filter((i) => i >= 0);
  const end = ends.length ? Math.min(...ends) + 1 : text.length;
  return text.slice(start, end).trim();
}

function firstMatch(patterns, text) {
  for (const pattern of patterns) {
    const m = pattern.exec(text);
    if (m) return m;
  }
  return null;
}

/**
 * { status: "offered" | "not-offered" | "unknown", evidence } from the text.
 * "unknown" means the posting doesn't say; it is not the same as "no".
 */
export function detectSponsorship(text = "") {
  const no = firstMatch(NO_SPONSORSHIP, text);
  if (no) return { status: "not-offered", evidence: sentenceAround(text, no.index) };
  const yes = firstMatch(SPONSORSHIP_OFFERED, text);
  if (yes) return { status: "offered", evidence: sentenceAround(text, yes.index) };
  return { status: "unknown", evidence: "" };
}

/** Benefit labels the description mentions. */
export function detectBenefits(text = "") {
  return BENEFITS.filter(([, pattern]) => pattern.test(text)).map(([label]) => label);
}

export function detectPerks(text = "") {
  return { sponsorship: detectSponsorship(text), benefits: detectBenefits(text) };
}

export const SPONSORSHIP_LABELS = {
  offered: "Sponsors visas",
  "not-offered": "No visa sponsorship",
  unknown: "Sponsorship not mentioned",
};
