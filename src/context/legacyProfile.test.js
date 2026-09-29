import { describe, expect, it } from "vitest";
import { mergeLegacyProfile, withLegacyProfile } from "./legacyProfile";

const profile = {
  keywords: ["react"],
  preferredLocations: ["Remote"],
  preferredModes: ["Hybrid"],
  jobTypes: [],
  minSalary: 30,
};

describe("mergeLegacyProfile", () => {
  it("adds old keywords and the old preferred location without duplicates", () => {
    const merged = mergeLegacyProfile(profile, {
      keywords: [" frontend ", "react", ""],
      preferredLocation: "Seattle, WA",
    });
    expect(merged.keywords).toEqual(["react", "frontend"]);
    expect(merged.preferredLocations).toEqual(["Remote", "Seattle, WA"]);
    expect(merged.minSalary).toBe(30);
  });

  it("is idempotent", () => {
    const legacy = { keywords: ["go"], preferredLocation: "Remote" };
    const once = mergeLegacyProfile(profile, legacy);
    expect(mergeLegacyProfile(once, legacy)).toEqual(once);
  });

  it("leaves the profile alone when there is no usable legacy data", () => {
    expect(mergeLegacyProfile(profile, null)).toBe(profile);
    expect(mergeLegacyProfile(profile, { keywords: "nope" })).toEqual(profile);
  });
});

describe("mergeLegacyProfile with Prithvi's JobFind profile", () => {
  it("maps his work mode and job types", () => {
    const merged = mergeLegacyProfile(profile, { workMode: "remote", jobTypes: ["Internship"] });
    expect(merged.preferredModes).toEqual(["Remote"]);
    expect(merged.jobTypes).toEqual(["Internship"]);
    expect(mergeLegacyProfile(profile, { workMode: "any" }).preferredModes).toEqual(["Hybrid"]);
  });
});

describe("withLegacyProfile", () => {
  it("reads the old jobfind.profile key", () => {
    localStorage.setItem("jobfind.profile", JSON.stringify({ keywords: ["sql"] }));
    expect(withLegacyProfile(profile).keywords).toEqual(["react", "sql"]);
  });
});
