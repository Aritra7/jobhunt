import { describe, expect, it } from "vitest";
import { MAX_RESUME_SIZE_BYTES, validateResumeFile } from "./fileValidation";

const file = (name, type = "", size = 1000) => ({ name, type, size });

describe("validateResumeFile", () => {
  it("accepts txt, pdf, doc and docx by extension or MIME type", () => {
    expect(validateResumeFile(file("resume.txt"))).toBe("");
    expect(validateResumeFile(file("RESUME.PDF"))).toBe("");
    expect(validateResumeFile(file("resume.doc"))).toBe("");
    expect(validateResumeFile(file("resume.docx"))).toBe("");
    expect(validateResumeFile(file("resume", "application/pdf"))).toBe("");
  });

  it("rejects other file types", () => {
    expect(validateResumeFile(file("photo.png", "image/png"))).toMatch(/Invalid file type/);
    expect(validateResumeFile(file("resume.pdf.exe"))).toMatch(/Invalid file type/);
  });

  it("enforces the 5 MB limit", () => {
    expect(validateResumeFile(file("resume.pdf", "", MAX_RESUME_SIZE_BYTES))).toBe("");
    expect(validateResumeFile(file("resume.pdf", "", MAX_RESUME_SIZE_BYTES + 1))).toMatch(
      /Maximum size is 5 MB/,
    );
  });
});
