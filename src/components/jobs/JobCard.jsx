import FeatureBadge from "../common/FeatureBadge";
import SaveButton from "../common/SaveButton";
import { formatSalary, getMatchScore, recommendationScore } from "../../utils/jobUtils";

export default function JobCard({ job, profile, saved, onSave, onHide, onDetails, onApply }) {
  return (
    <article className="job-card">
      <div>
        <div className="job-title-row">
          <h3 className="job-title">{job.title}</h3>
          <FeatureBadge release="V1" />
        </div>
        <div className="company">{job.company}</div>
        <div className="meta">
          {job.location} · {job.mode} · {job.type} · {formatSalary(job)} · {job.posted}
        </div>
        <div className="chips">
          <span className="chip success">{getMatchScore(job, profile.skills)}% skill match</span>
          <span className="chip accent">{recommendationScore(job, profile)}% recommendation</span>
          {job.skills.map((skill) => (
            <span className="chip" key={skill}>
              {skill}
            </span>
          ))}
        </div>
      </div>
      <div className="job-actions">
        <button className="btn btn-primary" onClick={() => onDetails(job)}>
          View details
        </button>
        <SaveButton saved={saved} onClick={() => onSave(job.id)} />
        <button className="btn btn-soft" onClick={() => onApply(job.id)}>
          Apply
        </button>
        <button className="btn btn-ghost" onClick={() => onHide(job.id)}>
          Hide
        </button>
      </div>
    </article>
  );
}
