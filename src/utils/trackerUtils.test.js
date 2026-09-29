import { describe, expect, it } from "vitest";
import { groupByStatus, jobsWithReminders, STATUSES } from "./trackerUtils";

const jobs = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];

describe("groupByStatus", () => {
  it("returns one column per status, in order", () => {
    expect(groupByStatus(jobs, {}, new Set()).map((c) => c.status)).toEqual(STATUSES);
  });

  it("puts saved-but-untracked jobs first in Saved, then tracked ones by status", () => {
    const applications = { 2: { status: "Saved" }, 3: { status: "Interview" } };
    const columns = groupByStatus(jobs, applications, new Set([1, 3]));
    const byStatus = Object.fromEntries(columns.map((c) => [c.status, c.jobs.map((j) => j.id)]));
    expect(byStatus.Saved).toEqual([1, 2]);
    expect(byStatus.Interview).toEqual([3]);
    expect(byStatus.Applied).toEqual([]);
  });
});

describe("jobsWithReminders", () => {
  it("keeps jobs whose application has a deadline or a reminder", () => {
    const applications = { 1: { deadline: "2026-10-01" }, 2: { reminder: "Ping" }, 3: {} };
    expect(jobsWithReminders(jobs, applications).map((j) => j.id)).toEqual([1, 2]);
  });
});
