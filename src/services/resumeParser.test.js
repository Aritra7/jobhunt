import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import * as pdfjsNode from "pdfjs-dist/legacy/build/pdf.mjs";
import {
  extractDocxText,
  extractPdfText,
  MAX_RESUME_TEXT_LENGTH,
  normalizeText,
  readResumeFile,
  resumeKind,
} from "./resumeParser";

const fixture = (name) => {
  const buf = readFileSync(new URL(`../test/fixtures/${name}`, import.meta.url));
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
};

describe("resumeKind", () => {
  it("detects the format by MIME type or extension", () => {
    expect(resumeKind({ name: "a.TXT", type: "" })).toBe("txt");
    expect(resumeKind({ name: "a", type: "application/pdf" })).toBe("pdf");
    expect(resumeKind({ name: "a.docx", type: "" })).toBe("docx");
    expect(resumeKind({ name: "a.doc", type: "" })).toBe("doc");
    expect(resumeKind({ name: "a.png", type: "image/png" })).toBe("unknown");
  });
});

describe("normalizeText", () => {
  it("collapses whitespace, keeps paragraph breaks and caps the length", () => {
    expect(normalizeText("  a \t b \r\n\n\n\n c  ")).toBe("a b\n\nc");
    expect(normalizeText("x".repeat(MAX_RESUME_TEXT_LENGTH + 10))).toHaveLength(
      MAX_RESUME_TEXT_LENGTH,
    );
  });
});

describe("extractPdfText", () => {
  it("reads text from every page of a real PDF", async () => {
    const text = await extractPdfText(fixture("resume.pdf"), pdfjsNode);
    expect(text).toContain("Jordan Rivera");
    expect(text).toContain("Skills: React, Kubernetes, PostgreSQL");
    expect(text).toContain("cut costs by 20%");
  });

  it("rejects a file that is not a PDF", async () => {
    const junk = new TextEncoder().encode("not a pdf").buffer;
    await expect(extractPdfText(junk, pdfjsNode)).rejects.toThrow();
  });
});

describe("extractDocxText", () => {
  it("reads paragraphs from a real DOCX", async () => {
    const text = await extractDocxText(fixture("resume.docx"));
    expect(text).toBe(
      "Jordan Rivera\n\nSkills: Go, Terraform, SQL\n\nExperience: Led a migration to Terraform.",
    );
  });

  it("rejects a file that is not a DOCX", async () => {
    await expect(extractDocxText(new TextEncoder().encode("nope").buffer)).rejects.toThrow();
  });
});

describe("readResumeFile", () => {
  it("reads .txt and .docx files and returns no text for legacy .doc", async () => {
    const txt = new File(["  Hello   world "], "r.txt", { type: "text/plain" });
    expect(await readResumeFile(txt)).toEqual({ kind: "txt", text: "Hello world" });

    const docx = new File([fixture("resume.docx")], "r.docx");
    expect((await readResumeFile(docx)).text).toContain("Terraform");

    const doc = new File(["binary"], "r.doc", { type: "application/msword" });
    expect(await readResumeFile(doc)).toEqual({ kind: "doc", text: "" });
  });
});
