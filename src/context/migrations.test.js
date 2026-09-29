import { describe, expect, it } from "vitest";
import { legacyTrackerEntries, mapKeys, toJobId, upgradeOldApplications } from "./migrations";

describe("toJobId", () => {
  it("maps old numeric sample ids to string ids and keeps string ids", () => {
    expect(toJobId(3)).toBe("sample:3");
    expect(toJobId("3")).toBe("sample:3");
    expect(toJobId("greenhouse:stripe-1")).toBe("greenhouse:stripe-1");
    expect(mapKeys({ 1: "a" }, toJobId)).toEqual({ "sample:1": "a" });
  });
});

describe("upgradeOldApplications", () => {
  it("turns the old record and saved list into tracker entries", () => {
    const entries = upgradeOldApplications(
      { 1: { status: "Interview", deadline: "2026-10-01", reminder: "Ping", notes: "n" } },
      [1, 2],
    );
    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({
      jobId: "sample:1",
      company: "Duolingo",
      status: "interviewing",
      deadline: "2026-10-01",
      reminder: "Ping",
    });
    expect(entries[1]).toMatchObject({ jobId: "sample:2", status: "saved" });
  });
});

describe("legacyTrackerEntries", () => {
  it("reads getajob's old keys first, then Prithvi's jobfind tracker", () => {
    localStorage.setItem("jobfind.applications", JSON.stringify([{ title: "From JobFind" }]));
    expect(legacyTrackerEntries()).toEqual([{ title: "From JobFind" }]);
    localStorage.setItem("getajob.saved", JSON.stringify([5]));
    expect(legacyTrackerEntries()[0]).toMatchObject({ jobId: "sample:5", status: "saved" });
  });
});
