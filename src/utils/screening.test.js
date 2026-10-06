import { describe, expect, it } from "vitest";
import { defaultAnswerBank } from "../data/screeningQuestions";
import {
  answerContext,
  fillAnswer,
  toTemplate,
  upgradeAnswerBank,
  upgradeDraftForm,
} from "./screening";

const job = { title: "Backend Engineer", company: "Stripe", sourceName: "Greenhouse" };
const project = { title: "RaftKV", oneLiner: "a Raft key-value store" };

describe("answer templates", () => {
  it("fills placeholders for a job and turns edited answers back into templates", () => {
    const context = answerContext(job, project);
    expect(fillAnswer("Why {company}? As a {role}, see {project}. Via {source}.", context)).toBe(
      "Why Stripe? As a Backend Engineer, see RaftKV, a Raft key-value store. Via Greenhouse.",
    );
    expect(toTemplate("I love Stripe and the Backend Engineer team", context)).toBe(
      "I love {company} and the {role} team",
    );
  });

  it("has safe defaults without a job or project", () => {
    expect(fillAnswer("At {company}: {project}", answerContext(null, null))).toBe(
      "At your company: a recent project",
    );
  });
});

describe("migrations", () => {
  it("moves the first version's two answers into the bank", () => {
    const bank = upgradeAnswerBank({ whyInterested: "Old why", workAuthorization: "No" });
    expect(bank["why-role"]).toBe("Old why");
    expect(bank["work-authorization"]).toBe("No");
    expect(bank.whyInterested).toBeUndefined();
    expect(bank.salary).toBe(defaultAnswerBank.salary);
  });

  it("keeps the old answer when the stored data was merged with defaults", () => {
    const merged = { ...defaultAnswerBank, whyInterested: "Old why" };
    expect(upgradeAnswerBank(merged)["why-role"]).toBe("Old why");
    const edited = { ...defaultAnswerBank, "why-role": "New why", whyInterested: "Old why" };
    expect(upgradeAnswerBank(edited)["why-role"]).toBe("New why");
  });

  it("upgrades old draft forms", () => {
    expect(upgradeDraftForm({ firstName: "A", whyInterested: "Why" })).toMatchObject({
      questionIds: ["why-role", "work-authorization", "sponsorship"],
      answers: { "why-role": "Why" },
    });
  });
});
