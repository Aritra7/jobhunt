import { describe, expect, it } from "vitest";
import {
  filterJobs,
  formatSalary,
  getMatchScore,
  getSkillGaps,
  recommendationScore,
} from "./jobUtils";

const job = {
  id: 1,
  title: "Software Engineer Intern",
  company: "Duolingo",
  location: "Pittsburgh, PA",
  mode: "Hybrid",
  type: "Internship",
  salaryMin: 40,
  salaryMax: 44,
  skills: ["React", "JavaScript", "Python", "Product"],
  description: "Build user-facing product features.",
  descriptionText: "Build user-facing product features.",
  tags: [],
  requirements: ["Strong problem-solving"],
  regions: ["us"],
};
job.searchText = [job.title, job.company, job.location, job.description].join(" ").toLowerCase();

const remoteJob = {
  ...job,
  id: 2,
  title: "Frontend Engineer Intern",
  company: "Northstar Labs",
  location: "New York, NY",
  mode: "Remote",
  salaryMin: 30,
  salaryMax: 30,
  skills: ["React", "CSS"],
};
remoteJob.searchText = [
  remoteJob.title,
  remoteJob.company,
  remoteJob.location,
  remoteJob.description,
]
  .join(" ")
  .toLowerCase();

describe("getMatchScore", () => {
  it("returns the share of job skills the profile has, case-insensitively", () => {
    expect(getMatchScore(job, ["react", "PYTHON"])).toBe(50);
  });

  it("returns 0 when the job lists no skills", () => {
    expect(getMatchScore({ skills: [] }, ["React"])).toBe(0);
    expect(getMatchScore(undefined, ["React"])).toBe(0);
  });
});

describe("getSkillGaps", () => {
  it("lists job skills missing from the profile", () => {
    expect(getSkillGaps(job, ["React", "python"])).toEqual(["JavaScript", "Product"]);
  });
});

describe("filterJobs", () => {
  const jobs = [job, remoteJob];

  it("returns every job with empty filters", () => {
    expect(filterJobs(jobs, {})).toHaveLength(2);
  });

  it("matches the query against title, company and skills", () => {
    expect(filterJobs(jobs, { query: "northstar" })).toEqual([remoteJob]);
    expect(filterJobs(jobs, { query: "python" })).toEqual([job]);
  });

  it("also matches the description and requirements (ported from main)", () => {
    expect(filterJobs(jobs, { query: "user-facing" })).toHaveLength(2);
    expect(filterJobs(jobs, { query: "problem-solving" })).toHaveLength(2);
    expect(filterJobs(jobs, { query: "no such text" })).toHaveLength(0);
  });

  it("treats 'all' as no location or mode filter", () => {
    expect(filterJobs(jobs, { location: "all", mode: "all" })).toHaveLength(2);
    expect(filterJobs(jobs, { mode: "Remote" })).toEqual([remoteJob]);
    expect(filterJobs(jobs, { location: "Pittsburgh, PA" })).toEqual([job]);
  });

  it("keeps jobs whose max pay reaches the minimum", () => {
    expect(filterJobs(jobs, { minSalary: "40" })).toEqual([job]);
  });
});

describe("recommendationScore", () => {
  it("adds location, mode and salary boosts to the skill score", () => {
    const profile = {
      skills: ["React", "JavaScript"],
      preferredLocations: ["Pittsburgh, PA"],
      preferredModes: ["Hybrid"],
      minSalary: 30,
    };
    // 50 skill + 10 location + 8 mode + 5 salary
    expect(recommendationScore(job, profile)).toBe(73);
  });

  it("adds a capped boost for saved keywords", () => {
    const base = { skills: [], preferredLocations: [], preferredModes: [], minSalary: 100 };
    expect(recommendationScore(job, base)).toBe(0);
    // "product" hits the description (1) -> 1 * 3 = 3
    expect(recommendationScore(job, { ...base, keywords: ["product"] })).toBe(3);
    // title + description hits are capped at 15
    expect(recommendationScore(job, { ...base, keywords: ["engineer", "product", "intern"] })).toBe(
      15,
    );
  });

  it("never exceeds 100", () => {
    const profile = {
      skills: job.skills,
      preferredLocations: ["Pittsburgh, PA"],
      preferredModes: ["Hybrid"],
    };
    expect(recommendationScore(job, profile)).toBe(100);
  });
});

describe("formatSalary", () => {
  it("formats a range or a single hourly rate", () => {
    expect(formatSalary(job)).toBe("$40–44/hr");
    expect(formatSalary(remoteJob)).toBe("$30/hr");
    expect(formatSalary(null)).toBe("Salary unavailable");
  });
});
