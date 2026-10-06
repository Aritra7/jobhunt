import { useState } from "react";
import LinesInput from "../common/LinesInput";
import { ROLES, roleById } from "../../data/roleStyles";
import { checkPhrasing, draftBullets, keywordHits, roleFit } from "../../utils/projectPhrasing";

// Phrase one project for each role family. Each role keeps its own bullet
// bank; "Draft" writes bullets from the project's facts for the user to edit.
export default function RolePhrasing({ project, onChange }) {
  const [roleId, setRoleId] = useState("sde");
  const role = roleById(roleId);
  const bullets = project.bullets[roleId];
  const hits = keywordHits(project, roleId);

  const setBullets = (list) => onChange({ bullets: { ...project.bullets, [roleId]: list } });

  function draft() {
    if (bullets.length && !window.confirm(`Replace the ${role.label} bullets with new drafts?`)) {
      return;
    }
    setBullets(draftBullets(project, roleId));
  }

  return (
    <div className="stack">
      <div className="chips" role="group" aria-label="Role">
        {ROLES.map((r) => (
          <button
            type="button"
            key={r.id}
            className={`chip button-chip toggle-chip${r.id === roleId ? " accent" : ""}`}
            aria-pressed={r.id === roleId}
            onClick={() => setRoleId(r.id)}
          >
            {r.label}
          </button>
        ))}
      </div>
      <div className="info-box">
        <strong>{role.name}</strong>: {role.focus}
        <div>
          <strong>
            {role.label} fit: {roleFit(project, roleId)}/3
          </strong>{" "}
          <span className="muted">
            (from the {role.label} keywords in this write-up:{" "}
            {hits.length ? hits.join(", ") : "none"})
          </span>
        </div>
      </div>
      <label>
        {role.label} bullets (one per line)
        <LinesInput
          rows={5}
          value={bullets}
          placeholder={`Click "Draft ${role.label} bullets" or write your own`}
          onChange={setBullets}
        />
      </label>
      <div className="inline-actions">
        <button type="button" className="btn btn-soft" onClick={draft}>
          Draft {role.label} bullets
        </button>
      </div>
      <BulletChecks bullets={bullets} />
    </div>
  );
}

function BulletChecks({ bullets }) {
  const filled = bullets.map((b) => b.trim()).filter(Boolean);
  if (filled.length === 0) return null;
  return (
    <ul className="phrasing-checks">
      {filled.map((bullet, i) => {
        const issues = checkPhrasing(bullet);
        return (
          <li key={i} className={issues.length ? "bullet-issues" : "bullet-ok"}>
            {issues.length ? `Bullet ${i + 1}: ${issues.join(" ")}` : `Bullet ${i + 1} looks good.`}
          </li>
        );
      })}
    </ul>
  );
}
