import { describe, expect, it } from "vitest";
import { detectBenefits, detectSponsorship } from "./jobPerks";
import { sampleJobs } from "../api/sources/sample";
import { filterJobs } from "./jobUtils";

describe("detectSponsorship", () => {
  it.each([
    ["We will sponsor H-1B transfers.", "offered"],
    ["Visa sponsorship is available for eligible candidates.", "offered"],
    ["Open to sponsoring OPT for interns.", "offered"],
    ["No visa sponsorship available for this role.", "not-offered"],
    ["We are unable to sponsor visas.", "not-offered"],
    [
      "Must be authorized to work in the U.S. without current or future sponsorship.",
      "not-offered",
    ],
    ["Sponsorship is not available for this position.", "not-offered"],
    ["U.S. citizens only due to customer requirements.", "not-offered"],
    ["Great team and snacks.", "unknown"],
  ])("%s -> %s", (text, status) => {
    expect(detectSponsorship(text).status).toBe(status);
  });

  it("quotes the sentence it found", () => {
    const text = "Join us. We cannot sponsor visas at this time. Apply now.";
    expect(detectSponsorship(text).evidence).toBe("We cannot sponsor visas at this time.");
  });
});

describe("detectBenefits", () => {
  it("finds common benefits", () => {
    expect(
      detectBenefits(
        "Medical, dental and vision plans, 401(k) match, unlimited PTO, equity and paid parental leave.",
      ),
    ).toEqual([
      "Health insurance",
      "401(k) / retirement",
      "Paid time off",
      "Parental leave",
      "Equity",
    ]);
    expect(detectBenefits("Fast-paced team")).toEqual([]);
  });
});

describe("sample jobs and the sponsorship filter", () => {
  it("detects perks in the sample data and filters on them", () => {
    const jobs = sampleJobs();
    const byId = (n) => jobs.find((j) => j.id === `sample:${n}`);
    expect(byId(9).sponsorship.status).toBe("offered");
    expect(byId(9).benefits).toContain("Equity");
    expect(byId(10).sponsorship.status).toBe("not-offered");
    expect(byId(4).sponsorship.status).toBe("unknown");

    const offered = filterJobs(jobs, { sponsorship: "offered" });
    expect(offered.every((j) => j.sponsorship.status === "offered")).toBe(true);
    const notExcluded = filterJobs(jobs, { sponsorship: "not-excluded" });
    expect(notExcluded.some((j) => j.sponsorship.status === "not-offered")).toBe(false);
    expect(notExcluded.length).toBeGreaterThan(offered.length);
  });
});
