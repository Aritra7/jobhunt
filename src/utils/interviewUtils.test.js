import { describe, expect, it } from "vitest";
import { buildQuestions, scorePracticeAnswer } from "./interviewUtils";

const job = {
  title: "Software Engineer Intern",
  company: "Duolingo",
  skills: ["React", "Python"],
  companyInsights: { industry: "Education Technology" },
};

describe("buildQuestions", () => {
  it("builds five questions tailored to the job", () => {
    const questions = buildQuestions(job);
    expect(questions.map((q) => q.category)).toEqual([
      "Behavioral",
      "Technical",
      "Technical",
      "Role-specific",
      "Product",
    ]);
    expect(questions[1].question).toContain("React");
    expect(questions[2].question).toContain("Python");
    expect(questions[3].question).toContain("Duolingo");
    expect(questions[4].question).toContain("Education Technology");
  });

  it("reuses the first skill when the job has only one", () => {
    const questions = buildQuestions({ ...job, skills: ["Go"] });
    expect(questions[2].question).toContain("Go");
  });
});

describe("scorePracticeAnswer", () => {
  it("scores an empty answer as 0", () => {
    expect(scorePracticeAnswer("   ").score).toBe(0);
  });

  it("rewards length, numbers, ownership and outcomes", () => {
    const answer =
      "I led a migration of our billing service to a new queue. I built the rollout plan, " +
      "wrote the backfill, and coordinated with two teams. As a result we reduced failed " +
      "payments by 30% within a month.";
    const result = scorePracticeAnswer(answer);
    expect(result.score).toBe(100);
    expect(result.feedback).toEqual(["Strong structure. Tighten wording and practice delivery."]);
  });

  it("explains what is missing from a short answer", () => {
    const result = scorePracticeAnswer("We did a project.");
    expect(result.score).toBe(40);
    expect(result.feedback).toHaveLength(4);
  });
});
