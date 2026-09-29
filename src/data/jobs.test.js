import { describe, expect, it } from "vitest";
import { sampleJobData as jobs, WORK_MODES } from "./jobs";

describe("job dataset", () => {
  it("has 23 jobs with unique ids", () => {
    expect(jobs).toHaveLength(23);
    expect(new Set(jobs.map((j) => j.id)).size).toBe(23);
  });

  it.each(jobs.map((j) => [j.id, j]))("job %i has every field the UI reads", (_id, job) => {
    for (const key of ["title", "company", "location", "type", "posted", "description"]) {
      expect(typeof job[key]).toBe("string");
    }
    expect(WORK_MODES).toContain(job.mode);
    expect(job.salaryMin).toBeLessThanOrEqual(job.salaryMax);
    expect(job.skills.length).toBeGreaterThanOrEqual(2);
    expect(new Set(job.skills).size).toBe(job.skills.length);
    expect(new Set(job.requirements).size).toBe(job.requirements.length);
    for (const key of ["industry", "size", "culture", "note"]) {
      expect(typeof job.companyInsights[key]).toBe("string");
    }
  });
});
