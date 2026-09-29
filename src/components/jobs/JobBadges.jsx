import React from 'react';
import { timeAgo } from '../../utils/format';

/**
 * Location, remote, job type, salary and posted date for a job.
 * @param {{ job: import('../../types').Job }} props
 */
export default function JobBadges({ job }) {
  return (
    <div className="job-badges">
      <span className="badge">📍 {job.location}</span>
      {job.remote && <span className="badge badge-remote">Remote</span>}
      {job.jobTypes.map(type => <span key={type} className="badge">{type}</span>)}
      {job.level && <span className="badge">{job.level}</span>}
      {job.salary && <span className="badge badge-salary">💰 {job.salary}</span>}
      <span className="badge badge-muted" title={job.postedAt}>Posted {timeAgo(job.postedAt)}</span>
    </div>
  );
}
