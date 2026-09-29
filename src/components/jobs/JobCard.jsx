import React from 'react';
import JobBadges from './JobBadges';
import CompanyLogo from './CompanyLogo';
import { statusLabel } from '../../data/applicationStatuses';

const PREVIEW_CHARS = 140;

/**
 * @param {{
 *   job: import('../../types').Job,
 *   onSelect: (job: import('../../types').Job) => void,
 *   application: import('../../types').Application | null,
 *   onSave: (job: import('../../types').Job) => void,
 *   isHidden: boolean,
 *   onToggleHidden: (jobId: string) => void,
 * }} props
 */
export default function JobCard({ job, onSelect, application, onSave, isHidden, onToggleHidden }) {
  const preview = job.descriptionText.length > PREVIEW_CHARS
    ? job.descriptionText.slice(0, PREVIEW_CHARS).trimEnd() + '…'
    : job.descriptionText;

  /** @param {React.SyntheticEvent} e */
  const stop = (e) => e.stopPropagation();

  return (
    <article
      className={isHidden ? 'job-card is-hidden' : 'job-card'}
      onClick={() => onSelect(job)}
      onKeyDown={(e) => { if (e.key === 'Enter') onSelect(job); }}
      tabIndex={0}
      aria-label={`${job.title} at ${job.company}`}
    >
      <div className="job-card-header">
        <CompanyLogo job={job} />
        <div className="job-card-heading">
          <h3 className="job-title">{job.title}</h3>
          <h4 className="job-company">{job.company}</h4>
        </div>
      </div>
      <JobBadges job={job} />
      <p className="job-preview">{preview}</p>
      <div className="job-card-footer" onClick={stop} onKeyDown={stop}>
        <span className="job-source">via {job.sourceName}</span>
        <div className="job-card-actions">
          {application ? (
            <span className={`status-pill status-${application.status}`}>★ {statusLabel(application.status)}</span>
          ) : (
            <button type="button" className="link-button" onClick={() => onSave(job)}>☆ Save</button>
          )}
          <button type="button" className="link-button muted" onClick={() => onToggleHidden(job.id)}>
            {isHidden ? 'Unhide' : 'Hide'}
          </button>
        </div>
      </div>
    </article>
  );
}
