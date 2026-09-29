import { describe, expect, it } from "vitest";
import { filtersFromProfile, hasPreferences, keywordScore, matchJobs } from "./matching";

const frontend = {
  id: 1,
  title: "Frontend Engineer Intern",
  company: "Northstar Labs",
  location: "New York, NY",
  mode: "Remote",
  description: "Build React interfaces.",
};
const data = {
  id: 2,
  title: "Data Analyst",
  company: "React Data Co",
  location: "Pittsburgh, PA",
  mode: "Hybrid",
  description: "SQL dashboards.",
};
const sales = {
  id: 3,
  title: "Sales Representative",
  company: "Acme",
  location: "Chicago, IL",
  mode: "On-site",
  description: "Grow accounts.",
};

describe("keywordScore", () => {
  it("weights title 3, company 2, description 1, case-insensitively", () => {
    expect(keywordScore(frontend, ["FRONTEND"])).toBe(3);
    expect(keywordScore(data, ["react"])).toBe(2);
    expect(keywordScore(frontend, ["react"])).toBe(1);
    expect(keywordScore(frontend, ["frontend", "react", " "])).toBe(4);
  });
});

describe("matchJobs", () => {
  it("returns matching jobs best first and drops non-matches", () => {
    const profile = { keywords: ["react"], preferredLocations: [] };
    expect(matchJobs([frontend, data, sales], profile)).toEqual([data, frontend]);
  });

  it("counts a preferred location, with Remote matching remote jobs", () => {
    const profile = { keywords: [], preferredLocations: ["Remote", "Chicago, IL"] };
    expect(matchJobs([frontend, data, sales], profile)).toEqual([frontend, sales]);
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
      minSalary: 30,
    });
  });

  it("falls back to no query and all locations", () => {
    expect(filtersFromProfile({ keywords: [], preferredLocations: ["Mars"] }, [])).toEqual({
      query: "",
      location: "all",
      minSalary: 0,
    });
  });
});
