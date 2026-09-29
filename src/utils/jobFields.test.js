import { describe, expect, it } from "vitest";
import { makeJob } from "../api/jobModel";
import { detectMode, enrichJob, parsePay } from "./jobFields";

const live = (fields) =>
  makeJob({
    source: "jobicy",
    sourceName: "Jobicy",
    rawId: 1,
    title: "Frontend Engineer",
    company: "Acme",
    location: "New York, NY",
    remote: false,
    postedAt: new Date().toISOString(),
    descriptionHtml: "<p>We use React, TypeScript and PostgreSQL.</p>",
    url: "https://example.com/job",
    ...fields,
  });

describe("parsePay", () => {
  it("converts annual ranges to hourly and keeps hourly ranges", () => {
    expect(parsePay("$120k – $150k")).toEqual({ salaryMin: 58, salaryMax: 72 });
    expect(parsePay("$40-50/hour")).toEqual({ salaryMin: 40, salaryMax: 50 });
    expect(parsePay("USD 104,000")).toEqual({ salaryMin: 50, salaryMax: 50 });
  });

  it("returns nulls when no pay is listed", () => {
    expect(parsePay(null)).toEqual({ salaryMin: null, salaryMax: null });
    expect(parsePay("Competitive")).toEqual({ salaryMin: null, salaryMax: null });
  });
});

describe("detectMode", () => {
  it("detects hybrid, remote and on-site jobs", () => {
    expect(detectMode({ location: "Hybrid - Boston, MA", title: "x", remote: false })).toBe(
      "Hybrid",
    );
    expect(detectMode({ location: "Remote (USA)", title: "x", remote: true })).toBe("Remote");
    expect(detectMode({ location: "Austin, TX", title: "x", remote: false })).toBe("On-site");
  });
});

describe("enrichJob", () => {
  it("derives skills, mode, type, pay and posted from live data", () => {
    const job = enrichJob(live({ jobTypes: ["full-time"], salary: "$100k – $120k" }));
    expect(job.skills).toEqual(expect.arrayContaining(["React", "TypeScript", "PostgreSQL"]));
    expect(job.mode).toBe("On-site");
    expect(job.type).toBe("Full time");
    expect(job.salaryMax).toBe(58);
    expect(job.posted).toBe("today");
  });

  it("leaves sample jobs unchanged", () => {
    const sample = { source: "sample", skills: ["Go"] };
    expect(enrichJob(sample)).toBe(sample);
  });
});
