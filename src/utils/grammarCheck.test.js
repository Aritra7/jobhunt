import { describe, expect, it } from "vitest";
import { autoFix, checkDateFormats, checkGrammar } from "./grammarCheck";

describe("checkGrammar", () => {
  it("passes a clean bullet", () => {
    expect(
      checkGrammar("Built a React and Node.js dashboard on AWS, cutting load time by 40%"),
    ).toEqual([]);
  });

  it("flags mis-cased tech names but not ordinary words", () => {
    expect(checkGrammar("Built APIs in javascript with github actions")).toEqual([
      'Write "JavaScript", not "javascript".',
      'Write "GitHub", not "github".',
    ]);
    expect(checkGrammar("Helped the team react to incidents faster in 2024")).toEqual([]);
  });

  it("flags present-tense openers, a/an, spacing and punctuation", () => {
    const issues = checkGrammar("Builds a API ,with a hour of work!").join(" ");
    expect(issues).toContain('Use the past tense for past work: "Built"');
    expect(issues).toContain('Use "an" before "hour"');
    expect(issues).toContain("Remove the space before punctuation");
    expect(issues).toContain("Avoid exclamation");
    expect(checkGrammar("Designed an user flow")).toContain('Use "a" before "user".');
    expect(checkGrammar("Shipped an hour-long demo and a ML model")).toEqual([]);
    expect(checkGrammar("Wrote docs,tests and i reviewed")).toEqual([
      'Capitalize "I" (or drop first person).',
      "Add a space after each comma.",
    ]);
  });
});

describe("checkDateFormats", () => {
  it("notes mixed date formats and ignores Present", () => {
    expect(checkDateFormats(["Jun 2025", "Aug 2025", "Present"])).toBeNull();
    expect(checkDateFormats(["Jun 2025", "06/2024", "2023"])).toMatch(/3 formats/);
  });
});

describe("autoFix", () => {
  it("fixes tech casing and comma spacing", () => {
    expect(autoFix("Built it in javascript ,with nodejs,postgres and react")).toBe(
      "Built it in JavaScript, with Node.js, PostgreSQL and react",
    );
  });
});
