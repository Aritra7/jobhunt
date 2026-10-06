import { describe, expect, it } from "vitest";
import { filtersFromProfile, hasPreferences, keywordScore, matchJobs } from "./matching";

const frontend = {
  id: 1,
  title: "Frontend Engineer Intern",
  company: "Northstar Labs",
  location: "New York, NY",
  mode: "Remote",
  tags: ["Design"],
  jobTypes: ["Internship"],
  descriptionText: "Build React interfaces.",
};
const data = {
  id: 2,
  title: "Data Analyst",
  company: "React Data Co",
  location: "Pittsburgh, PA",
  mode: "Hybrid",
  tags: [],
  jobTypes: ["Full time"],
  descriptionText: "SQL dashboards.",
};
const sales = {
  id: 3,
  title: "Sales Representative",
  company: "Acme",
  location: "Chicago, IL",
  mode: "On-site",
  tags: [],
  jobTypes: ["Full time"],
  descriptionText: "Grow accounts.",
};

describe("keywordScore", () => {
  it("weights title 5, tags 3, company 2, description 1, case-insensitively", () => {
    expect(keywordScore(frontend, ["FRONTEND"])).toBe(5);
    expect(keywordScore(frontend, ["design"])).toBe(3);
    expect(keywordScore(data, ["react"])).toBe(2);
    expect(keywordScore(frontend, ["react"])).toBe(1);
    expect(keywordScore(frontend, ["frontend", "react", " "])).toBe(6);
  });
});

describe("matchJobs", () => {
  it("returns matching jobs best first and drops non-matches", () => {
    const profile = { keywords: ["react"], preferredLocations: [] };
    expect(matchJobs([frontend, data, sales], profile)).toEqual([data, frontend]);
  });

  it("counts a preferred location, with Remote matching remote jobs", () => {
    const profile = { keywords: [], preferredLocations: ["Remote", "chicago"] };
    expect(matchJobs([frontend, data, sales], profile)).toEqual([frontend, sales]);
  });

  it("only keeps jobs of the preferred job types", () => {
    const profile = { keywords: ["react"], preferredLocations: [], jobTypes: ["Internship"] };
    expect(matchJobs([frontend, data, sales], profile)).toEqual([frontend]);
  });
});

describe("matchJobs and visa sponsorship", () => {
  it("drops jobs that rule out sponsorship for someone who needs it", () => {
    const noSponsor = { ...frontend, id: 9, sponsorship: { status: "not-offered" } };
    const profile = { keywords: ["react"], preferredLocations: [], needsSponsorship: true };
    expect(matchJobs([noSponsor, frontend], profile)).toEqual([frontend]);
    expect(filtersFromProfile(profile, []).sponsorship).toBe("not-excluded");
  });
});

describe("hasPreferences", () => {
  it("is true when keywords or locations are set", () => {
    expect(hasPreferences({ keywords: [], preferredLocations: [] })).toBe(false);
    expect(hasPreferences({ keywords: ["x"], preferredLocations: [] })).toBe(true);
    expect(hasPreferences({ keywords: [], preferredLocations: ["Remote"] })).toBe(true);
  });
});

describe("filtersFromProfile", () => {
  it("uses the first keyword, the first location in the dropdown and the minimum pay", () => {
    const profile = {
      keywords: ["react", "sql"],
      preferredLocations: ["Remote", "Pittsburgh, PA"],
      minSalary: 30,
    };
    expect(filtersFromProfile(profile, ["Chicago, IL", "Pittsburgh, PA"])).toEqual({
      query: "react",
      location: "Pittsburgh, PA",
      mode: "all",
      jobType: "",
      sponsorship: "any",
      minSalary: 30,
    });
  });

  it("falls back to no query and all locations", () => {
    expect(filtersFromProfile({ keywords: [], preferredLocations: ["Mars"] }, [])).toEqual({
      query: "",
      location: "all",
      mode: "all",
      jobType: "",
      sponsorship: "any",
      minSalary: 0,
    });
  });

  it("matches a location containing a preferred one and a single mode or job type", () => {
    const profile = {
      keywords: [],
      preferredLocations: ["pittsburgh"],
      preferredModes: ["Remote"],
      jobTypes: ["Internship"],
    };
    expect(filtersFromProfile(profile, ["Pittsburgh, PA"])).toMatchObject({
      location: "Pittsburgh, PA",
      mode: "Remote",
      jobType: "Internship",
    });
  });
});
