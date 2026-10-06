import { describe, expect, it } from "vitest";
import { sampleProjects } from "../data/sampleProjects";
import { normalizeProject } from "./projectMarkdown";
import {
  autoFit,
  checkPhrasing,
  draftBullets,
  fitSummary,
  resultClause,
  roleFit,
  techForRole,
} from "./projectPhrasing";

const byId = (id) => normalizeProject(sampleProjects.find((p) => p.id === id));

describe("role fit", () => {
  it("scores each sample project highest for the role it was built for", () => {
    expect(fitSummary(byId("raft-kv")).sde).toBeGreaterThan(fitSummary(byId("raft-kv")).mle);
    expect(fitSummary(byId("docchat")).ai).toBe(3);
    expect(fitSummary(byId("churn-predictor")).mle).toBe(3);
    expect(fitSummary(byId("clinic-sync")).fde).toBe(3);
  });

  it("uses the user's own score when set", () => {
    const project = { ...byId("raft-kv"), roleFit: { mle: 2 } };
    expect(autoFit(project, "mle")).not.toBe(2);
    expect(roleFit(project, "mle")).toBe(2);
  });
});

describe("drafting", () => {
  it("turns a metric into a result clause", () => {
    expect(resultClause("cut onboarding from 3 weeks to 4 days")).toBe(
      "cutting onboarding from 3 weeks to 4 days",
    );
    expect(resultClause("0.87 AUC")).toBe("with 0.87 AUC");
  });

  it("orders tech by relevance to the role", () => {
    expect(techForRole(byId("docchat"), "ai")[0]).toMatch(/OpenAI|pgvector/);
  });

  it("phrases the same project differently per role, using only entered facts", () => {
    const project = byId("clinic-sync");
    const [sde] = draftBullets(project, "sde");
    const [fde] = draftBullets(project, "fde");
    expect(sde).toMatch(/^Built ClinicSync, an integration .* using /);
    expect(fde).toMatch(/^Delivered ClinicSync, .* for 3 partner clinics/);
    expect(fde).toContain("cutting each clinic's onboarding from 3 weeks to 4 days");
    const second = draftBullets(project, "fde")[1];
    expect(second).toBe(
      "Ran the clinic sessions, wrote the ETL and owned the rollout, removing about 10 hours of manual data entry per week",
    );
  });

  it("drafts no numbers when the project has no metrics", () => {
    const project = { ...byId("raft-kv"), metrics: [] };
    for (const bullet of draftBullets(project, "sde")) expect(bullet).not.toMatch(/\d/);
  });
});

describe("checkPhrasing", () => {
  it("flags the tone rules", () => {
    expect(checkPhrasing("Leveraged robust tooling; it was great.").join(" ")).toMatch(
      /Avoid "leveraged", "robust".*semicolons.*trailing period/,
    );
    expect(
      checkPhrasing(
        "Built a fault-tolerant key-value store in Go, sustaining 12,000 writes/sec across 5 nodes",
      ),
    ).toEqual([]);
  });
});
