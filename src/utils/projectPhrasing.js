import { checkBullet } from "./bulletCheck";
import { ROLES, roleById } from "../data/roleStyles";

// Rule-based phrasing of a project for a role (SDE, FDE, AI, MLE). Drafts only
// reuse facts the user entered: no numbers or technologies are invented.

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const stripPeriod = (s) => s.trim().replace(/\.+$/, "");
const joinList = (items) =>
  items.length <= 1 ? items[0] || "" : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;

export function projectText(project) {
  return [
    project.title,
    project.oneLiner,
    project.problem,
    project.approach,
    project.contribution,
    project.impact,
    project.users,
    project.tech.join(" "),
    project.domains.join(" "),
    project.metrics.join(" "),
  ].join(" ");
}

/** Role keywords that appear in the project (word-start matches). */
export function keywordHits(project, roleId) {
  const text = projectText(project);
  return roleById(roleId).keywords.filter((kw) =>
    new RegExp(`\\b${escapeRegex(kw)}`, "i").test(text),
  );
}

/** 0 (no fit) to 3 (strong fit), from how many role keywords the project hits. */
export function autoFit(project, roleId) {
  const hits = keywordHits(project, roleId).length;
  if (hits === 0) return 0;
  if (hits <= 2) return 1;
  if (hits <= 4) return 2;
  return 3;
}

/** The user's own fit score for the role if set, otherwise the automatic one. */
export function roleFit(project, roleId) {
  const manual = project.roleFit?.[roleId];
  return Number.isInteger(manual) ? manual : autoFit(project, roleId);
}

/** Up to three of the project's technologies, the most role-relevant first. */
export function techForRole(project, roleId) {
  const keywords = roleById(roleId).keywords;
  const relevance = (tech) => keywords.filter((kw) => tech.toLowerCase().includes(kw)).length;
  return [...project.tech].sort((a, b) => relevance(b) - relevance(a)).slice(0, 3);
}

// "cut wait time by 40%" -> "cutting wait time by 40%", to follow a comma.
const GERUNDS = {
  achieved: "achieving",
  answered: "answering",
  boosted: "boosting",
  cut: "cutting",
  doubled: "doubling",
  flagged: "flagging",
  halved: "halving",
  handled: "handling",
  improved: "improving",
  increased: "increasing",
  lifted: "lifting",
  processed: "processing",
  raised: "raising",
  reached: "reaching",
  reduced: "reducing",
  removed: "removing",
  saved: "saving",
  scaled: "scaling",
  served: "serving",
  survived: "surviving",
  sustained: "sustaining",
};

export function resultClause(metric) {
  if (!metric) return "";
  const [first, ...rest] = metric.trim().split(/\s+/);
  const gerund = GERUNDS[first.toLowerCase()];
  return gerund ? `${gerund} ${rest.join(" ")}` : `with ${stripPeriod(metric)}`;
}

const withResult = (sentence, metric) =>
  metric ? `${sentence}, ${stripPeriod(resultClause(metric))}` : sentence;

/**
 * Draft bullets for one role. The lead bullet changes with the role: SDE and
 * AI/ML lead with the tech, FDE with who it was for. The second bullet comes
 * from "My contribution" plus the next metric.
 */
export function draftBullets(project, roleId) {
  const role = roleById(roleId);
  const what = `${project.title}, ${stripPeriod(project.oneLiner)}`;
  const tech = joinList(techForRole(project, roleId));
  const [firstMetric, secondMetric] = project.metrics;

  const lead =
    roleId === "fde" && project.users
      ? `${role.verbs[0]} ${what} for ${project.users}`
      : `${role.verbs[0]} ${what}${tech ? ` using ${tech}` : ""}`;
  const bullets = [withResult(lead, firstMetric)];
  if (project.contribution) {
    bullets.push(withResult(stripPeriod(project.contribution), secondMetric));
  }
  return bullets;
}

// Words and punctuation the resume tone avoids (from the resume-builder rules).
const BANNED = [
  "leveraged",
  "spearheaded",
  "robust",
  "cutting-edge",
  "seamless",
  "passionate",
  "synergy",
];

/** Common bullet checks plus the tone rules for tailored resumes. */
export function checkPhrasing(bullet) {
  const issues = checkBullet(bullet).map((i) => i.message);
  const lower = bullet.toLowerCase();
  const banned = BANNED.filter((word) => lower.includes(word));
  if (banned.length) issues.push(`Avoid "${banned.join('", "')}". Say what was built instead.`);
  if (/[—;]/.test(bullet)) issues.push("Avoid em dashes and semicolons. Keep one idea per bullet.");
  if (/\.\s*$/.test(bullet)) issues.push("Drop the trailing period.");
  return issues;
}

/** Fit scores for every role, e.g. { sde: 3, fde: 1, ai: 0, mle: 0 }. */
export function fitSummary(project) {
  return Object.fromEntries(ROLES.map((r) => [r.id, roleFit(project, r.id)]));
}
