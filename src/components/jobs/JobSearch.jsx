import React, { useState } from 'react';
import JobFilters from './JobFilters';
import JobList from './JobList';
import JobDetail from './JobDetail';
import MatchedJobs from './MatchedJobs';
import useJobFilters from '../../hooks/useJobFilters';

const PAGE_SIZE = 24;

/**
 * Job search page: recommendations, filters, results and job detail.
 * @param {{
 *   jobsState: ReturnType<typeof import('../../hooks/useJobs').default>,
 *   profile: import('../../types').Profile | null,
 *   hasProfile: boolean,
 *   tracker: ReturnType<typeof import('../../hooks/useTracker').default>,
 *   hidden: ReturnType<typeof import('../../hooks/useHiddenJobs').default>,
 *   onEditProfile: () => void,
 *   onCheckResume: (job: import('../../types').Job) => void,
 * }} props
 */
export default function JobSearch({ jobsState, profile, hasProfile, tracker, hidden, onEditProfile, onCheckResume }) {
  const [selectedJob, setSelectedJob] = useState(/** @type {import('../../types').Job | null} */ (null));
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const { jobs, status, errors, loadMore, loadingMore, canLoadMore, retry } = jobsState;
  const filters = useJobFilters(jobs, hidden.hiddenSet);

  /** @param {import('../../types').Job} job */
  const selectJob = (job) => {
    setSelectedJob(job);
    window.scrollTo({ top: 0 });
  };

  if (selectedJob) {
    return (
      <JobDetail
        job={selectedJob}
        allJobs={jobs}
        application={tracker.findByJobId(selectedJob.id)}
        tracker={tracker}
        isHidden={hidden.hiddenSet.has(selectedJob.id)}
        onToggleHidden={hidden.toggleHidden}
        onBack={() => setSelectedJob(null)}
        onSelectJob={selectJob}
        onCheckResume={onCheckResume}
      />
    );
  }

  if (status === 'loading') {
    return (
      <div className="loading-state" role="status">
        <div className="spinner" aria-hidden="true" />
        <p>Loading live jobs from Arbeitnow, Remotive and The Muse…</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="no-results" role="alert">
        <h2>Couldn't load jobs</h2>
        <p>{errors.map(e => `${e.source}: ${e.message}`).join(' · ')}</p>
        <button type="button" className="primary-button" onClick={retry}>Try again</button>
      </div>
    );
  }

  const listProps = {
    onSelectJob: selectJob,
    findApplication: tracker.findByJobId,
    onSave: (/** @type {import('../../types').Job} */ job) => tracker.trackJob(job, 'saved'),
    hiddenSet: hidden.hiddenSet,
    onToggleHidden: hidden.toggleHidden,
  };

  const { filteredJobs } = filters;
  const shown = filteredJobs.slice(0, visibleCount);
  const canShowMore = visibleCount < filteredJobs.length;

  const showMore = () => {
    if (canShowMore) setVisibleCount(c => c + PAGE_SIZE);
    else loadMore();
  };

  return (
    <div className="job-search-view">
      {errors.length > 0 && (
        <div className="warning-banner" role="status">
          Some sources didn't respond ({errors.map(e => e.source).join(', ')}). Showing results from the rest.
          <button type="button" className="link-button" onClick={retry}>Retry</button>
        </div>
      )}

      {hasProfile && (
        <MatchedJobs
          jobs={jobs}
          profile={profile}
          listProps={listProps}
          onUseProfile={() => { filters.applyProfile(profile); setVisibleCount(PAGE_SIZE); }}
          onEditProfile={onEditProfile}
        />
      )}
      {!hasProfile && (
        <div className="info-banner">
          Set your <button type="button" className="link-button" onClick={onEditProfile}>job preferences</button> to get personalized recommendations.
        </div>
      )}

      <JobFilters filters={filters} hiddenCount={hidden.hiddenCount} />
      <p className="results-count">Showing {shown.length} of {filteredJobs.length} matching jobs ({jobs.length} loaded)</p>
      <JobList jobs={shown} {...listProps} />

      {(canShowMore || canLoadMore) && (
        <div className="load-more">
          <button type="button" className="secondary-button" onClick={showMore} disabled={loadingMore}>
            {loadingMore ? 'Loading more jobs…' : canShowMore ? 'Show more' : 'Load more jobs'}
          </button>
        </div>
      )}

      <p className="attribution">
        Jobs from <a href="https://www.arbeitnow.com" target="_blank" rel="noopener noreferrer">Arbeitnow</a>,{' '}
        <a href="https://remotive.com" target="_blank" rel="noopener noreferrer">Remotive</a> and{' '}
        <a href="https://www.themuse.com" target="_blank" rel="noopener noreferrer">The Muse</a>.
      </p>
    </div>
  );
}
