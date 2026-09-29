export function buildQuestions(job) {
  const a = job.skills[0],
    b = job.skills[1] || a;
  return [
    {
      category: "Behavioral",
      question: "Tell me about a time you had to deliver something under a tight deadline.",
      guidance: "Use STAR. Make your contribution and the result specific.",
    },
    {
      category: "Technical",
      question: `Tell me about a project where you used ${a}. What tradeoffs did you make?`,
      guidance: `Explain the problem, the decision involving ${a}, alternatives you considered, and the outcome.`,
    },
    {
      category: "Technical",
      question: `How would you debug a production issue involving ${b}?`,
      guidance:
        "Describe reproduction, logs/metrics, narrowing the root cause, testing a fix, and preventing recurrence.",
    },
    {
      category: "Role-specific",
      question: `Why are you interested in ${job.company} and this ${job.title} role?`,
      guidance: `Reference something specific about ${job.company}, connect it to your background, and explain what you can contribute.`,
    },
    {
      category: "Product",
      question: `What would you build first for a product in ${job.companyInsights.industry}?`,
      guidance:
        "Clarify the user, define the smallest useful release, explain the key data flow, and state what you would defer.",
    },
  ];
}
export function scorePracticeAnswer(answer) {
  const t = answer.trim();
  if (!t) return { score: 0, feedback: ["Add a concrete answer before requesting feedback."] };
  let score = 40;
  const f = [];
  if (t.length > 180) score += 20;
  else f.push("Add more concrete detail.");
  if (/\b\d+%|\b\d+\b/.test(t)) score += 15;
  else f.push("Add a measurable result when possible.");
  if (/I |my |I led|I built|I implemented|I designed/i.test(t)) score += 15;
  else f.push("Make your own contribution clearer.");
  if (/result|impact|outcome|improved|reduced|increased|learned/i.test(t)) score += 10;
  else f.push("End with the result or what you learned.");
  return {
    score: Math.min(100, score),
    feedback: f.length ? f : ["Strong structure. Tighten wording and practice delivery."],
  };
}
