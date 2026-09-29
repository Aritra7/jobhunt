import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { useJobs } from "../hooks/useJobs";
import { useJobFilters } from "../hooks/useJobFilters";
import { useStartApplication } from "../hooks/useSelectedJob";
import FeatureBadge from "../components/common/FeatureBadge";
import SectionCard from "../components/common/SectionCard";
import EmptyState from "../components/common/EmptyState";
import JobCard from "../components/jobs/JobCard";
import JobDetailsDrawer from "../components/jobs/JobDetailsDrawer";
import JobFilters from "../components/jobs/JobFilters";
import PreferencesPanel from "../components/jobs/PreferencesPanel";
import HiddenJobs from "../components/jobs/HiddenJobs";
import MatchedJobs from "../components/jobs/MatchedJobs";
import { filtersFromProfile, hasPreferences, matchJobs } from "../utils/matching";

export default function JobDiscovery() {
  const { profile, setProfile, savedSet, hiddenSet, toggleSaved, toggleHidden } = useApp();
  const { jobs, loading } = useJobs();
  const startApplication = useStartApplication();
  const [selectedJob, setSelectedJob] = useState(null);
  const [showPreferences, setShowPreferences] = useState(false);

  const visible = useMemo(() => jobs.filter((job) => !hiddenSet.has(job.id)), [jobs, hiddenSet]);
  const hidden = useMemo(() => jobs.filter((job) => hiddenSet.has(job.id)), [jobs, hiddenSet]);
  const locations = useMemo(() => [...new Set(jobs.map((job) => job.location))].sort(), [jobs]);
  const { filters, setFilter, applyFilters, results } = useJobFilters(visible, profile);
  const matches = useMemo(() => matchJobs(visible, profile), [visible, profile]);

  return (
    <>
      {!loading && hasPreferences(profile) && (
        <MatchedJobs
          matches={matches}
          onSelectJob={setSelectedJob}
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
        {showPreferences && (
          <PreferencesPanel profile={profile} setProfile={setProfile} locations={locations} />
        )}
        <JobFilters filters={filters} setFilter={setFilter} locations={locations} />
        <div className="results-meta">
          <span>{loading ? "Loading jobs..." : `${results.length} jobs found`}</span>
          <span>{hiddenSet.size} hidden</span>
        </div>
        <div className="job-list">
          {!loading &&
            results.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                profile={profile}
                saved={savedSet.has(job.id)}
                onSave={toggleSaved}
                onHide={toggleHidden}
                onDetails={setSelectedJob}
                onApply={startApplication}
              />
            ))}
        </div>
        {!loading && results.length === 0 && (
          <EmptyState>No jobs match your current filters.</EmptyState>
        )}
      </SectionCard>
      <HiddenJobs jobs={hidden} onRestore={toggleHidden} />
      <JobDetailsDrawer
        job={selectedJob}
        profile={profile}
        saved={selectedJob ? savedSet.has(selectedJob.id) : false}
        onClose={() => setSelectedJob(null)}
        onSave={toggleSaved}
        onApply={startApplication}
      />
    </>
  );
}
