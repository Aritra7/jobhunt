import { describe, expect, it } from "vitest";
import { sampleProjects } from "../data/sampleProjects";
import { defaultResume } from "../data/profile";
import { normalizeProject } from "./projectMarkdown";
import {
  asScorableResume,
  buildTailoredResume,
  bulletsForRole,
  matchedSkills,
  orderSkills,
  rankProjects,
  resumeToMarkdown,
} from "./resumeGenerator";

const projects = sampleProjects.map(normalizeProject);
const resume = {
  ...defaultResume,
  contact: { name: "Alex Chen", email: "a@x.com", phone: "", location: "", linkedin: "" },
};

describe("rankProjects", () => {
  it("puts the best-fitting projects first for each role", () => {
    expect(rankProjects(projects, "ai")[0].project.id).toBe("docchat");
    expect(rankProjects(projects, "mle")[0].project.id).toBe("churn-predictor");
    expect(rankProjects(projects, "fde")[0].project.id).toBe("clinic-sync");
  });

  it("uses the job description to break ties and reports matched skills", () => {
    const jd = "We need Go, gRPC and Docker experience for distributed storage.";
    const [top] = rankProjects(projects, "sde", jd);
    expect(top.project.id).toBe("raft-kv");
    expect(top.matched).toEqual(expect.arrayContaining(["Go", "gRPC", "Docker"]));
    expect(matchedSkills(projects[0], "")).toEqual([]);
  });
});

describe("buildTailoredResume", () => {
  it("adds the chosen projects with the role's bullets and orders skills for the job", () => {
    const docchat = projects.find((p) => p.id === "docchat");
    const raft = projects.find((p) => p.id === "raft-kv");
    const tailored = buildTailoredResume(resume, [docchat, raft], "ai", "Python and SQL");
    expect(tailored.projects.map((p) => p.title)).toEqual(["DocChat", "RaftKV"]);
    // Saved AI bullets are used as-is; RaftKV has none, so it gets drafts.
    expect(tailored.projects[0].bullets).toEqual(docchat.bullets.ai);
    expect(tailored.projects[1].bullets).toEqual(bulletsForRole(raft, "ai"));
    expect(tailored.skillsText.split(", ").slice(0, 2)).toEqual(["Python", "SQL"]);
    expect(tailored.summary).toBe(resume.summary);
  });

  it("can be scored by the ATS check and exported as markdown", () => {
    const tailored = buildTailoredResume(resume, [projects[0]], "sde", "");
    expect(asScorableResume(tailored).experience.at(-1).bulletsText).toContain("PostgreSQL");
    const md = resumeToMarkdown(tailored, "Software engineer");
    expect(md).toMatch(/^# Alex Chen\n/);
    expect(md).toContain("## Projects\n### CampusEats (React, Node.js");
    expect(md.trim().endsWith(tailored.skillsText)).toBe(true);
  });
});

describe("orderSkills", () => {
  it("keeps the original order when there is no job description", () => {
    expect(orderSkills(["React", "Go"], "")).toEqual(["React", "Go"]);
  });
});
