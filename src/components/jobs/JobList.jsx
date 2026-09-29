import React from 'react';
import JobCard from './JobCard';

/**
 * @param {{
 *   jobs: import('../../types').Job[],
 *   onSelectJob: (job: import('../../types').Job) => void,
 *   findApplication: (jobId: string) => import('../../types').Application | null,
 *   onSave: (job: import('../../types').Job) => void,
 *   hiddenSet: Set<string>,
 *   onToggleHidden: (jobId: string) => void,
 *   emptyHint?: string,
 * }} props
 */
export default function JobList({ jobs, onSelectJob, findApplication, onSave, hiddenSet, onToggleHidden, emptyHint }) {
  if (jobs.length === 0) {
    return (
      <div className="no-results">
        <h2>No results found</h2>
        <p>{emptyHint || 'Try a different keyword, clear a filter, or load more jobs.'}</p>
      </div>
    );
  }

  return (
    <div className="job-list">
      {jobs.map(job => (
        <JobCard
          key={job.id}
          job={job}
          onSelect={onSelectJob}
          application={findApplication(job.id)}
          onSave={onSave}
          isHidden={hiddenSet.has(job.id)}
          onToggleHidden={onToggleHidden}
        />
      ))}
    </div>
  );
}
