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
import TemplatePicker from "../resume/TemplatePicker";
import SavedVariants from "./SavedVariants";

const topIds = (ranked) =>
  ranked
    .filter((r) => r.fit > 0)
    .slice(0, DEFAULT_PROJECT_COUNT)
    .map((r) => r.project.id);

/**
 * The Tailored resume tab: pick a role, and the resume's projects and bullets
 * are chosen and phrased for it. The target job comes from the page's shared
 * job picker (the same one the ATS and cover-letter tabs use).
 */
export default function ResumeGenerator({
  projects,
  resumeState,
  target,
  onLoadJobText,
  variants,
  onSaveVariant,
  onRemoveVariant,
}) {
  const jobText = target?.descriptionText || "";
  const [roleId, setRoleId] = useState("sde");
  const ranked = rankProjects(projects, roleId, jobText);
  const [selected, setSelected] = useState(() => topIds(ranked));
  const role = roleById(roleId);

  const chosen = ranked.map((r) => r.project).filter((p) => selected.includes(p.id));
  const tailored = buildTailoredResume(resumeState.resume, chosen, roleId, jobText);
  const score = jobText.trim() ? atsScore(asScorableResume(tailored), jobText) : null;
  const name = `${role.label} resume${target?.company ? ` · ${target.company}` : ""}`;

  function chooseRole(id) {
    setRoleId(id);
    setSelected(topIds(rankProjects(projects, id, jobText)));
  }

  function toggle(id) {
    setSelected((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  function loadVariant(variant) {
    setRoleId(variant.roleId);
    setSelected(variant.projectIds);
    onLoadJobText(variant.jobText);
  }

  return (
    <div className="resume-layout">
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
        <h4>Projects for a {role.name} resume</h4>
        <p className="muted">
          Ranked by {role.label} fit{jobText ? " and overlap with the target job" : ""}. The top{" "}
          {DEFAULT_PROJECT_COUNT} are picked; change them below. Edit projects in the Projects tab.
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
            ATS score for the target job: <strong>{score.score}/100</strong>
            {score.missing.length > 0 && ` · missing: ${score.missing.slice(0, 6).join(", ")}`}
          </div>
        )}
        <div className="inline-actions">
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
      <div className="stack preview-column">
        <TemplatePicker selected={resumeState.template} onSelect={resumeState.setTemplate} />
        <ResumePreview resume={tailored} template={resumeState.template} skillsLast />
      </div>
    </div>
  );
}
