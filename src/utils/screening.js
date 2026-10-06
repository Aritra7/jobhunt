import { DEFAULT_QUESTION_IDS, defaultAnswerBank } from "../data/screeningQuestions";

const PLACEHOLDER = /\{(company|role|project|source)\}/g;
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The values {company}, {role}, {project} and {source} stand for, for one job. */
export function answerContext(job, project) {
  return {
    company: job?.company || "your company",
    role: job?.title || "this",
    project: project ? `${project.title}, ${project.oneLiner}` : "a recent project",
    source: job?.sourceName ? `${job.sourceName}` : "a job board",
  };
}

/** Fills the placeholders in a saved answer for one job. */
export function fillAnswer(template, context) {
  return String(template ?? "").replace(PLACEHOLDER, (_, key) => context[key]);
}

/**
 * Turns an answer written for one job back into a reusable template by
 * putting the placeholders back ("Stripe" -> "{company}").
 */
export function toTemplate(text, context) {
  let template = text;
  for (const key of ["project", "company", "role", "source"]) {
    const value = context[key];
    if (value && value.length > 2) {
      template = template.replace(new RegExp(escapeRegex(value), "g"), `{${key}}`);
    }
  }
  return template;
}

/**
 * The answer bank, upgraded from the first version's two fields
 * (whyInterested, workAuthorization) and filled with defaults.
 */
export function upgradeAnswerBank(raw) {
  const bank = { ...defaultAnswerBank, ...(raw || {}) };
  // Stored data arrives merged with the defaults, so an old answer wins
  // unless the new field already holds something other than the default.
  const unchanged = (id) => !raw?.[id] || raw[id] === defaultAnswerBank[id];
  if (raw?.whyInterested && unchanged("why-role")) bank["why-role"] = raw.whyInterested;
  if (raw?.workAuthorization && unchanged("work-authorization")) {
    bank["work-authorization"] = raw.workAuthorization;
  }
  delete bank.whyInterested;
  delete bank.workAuthorization;
  return bank;
}

/** Draft forms from the first version stored two answers as form fields. */
export function upgradeDraftForm(form) {
  if (!form || form.answers) return form;
  const answers = {};
  if (form.whyInterested) answers["why-role"] = form.whyInterested;
  if (form.workAuthorization) answers["work-authorization"] = form.workAuthorization;
  return { ...form, questionIds: DEFAULT_QUESTION_IDS, answers };
}
