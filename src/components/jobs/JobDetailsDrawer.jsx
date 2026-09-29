import SafeHtml from "../common/SafeHtml";
import SkillChips from "../common/SkillChips";
import CompanyOverview from "./CompanyOverview";
import TrackButton from "./TrackButton";
import StatusSelect from "../tracker/StatusSelect";
import useJobDetails from "../../hooks/useJobDetails";
import { enrichJob } from "../../utils/jobFields";
import { formatSalary, getMatchScore, getSkillGaps } from "../../utils/jobUtils";

function SampleCompany({ insights }) {
  return (
    <div className="info-box">
      <strong>{insights.industry}</strong>
      <div>{insights.size}</div>
      <div>{insights.culture}</div>
      <div>{insights.note}</div>
    </div>
  );
}

function Description({ loading, error, job }) {
  if (loading) return <p className="muted">Loading description…</p>;
  if (error || !job.descriptionHtml) {
    return (
      <p className="muted">
        Couldn't load the description.{" "}
        {job.url && (
          <a href={job.url} target="_blank" rel="noopener noreferrer">
            Read it on the original posting ↗
          </a>
        )}
      </p>
    );
  }
  // SEC-3: third-party HTML is only ever rendered through SafeHtml.
  return <SafeHtml className="job-description" html={job.descriptionHtml} />;
}

export default function JobDetailsDrawer({
  job: listJob,
  allJobs,
  profile,
  application,
  onClose,
  onSave,
  onApply,
  onStatusChange,
  onCheckResume,
  onSelectJob,
}) {
  // Some sources (Greenhouse) only send the description when a job is opened.
  const details = useJobDetails(listJob);
  const job = details.job === listJob ? listJob : enrichJob(details.job);

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
          <button className="close-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="chips">
          <span className="chip success">{getMatchScore(job, profile.skills)}% profile match</span>
          <span className="chip">{job.posted}</span>
          <span className="chip">via {job.sourceName}</span>
        </div>
        <div className="inline-actions">
          {job.url && (
            <a className="btn btn-primary" href={job.url} target="_blank" rel="noopener noreferrer">
              Apply on {job.source === "greenhouse" ? job.company : job.sourceName} ↗
            </a>
          )}
          <button className="btn btn-soft" onClick={() => onApply(job.id)}>
            Start application
          </button>
          <button className="btn btn-secondary" onClick={() => onCheckResume(job)}>
            Check my resume (ATS)
          </button>
        </div>
        <div className="inline-actions">
          {application ? (
            <label className="inline-label">
              Tracking
              <StatusSelect
                value={application.status}
                onChange={(status) => onStatusChange(application.id, status)}
              />
            </label>
          ) : (
            <TrackButton application={null} onToggle={() => onSave(job)} label="Save job" />
          )}
        </div>
        <h4>Description</h4>
        <Description loading={details.loading} error={details.error} job={job} />
        <h4>Skill gaps</h4>
        <SkillChips
          skills={getSkillGaps(job, profile.skills)}
          variant="warning"
          emptyText="No major skill gaps"
        />
        <h4>Company overview</h4>
        {job.companyInsights ? (
          <SampleCompany insights={job.companyInsights} />
        ) : (
          <CompanyOverview job={job} allJobs={allJobs} onSelectJob={onSelectJob} />
        )}
      </aside>
    </div>
  );
}
