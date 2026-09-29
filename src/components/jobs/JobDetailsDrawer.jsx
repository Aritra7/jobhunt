import SaveButton from "../common/SaveButton";
import SkillChips from "../common/SkillChips";
import { formatSalary, getMatchScore, getSkillGaps } from "../../utils/jobUtils";

export default function JobDetailsDrawer({ job, profile, saved, onClose, onSave, onApply }) {
  if (!job) return null;
  const { industry, size, culture, note } = job.companyInsights;

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
          {job.requirements.map((requirement) => (
            <li key={requirement}>{requirement}</li>
          ))}
        </ul>
        <h4>Company overview</h4>
        <div className="info-box">
          <strong>{industry}</strong>
          <div>{size}</div>
          <div>{culture}</div>
          <div>{note}</div>
        </div>
        <h4>Skill gaps</h4>
        <SkillChips
          skills={getSkillGaps(job, profile.skills)}
          variant="warning"
          emptyText="No major skill gaps"
        />
        <div className="inline-actions">
          <SaveButton saved={saved} onClick={() => onSave(job.id)} label="Save job" />
          <button className="btn btn-primary" onClick={() => onApply(job.id)}>
            Start application
          </button>
        </div>
      </aside>
    </div>
  );
}
