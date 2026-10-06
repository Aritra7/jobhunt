import { useState } from "react";
import { ROLES, roleById } from "../../data/roleStyles";
import { atsScore } from "../../utils/ats";
import { downloadText } from "../../utils/download";
import {
  DEFAULT_PROJECT_COUNT,
  asScorableResume,
  buildTailoredResume,
  rankProjects,
  resumeToMarkdown,
} from "../../utils/resumeGenerator";
import ResumePreview from "../resume/ResumePreview";
import SavedVariants from "./SavedVariants";

const topIds = (ranked) =>
  ranked
    .filter((r) => r.fit > 0)
    .slice(0, DEFAULT_PROJECT_COUNT)
    .map((r) => r.project.id);

/**
 * Pick a role (and optionally a job), and get a resume whose projects and
 * bullets are chosen and phrased for that role.
 */
export default function ResumeGenerator({
  projects,
  resume,
  template,
  applications,
  variants,
  onSaveVariant,
  onRemoveVariant,
}) {
  const withText = applications.filter((a) => a.descriptionText.trim());
  const [roleId, setRoleId] = useState("sde");
  const [targetId, setTargetId] = useState(withText[0]?.id || "none");
  const [pasted, setPasted] = useState("");
  const target = withText.find((a) => a.id === targetId);
  const jobText = target ? target.descriptionText : targetId === "paste" ? pasted : "";
  const ranked = rankProjects(projects, roleId, jobText);
  const [selected, setSelected] = useState(() => topIds(ranked));
  const role = roleById(roleId);

  const chosen = ranked.map((r) => r.project).filter((p) => selected.includes(p.id));
  const tailored = buildTailoredResume(resume, chosen, roleId, jobText);
  const score = jobText.trim() ? atsScore(asScorableResume(tailored), jobText) : null;

  function chooseRole(id) {
    setRoleId(id);
    setSelected(topIds(rankProjects(projects, id, jobText)));
  }

  function toggle(id) {
    setSelected((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  function loadVariant(variant) {
    setRoleId(variant.roleId);
    setTargetId("paste");
    setPasted(variant.jobText);
    setSelected(variant.projectIds);
  }

  const name = `${role.label} resume${target ? ` · ${target.company}` : ""}`;

  return (
    <div className="stack">
      <div className="chips" role="group" aria-label="Target role">
        {ROLES.map((r) => (
          <button
            type="button"
            key={r.id}
            className={`chip button-chip toggle-chip${r.id === roleId ? " accent" : ""}`}
            aria-pressed={r.id === roleId}
            onClick={() => chooseRole(r.id)}
          >
            {r.name}
          </button>
        ))}
      </div>
      <label>
        Tailor to a job (optional)
        <select value={targetId} onChange={(e) => setTargetId(e.target.value)}>
          <option value="none">No specific job</option>
          <option value="paste">Paste a job description…</option>
          {withText.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title} — {a.company}
            </option>
          ))}
        </select>
      </label>
      {targetId === "paste" && (
        <label>
          Job description
          <textarea rows={5} value={pasted} onChange={(e) => setPasted(e.target.value)} />
        </label>
      )}

      <div className="resume-layout">
        <div className="stack">
          <h4>Projects for a {role.name} resume</h4>
          <p className="muted">
            Ranked by {role.label} fit{jobText ? " and overlap with the job" : ""}. The top{" "}
            {DEFAULT_PROJECT_COUNT} are picked; change them below.
          </p>
          {ranked.map(({ project, fit, matched }) => (
            <label className="checkbox-label project-choice" key={project.id}>
              <input
                type="checkbox"
                checked={selected.includes(project.id)}
                onChange={() => toggle(project.id)}
              />
              <span>
                <strong>{project.title}</strong> · {role.label} fit {fit}
                {matched.length > 0 && ` · matches ${matched.join(", ")}`}
                {project.bullets[roleId].length === 0 && (
                  <span className="muted"> · uses drafted bullets</span>
                )}
              </span>
            </label>
          ))}
          {score && (
            <div className="info-box">
              ATS score for this job: <strong>{score.score}/100</strong>
              {score.missing.length > 0 && ` · missing: ${score.missing.slice(0, 6).join(", ")}`}
            </div>
          )}
          <div className="inline-actions">
            <button className="btn btn-secondary" onClick={() => window.print()}>
              Print / save as PDF
            </button>
            <button
              className="btn btn-secondary"
              onClick={() =>
                downloadText(
                  `${name.replace(/\W+/g, "-").toLowerCase()}.md`,
                  resumeToMarkdown(tailored, role.name),
                )
              }
            >
              Download .md
            </button>
            <button
              className="btn btn-primary"
              onClick={() => onSaveVariant({ name, roleId, jobText, projectIds: selected })}
            >
              Save this version
            </button>
          </div>
          <SavedVariants variants={variants} onLoad={loadVariant} onRemove={onRemoveVariant} />
        </div>
        <ResumePreview resume={tailored} template={template} skillsLast />
      </div>
    </div>
  );
}
