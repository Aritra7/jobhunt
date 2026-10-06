import { useState } from "react";
import LinesInput from "../common/LinesInput";
import { ROLES, roleById } from "../../data/roleStyles";
import { autoFit, checkPhrasing, draftBullets, keywordHits } from "../../utils/projectPhrasing";

// Phrase one project for each role family. Each role keeps its own bullet
// bank; "Draft" writes bullets from the project's facts for the user to edit.
export default function RolePhrasing({ project, onChange }) {
  const [roleId, setRoleId] = useState("sde");
  const role = roleById(roleId);
  const bullets = project.bullets[roleId];
  const manualFit = project.roleFit[roleId];
  const hits = keywordHits(project, roleId);

  const setBullets = (list) => onChange({ bullets: { ...project.bullets, [roleId]: list } });

  function draft() {
    if (bullets.length && !window.confirm(`Replace the ${role.label} bullets with new drafts?`)) {
      return;
    }
    setBullets(draftBullets(project, roleId));
  }

  function setFit(value) {
    const roleFit = { ...project.roleFit };
    if (value === "auto") delete roleFit[roleId];
    else roleFit[roleId] = Number(value);
    onChange({ roleFit });
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
        <div className="muted">
          Matched {role.label} keywords: {hits.length ? hits.join(", ") : "none yet"}
        </div>
      </div>
      <label className="inline-label">
        {role.label} fit
        <select
          value={Number.isInteger(manualFit) ? manualFit : "auto"}
          onChange={(e) => setFit(e.target.value)}
        >
          <option value="auto">Auto ({autoFit(project, roleId)})</option>
          {[0, 1, 2, 3].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
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
