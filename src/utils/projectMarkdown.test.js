import { describe, expect, it } from "vitest";
import { sampleProjects } from "../data/sampleProjects";
import { fromMarkdown, normalizeProject, slugify, toMarkdown } from "./projectMarkdown";

describe("project markdown", () => {
  it("round-trips every sample project", () => {
    for (const raw of sampleProjects) {
      const project = normalizeProject({ ...raw, roleFit: { fde: 2 } });
      expect(fromMarkdown(toMarkdown(project))).toEqual(project);
    }
  });

  it("writes frontmatter, sections and a bullet bank per role", () => {
    const md = toMarkdown(normalizeProject(sampleProjects[0]));
    expect(md).toMatch(/^---\nid: campus-eats\ntitle: CampusEats\n/);
    expect(md).toContain("tech: [React, Node.js, Express.js, PostgreSQL, Redis, WebSockets]");
    expect(md).toContain("role_fit: {sde: auto, fde: auto, ai: auto, mle: auto}");
    expect(md).toContain("## How it works\nReact front end");
    expect(md).toContain("### sde\n- Built CampusEats");
  });

  it("reads a hand-written file with missing fields", () => {
    const project = fromMarkdown(`---
title: Tiny Tool
tech: [Python]
metrics:
  - saved 2 hours a week
---

## One-liner
a script that renames files

## Bullet bank
### sde
- Built a file renamer in Python
`);
    expect(project).toMatchObject({
      id: "tiny-tool",
      title: "Tiny Tool",
      tech: ["Python"],
      metrics: ["saved 2 hours a week"],
      oneLiner: "a script that renames files",
      bullets: { sde: ["Built a file renamer in Python"], fde: [], ai: [], mle: [] },
    });
  });

  it("rejects files without frontmatter or a title", () => {
    expect(() => fromMarkdown("# Just a heading")).toThrow(/frontmatter/);
    expect(() => fromMarkdown("---\ntech: [Go]\n---\n")).toThrow(/title/);
  });

  it("makes ids from titles", () => {
    expect(slugify("RaftKV: Go + Raft!")).toBe("raftkv-go-raft");
  });
});
