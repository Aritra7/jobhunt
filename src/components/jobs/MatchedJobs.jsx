import React, { useMemo } from 'react';
import JobList from './JobList';
import { matchJobs } from '../../utils/matchJobs';

const PREVIEW_COUNT = 6;

/**
 * "Recommended for you": the jobs that best fit the saved profile.
 * @param {{
 *   jobs: import('../../types').Job[],
 *   profile: import('../../types').Profile | null,
 *   listProps: Omit<Parameters<typeof JobList>[0], 'jobs'>,
 *   onUseProfile: () => void,
 *   onEditProfile: () => void,
 * }} props
 */
export default function MatchedJobs({ jobs, profile, listProps, onUseProfile, onEditProfile }) {
  const matched = useMemo(() => matchJobs(jobs, profile), [jobs, profile]);
  const visible = matched.filter(job => !listProps.hiddenSet.has(job.id)).slice(0, PREVIEW_COUNT);

  return (
    <section className="matched-jobs">
      <div className="matched-jobs-header">
        <div>
          <h2>Recommended for you</h2>
          <p className="section-description">
            {matched.length === 0
              ? 'No loaded jobs match your saved preferences yet. Try broader keywords or load more jobs.'
              : `${matched.length} job${matched.length === 1 ? '' : 's'} match your preferences — best matches first.`}
          </p>
        </div>
        <div className="matched-jobs-actions">
          <button type="button" className="primary-button" onClick={onUseProfile}>Use saved profile</button>
          <button type="button" className="secondary-button" onClick={onEditProfile}>Edit preferences</button>
        </div>
      </div>

      {visible.length > 0 && <JobList jobs={visible} {...listProps} />}
    </section>
  );
}
