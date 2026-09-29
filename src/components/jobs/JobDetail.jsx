import React from 'react';
import JobBadges from './JobBadges';
import CompanyLogo from './CompanyLogo';
import CompanyOverview from './CompanyOverview';
import SafeHtml from '../common/SafeHtml';
import StatusSelect from '../tracker/StatusSelect';
import useJobDetails from '../../hooks/useJobDetails';

/**
 * @param {{
 *   job: import('../../types').Job,
 *   allJobs: import('../../types').Job[],
 *   application: import('../../types').Application | null,
 *   tracker: ReturnType<typeof import('../../hooks/useTracker').default>,
 *   isHidden: boolean,
 *   onToggleHidden: (jobId: string) => void,
 *   onBack: () => void,
 *   onSelectJob: (job: import('../../types').Job) => void,
 *   onCheckResume: (job: import('../../types').Job) => void,
 * }} props
 */
export default function JobDetail({ job: listJob, allJobs, application, tracker, isHidden, onToggleHidden, onBack, onSelectJob, onCheckResume }) {
  // Some sources only send the description when a job is opened.
  const { job, loading, error } = useJobDetails(listJob);

  return (
    <div className="job-detail-container">
      <button type="button" className="back-button" onClick={onBack}>&larr; Back to results</button>

      <div className="job-detail-layout">
        <div className="job-detail-content">
          <div className="job-detail-header">
            <CompanyLogo job={job} size={56} />
            <div>
              <h2 className="job-detail-title">{job.title}</h2>
              <h3 className="job-detail-company">{job.company}</h3>
            </div>
          </div>
          <JobBadges job={job} />

          <div className="job-detail-actions">
            {job.url && (
              <a className="primary-button" href={job.url} target="_blank" rel="noopener noreferrer">
                {job.source === 'greenhouse' ? `Apply on ${job.company}'s site` : `Apply on ${job.sourceName}`} ↗
              </a>
            )}
            {application ? (
              <label className="inline-field">
                <span>Tracking:</span>
                <StatusSelect value={application.status} onChange={(status) => tracker.updateApplication(application.id, { status })} />
              </label>
            ) : (
              <>
                <button type="button" className="secondary-button" onClick={() => tracker.trackJob(job, 'saved')}>☆ Save to tracker</button>
                <button type="button" className="secondary-button" onClick={() => tracker.trackJob(job, 'applied')}>Mark as applied</button>
              </>
            )}
            <button type="button" className="secondary-button" onClick={() => onCheckResume(job)}>Check my resume (ATS)</button>
            <button type="button" className="link-button muted" onClick={() => onToggleHidden(job.id)}>
              {isHidden ? 'Unhide job' : 'Hide job'}
            </button>
          </div>

          {job.tags.length > 0 && (
            <div className="job-tags">
              {job.tags.slice(0, 12).map(tag => <span key={tag} className="tag">{tag}</span>)}
            </div>
          )}

          <div className="job-description-section">
            <h4>Job description</h4>
            {loading && <p className="muted">Loading description…</p>}
            {error && (
              <p className="muted">
                Couldn't load the description.{' '}
                {job.url && <a href={job.url} target="_blank" rel="noopener noreferrer">Read it on the original posting ↗</a>}
              </p>
            )}
            {!loading && !error && <SafeHtml className="job-detail-description" html={job.descriptionHtml} />}
          </div>
          <p className="attribution">
            Listing from <strong>{job.sourceName}</strong>
            {job.url && <> — <a href={job.url} target="_blank" rel="noopener noreferrer">view original posting ↗</a></>}
          </p>
        </div>

        <CompanyOverview job={job} allJobs={allJobs} onSelectJob={onSelectJob} />
      </div>
    </div>
  );
}
