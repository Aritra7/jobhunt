// The only things the AI endpoint does. Prompts live on the server, so the
// browser can't use our key as a general-purpose LLM proxy. Inputs are capped
// and outputs are checked before they're returned.

const MAX_TEXT = 4000;
const MAX_BULLETS = 20;

const text = (value, max = MAX_TEXT) => String(value ?? "").slice(0, max);
const list = (value, max) =>
  (Array.isArray(value) ? value : [])
    .map((v) => String(v).trim())
    .filter(Boolean)
    .slice(0, max);
const clampScore = (n) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));

export const TASKS = {
  // AI feedback on a practice interview answer.
  interview: {
    system:
      'You are an interview coach for software and data roles. Score the candidate\'s answer from 0 to 100 and give specific, actionable feedback. Judge structure (STAR for behavioral questions), specificity, the candidate\'s own contribution, measurable results and relevance to the question. Do not invent facts about the candidate. Reply with JSON only: {"score": number, "strengths": string[], "improvements": string[]} with at most 3 items in each list, each one sentence.',
    buildUser(input) {
      const answer = text(input.answer);
      if (!answer.trim()) throw new Error("answer is empty");
      const role = [text(input.jobTitle, 150), text(input.company, 150)]
        .filter(Boolean)
        .join(" at ");
      return `Question: ${text(input.question, 500)}\n${role ? `Role: ${role}\n` : ""}Answer:\n${answer}`;
    },
    parse(raw) {
      return {
        score: clampScore(raw?.score),
        strengths: list(raw?.strengths, 3),
        improvements: list(raw?.improvements, 3),
      };
    },
  },

  // Grammar, formatting and wording review of resume bullets.
  bullets: {
    system:
      'You review resume bullet points for grammar, spelling, formatting and wording. For each bullet, list concrete problems (empty if none) and suggest a rewrite that keeps every fact and number exactly as given. Never add numbers, tools or outcomes that are not in the original. Rewrites start with a past-tense action verb, have no first person, no trailing period, and fit in about 30 words. Reply with JSON only: {"reviews": [{"bullet": string, "issues": string[], "rewrite": string}]} in the same order as the input.',
    buildUser(input) {
      const bullets = list(input.bullets, MAX_BULLETS).map((b) => text(b, 400));
      if (bullets.length === 0) throw new Error("no bullets to review");
      return bullets.map((b, i) => `${i + 1}. ${b}`).join("\n");
    },
    parse(raw) {
      const reviews = Array.isArray(raw?.reviews) ? raw.reviews.slice(0, MAX_BULLETS) : [];
      return {
        reviews: reviews.map((r) => ({
          bullet: text(r?.bullet, 400),
          issues: list(r?.issues, 5),
          rewrite: text(r?.rewrite, 400),
        })),
      };
    },
  },
};
