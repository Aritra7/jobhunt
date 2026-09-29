import { describe, expect, it } from "vitest";
import { SOURCES, fetchJobsPage } from "./jobsApi";
import { enrichJob } from "../utils/jobFields";

// Hits the real job APIs, so it only runs with LIVE_JOBS=1 (npm run test:live).
describe.skipIf(!process.env.LIVE_JOBS)("live job sources", () => {
  it("loads and enriches jobs from the live sources", async () => {
    const { jobs, errors } = await fetchJobsPage(
      0,
      SOURCES.map((s) => s.id),
    );
    console.log(
      `${jobs.length} jobs; failed sources: ${errors.map((e) => e.source).join(", ") || "none"}`,
    );
    expect(jobs.length).toBeGreaterThan(0);
    const enriched = jobs.map(enrichJob);
    for (const job of enriched) {
      expect(typeof job.title).toBe("string");
      expect(["Remote", "Hybrid", "On-site"]).toContain(job.mode);
      expect(Array.isArray(job.skills)).toBe(true);
    }
    const withPay = enriched.filter((j) => j.salaryMax != null);
    console.log(
      `${withPay.length} with pay, e.g. ${withPay
        .slice(0, 3)
        .map((j) => `${j.salary} -> $${j.salaryMin}-${j.salaryMax}/hr`)
        .join("; ")}`,
    );
    console.log(`skills e.g. ${enriched.find((j) => j.skills.length)?.skills.join(", ")}`);
  }, 60000);
});
