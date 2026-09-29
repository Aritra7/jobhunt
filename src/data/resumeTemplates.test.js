import { describe, expect, it } from "vitest";
import { templateById } from "./resumeTemplates";

describe("templateById", () => {
  it("finds a template and falls back to modern for unknown or missing ids", () => {
    expect(templateById("classic").name).toBe("Classic Professional");
    expect(templateById("nope").id).toBe("modern");
    expect(templateById(undefined).id).toBe("modern");
  });
});
