import FeatureBadge from "../common/FeatureBadge";
import TrackButton from "./TrackButton";
import SponsorshipChip from "./SponsorshipChip";
import { formatSalary, getMatchScore, recommendationScore } from "../../utils/jobUtils";

export default function JobCard({ job, profile, application, onSave, onHide, onDetails, onApply }) {
  return (
    <article className="job-card">
      <div>
        <div className="job-title-row">
          <h3 className="job-title">{job.title}</h3>
          <FeatureBadge release="V1" />
        </div>
        <div className="company">{job.company}</div>
        <div className="meta">
          {job.location} · {job.mode} · {job.type} · {formatSalary(job)} · {job.posted} · via{" "}
          {job.sourceName}
        </div>
        <div className="chips">
          <span className="chip success">{getMatchScore(job, profile.skills)}% skill match</span>
          <span className="chip accent">{recommendationScore(job, profile)}% recommendation</span>
          <SponsorshipChip sponsorship={job.sponsorship} />
          {job.benefits?.length > 0 && (
            <span className="chip" title={job.benefits.join(", ")}>
              {job.benefits.length} benefits
            </span>
          )}
          {job.skills.slice(0, 8).map((skill) => (
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
        <TrackButton application={application} onToggle={() => onSave(job)} />
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
