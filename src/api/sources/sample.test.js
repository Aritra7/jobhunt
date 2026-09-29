import { describe, expect, it } from "vitest";
import { sampleJobs } from "./sample";

describe("sampleJobs", () => {
  it("normalizes the 23 sample jobs into the shared job shape", () => {
    const jobs = sampleJobs();
    expect(jobs).toHaveLength(23);
    const duolingo = jobs.find((j) => j.id === "sample:1");
    expect(duolingo).toMatchObject({
      source: "sample",
      company: "Duolingo",
      mode: "Hybrid",
      jobTypes: ["Internship"],
      regions: ["us"],
      salaryMax: 44,
    });
    expect(duolingo.descriptionText).toContain("Strong problem-solving");
    expect(duolingo.searchText).toContain("duolingo");
  });
});
