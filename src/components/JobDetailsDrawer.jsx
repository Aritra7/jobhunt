import { formatSalary, getMatchScore, getSkillGaps } from "../utils/jobUtils";
export default function JobDetailsDrawer({ job, profile, saved, onClose, onSave, onApply }) {
  if (!job) return null;
  const gaps = getSkillGaps(job, profile.skills);
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <aside className="drawer" onMouseDown={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <div>
            <div className="eyebrow">JOB DETAILS</div>
            <h2>{job.title}</h2>
            <div className="company">{job.company}</div>
            <div className="meta">
              {job.location} · {job.mode} · {formatSalary(job)}
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="chips">
          <span className="chip success">{getMatchScore(job, profile.skills)}% profile match</span>
          <span className="chip">{job.posted}</span>
        </div>
        <h4>Description</h4>
        <p>{job.description}</p>
        <h4>Requirements</h4>
        <ul>
          {job.requirements.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <h4>Company overview</h4>
        <div className="info-box">
          <strong>{job.companyInsights.industry}</strong>
          <div>{job.companyInsights.size}</div>
          <div>{job.companyInsights.culture}</div>
          <div>{job.companyInsights.note}</div>
        </div>
        <h4>Skill gaps</h4>
        <div className="chips">
          {gaps.length ? (
            gaps.map((x) => (
              <span className="chip warning" key={x}>
                {x}
              </span>
            ))
          ) : (
            <span className="chip success">No major skill gaps</span>
          )}
        </div>
        <div className="inline-actions">
          <button
            className={`btn ${saved ? "btn-success" : "btn-secondary"}`}
            onClick={() => onSave(job.id)}
          >
            {saved ? "Saved ✓" : "Save job"}
          </button>
          <button className="btn btn-primary" onClick={() => onApply(job.id)}>
            Start application
          </button>
        </div>
      </aside>
    </div>
  );
}
