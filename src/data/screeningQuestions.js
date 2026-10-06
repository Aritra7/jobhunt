// Common screening questions on application forms, with a starting answer for
// each. {company}, {role} and {project} are filled in for every job.
export const SCREENING_QUESTIONS = [
  {
    id: "why-role",
    question: "Why are you interested in this role?",
    kind: "text",
    answer:
      "I’m interested in the {role} role at {company} because it combines hands-on software engineering with a product environment where I can contribute quickly and keep learning.",
  },
  {
    id: "why-company",
    question: "Why do you want to work at {company}?",
    kind: "text",
    answer:
      "{company}'s products solve real problems for their users, and I want to work on a team that ships carefully and learns from data.",
  },
  {
    id: "work-authorization",
    question: "Are you legally authorized to work in the United States?",
    kind: "yesno",
    answer: "Yes",
  },
  {
    id: "sponsorship",
    question: "Will you now or in the future require visa sponsorship?",
    kind: "yesno",
    answer: "No",
  },
  {
    id: "start-date",
    question: "When can you start?",
    kind: "short",
    answer: "June 2026, after graduation",
  },
  {
    id: "salary",
    question: "What are your salary expectations?",
    kind: "short",
    answer: "Open to discussing a competitive range for the {role} role",
  },
  {
    id: "relocation",
    question: "Are you willing to relocate?",
    kind: "yesno",
    answer: "Yes",
  },
  {
    id: "project",
    question: "Tell us about a project you're proud of.",
    kind: "text",
    answer: "I'm proud of {project}.",
  },
  {
    id: "how-heard",
    question: "How did you hear about this role?",
    kind: "short",
    answer: "Through {source}",
  },
];

// Asked on every application unless removed; the rest can be added per job.
export const DEFAULT_QUESTION_IDS = ["why-role", "work-authorization", "sponsorship"];

export const defaultAnswerBank = Object.fromEntries(
  SCREENING_QUESTIONS.map((q) => [q.id, q.answer]),
);

export function questionById(id) {
  return SCREENING_QUESTIONS.find((q) => q.id === id);
}
