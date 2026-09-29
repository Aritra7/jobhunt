import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useJobsData } from "../context/JobsContext";
import { useJobFilters } from "../hooks/useJobFilters";
import { useJobLookup } from "../hooks/useJobOptions";
import { useStartApplication } from "../hooks/useSelectedJob";
import FeatureBadge from "../components/common/FeatureBadge";
import SectionCard from "../components/common/SectionCard";
import EmptyState from "../components/common/EmptyState";
import JobCard from "../components/jobs/JobCard";
import JobDetailsDrawer from "../components/jobs/JobDetailsDrawer";
import JobFilters from "../components/jobs/JobFilters";
import JobsStatusBanner from "../components/jobs/JobsStatusBanner";
import SourceAttribution from "../components/jobs/SourceAttribution";
import PreferencesPanel from "../components/jobs/PreferencesPanel";
import HiddenJobs from "../components/jobs/HiddenJobs";
import MatchedJobs from "../components/jobs/MatchedJobs";
import { filtersFromProfile, hasPreferences, matchJobs } from "../utils/matching";
import { filterJobs, topLocations } from "../utils/jobUtils";

const PAGE_SIZE = 24;

function MissingJob({ onClose }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <aside className="drawer" onMouseDown={(e) => e.stopPropagation()}>
        <h2>This job isn't in the loaded results</h2>
        <p className="muted">It may have been filled or removed, or it hasn't loaded yet.</p>
        <button className="btn btn-primary" onClick={onClose}>
          Back to jobs
        </button>
      </aside>
    </div>
  );
}

export default function JobDiscovery() {
  const app = useApp();
  const { profile, setProfile, hiddenSet, toggleHidden, toggleSaved, findByJobId } = app;
  const jobsData = useJobsData();
  const { jobs, status } = jobsData;
  const loading = status === "loading";
  const navigate = useNavigate();
  const { jobId } = useParams();
  const lookup = useJobLookup();
  const startApplication = useStartApplication();
  const [showPreferences, setShowPreferences] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visible = useMemo(() => jobs.filter((job) => !hiddenSet.has(job.id)), [jobs, hiddenSet]);
  const hidden = useMemo(() => jobs.filter((job) => hiddenSet.has(job.id)), [jobs, hiddenSet]);
  const { filters, setFilter, applyFilters, results } = useJobFilters(visible, profile);
  const locations = useMemo(
    () => topLocations(filterJobs(visible, { region: filters.region })),
    [visible, filters.region],
  );
  const matches = useMemo(() => matchJobs(visible, profile), [visible, profile]);
  const selectedJob = lookup(jobId);
  const shown = results.slice(0, visibleCount);
  const canShowMore = visibleCount < results.length;

  const openJob = (job) => navigate(`/jobs/${encodeURIComponent(job.id)}`);
  const closeJob = () => navigate("/jobs");

  function checkResume(job) {
    if (!findByJobId(job.id)) app.trackJob(job, "saved");
    navigate("/resume-profile/ats", { state: { jobId: job.id } });
  }

  function showMore() {
    if (canShowMore) setVisibleCount((n) => n + PAGE_SIZE);
    else jobsData.loadMore();
  }

  return (
    <>
      <JobsStatusBanner jobsData={jobsData} />
      {!loading && hasPreferences(profile) && (
        <MatchedJobs
          matches={matches}
          onSelectJob={openJob}
          onUseProfile={() => applyFilters(filtersFromProfile(profile, locations))}
          onEditPreferences={() => setShowPreferences(true)}
        />
      )}
      <SectionCard
        title="Find opportunities"
        badges={["V1"]}
        description="Search, filter, compare fit, inspect company context, save jobs, or hide irrelevant ones."
        actions={
          <button className="btn btn-soft" onClick={() => setShowPreferences((v) => !v)}>
            Job preferences <FeatureBadge release="V2" />
          </button>
        }
      >
        {showPreferences && <PreferencesPanel profile={profile} setProfile={setProfile} />}
        <JobFilters filters={filters} setFilter={setFilter} locations={locations} />
        <div className="results-meta">
          <span>
            {loading
              ? "Loading live jobs…"
              : `${results.length} jobs found (${jobs.length} loaded)`}
          </span>
          <span>{hiddenSet.size} hidden</span>
        </div>
        <div className="job-list">
          {shown.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              profile={profile}
              application={findByJobId(job.id)}
              onSave={toggleSaved}
              onHide={toggleHidden}
              onDetails={openJob}
              onApply={startApplication}
            />
          ))}
        </div>
        {!loading && results.length === 0 && (
          <EmptyState>No jobs match your current filters.</EmptyState>
        )}
        {(canShowMore || jobsData.canLoadMore) && (
          <div className="inline-actions">
            <button
              className="btn btn-secondary"
              onClick={showMore}
              disabled={jobsData.loadingMore}
            >
              {jobsData.loadingMore
                ? "Loading more jobs…"
                : canShowMore
                  ? "Show more"
                  : "Load more jobs"}
            </button>
          </div>
        )}
        <SourceAttribution />
      </SectionCard>
      <HiddenJobs jobs={hidden} onRestore={toggleHidden} />
      {jobId && !selectedJob && !loading && <MissingJob onClose={closeJob} />}
      {selectedJob && (
        <JobDetailsDrawer
          key={selectedJob.id}
          job={selectedJob}
          allJobs={jobs}
          profile={profile}
          application={findByJobId(selectedJob.id)}
          onClose={closeJob}
          onSave={toggleSaved}
          onApply={startApplication}
          onStatusChange={(id, status) => app.updateApplication(id, { status })}
          onCheckResume={checkResume}
          onSelectJob={openJob}
        />
      )}
    </>
  );
}
