import { describe, expect, it } from "vitest";
import { analyzeResumeForJob } from "./resumeUtils";

const job = { skills: ["React", "Python", "Docker", "Go"] };

const resume = {
  rawText: "",
  summary: "Engineer who ships.",
  skills: ["React", "Python", "SQL", "AWS"],
  experience: "Built services with Docker.",
};

describe("analyzeResumeForJob", () => {
  it("splits job skills into matched and missing using all resume text", () => {
    const result = analyzeResumeForJob(resume, job);
    expect(result.matched).toEqual(["React", "Python", "Docker"]);
    expect(result.missing).toEqual(["Go"]);
  });

  it("boosts the ATS score for summary, experience and 4+ skills, capped at 100", () => {
    // 75 base + 5 + 5 + 5
    expect(analyzeResumeForJob(resume, job).atsScore).toBe(90);
    const full = { ...resume, rawText: "go" };
    expect(analyzeResumeForJob(full, job).atsScore).toBe(100);
  });

  it("returns at most five suggestions", () => {
    const empty = { rawText: "", summary: "", skills: [], experience: "" };
    const many = { skills: ["A", "B", "C", "D", "E", "F"] };
    expect(analyzeResumeForJob(empty, many).suggestions).toHaveLength(5);
  });
});
