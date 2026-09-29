import React, { useState, useMemo } from 'react';
import Navbar from './components/Navbar';
import JobSearch from './components/jobs/JobSearch';
import JobPreferences from './components/preferences/JobPreferences';
import Tracker from './components/tracker/Tracker';
import InterviewPrep from './components/prep/InterviewPrep';
import ResumeSection from './components/resume/ResumeSection';
import useRoute from './hooks/useRoute';
import useJobs from './hooks/useJobs';
import useJobFilters from './hooks/useJobFilters';
import useProfile from './hooks/useProfile';
import useTracker from './hooks/useTracker';
import useHiddenJobs from './hooks/useHiddenJobs';
import useResume from './hooks/useResume';
import useLocalStorage from './hooks/useLocalStorage';
import { fetchJobDetails } from './api/jobsApi';
import { TEMPLATES } from './data/templates';
import { PREP_TABS, RESUME_TABS } from './data/tabs';

/**
 * @param {{ id: string }[]} tabs
 * @param {string} sub
 */
function tabFromRoute(tabs, sub) {
  return tabs.some(t => t.id === sub) ? sub : tabs[0].id;
}

function App() {
  // The current screen lives in the URL so browser back/forward work (see useRoute).
  const { route, navigate, goBack } = useRoute();
  const [resumeFocusJobId, setResumeFocusJobId] = useState(/** @type {string | null} */ (null));
  const [selectedTemplate, setSelectedTemplate] = useLocalStorage('jobfind.template', 'modern',
    raw => (TEMPLATES.some(t => t.id === raw) ? raw : 'modern'));

  const jobsState = useJobs();
  const { profile, hasProfile, saveProfile, clearProfile } = useProfile();
  const tracker = useTracker();
  const hidden = useHiddenJobs();
  const resumeState = useResume();
  // Lives here (not in JobSearch) so filters survive switching tabs.
  const filters = useJobFilters(jobsState.jobs, hidden.hiddenSet);

  const locationSuggestions = useMemo(
    () => [...new Set(jobsState.jobs.map(j => j.location))].sort().slice(0, 200),
    [jobsState.jobs]
  );

  /**
   * Tracks a job; for sources that load descriptions on demand, fetches the
   * description too so the ATS score and cover letter have something to use.
   * @param {import('./types').Job} job
   * @param {import('./types').ApplicationStatus} [status]
   */
  const trackJob = (job, status = 'saved') => {
    tracker.trackJob(job, status);
    if (job.detailsKey) {
      fetchJobDetails(job)
        .then(full => tracker.updateByJobId(job.id, { descriptionText: full.descriptionText }))
        .catch(() => {});
    }
  };
  const trackerApi = { ...tracker, trackJob };

  const activeCount = tracker.applications.filter(a => a.status !== 'rejected').length;
  const navItems = [
    { id: 'jobs', label: 'Jobs' },
    { id: 'preferences', label: 'Preferences' },
    { id: 'tracker', label: 'Tracker', badge: activeCount },
    { id: 'prep', label: 'Interview Prep' },
    { id: 'resume', label: 'Resume' },
  ];

  /**
   * @param {string} view
   * @param {string} [sub]
   */
  const go = (view, sub = '') => {
    if (view === 'resume' && !sub) setResumeFocusJobId(null);
    navigate(view, sub);
    window.scrollTo({ top: 0 });
  };

  /** "Check my resume" from a job: track it (so it has a description to score against) and open ATS. */
  const checkResumeAgainst = (/** @type {import('./types').Job} */ job) => {
    trackJob(job, 'saved');
    setResumeFocusJobId(job.id);
    go('resume', 'ats');
  };

  const { view, sub } = route;

  return (
    <div className="app-container">
      <Navbar items={navItems} currentView={view} setCurrentView={(id) => go(id)} />

      <main className="main-content">
        {view === 'jobs' && (
          <JobSearch
            jobsState={jobsState}
            profile={profile}
            hasProfile={hasProfile}
            tracker={trackerApi}
            hidden={hidden}
            filters={filters}
            selectedJobId={sub}
            onOpenJob={(jobId) => navigate('jobs', jobId)}
            onCloseJob={() => goBack('jobs')}
            onEditProfile={() => go('preferences')}
            onCheckResume={checkResumeAgainst}
          />
        )}
        {view === 'preferences' && (
          <JobPreferences
            profile={profile}
            onSave={saveProfile}
            onClear={clearProfile}
            locationSuggestions={locationSuggestions}
            onDone={() => go('jobs')}
          />
        )}
        {view === 'tracker' && <Tracker tracker={trackerApi} onFindJobs={() => go('jobs')} />}
        {view === 'prep' && (
          <InterviewPrep
            tracker={trackerApi}
            onFindJobs={() => go('jobs')}
            tab={tabFromRoute(PREP_TABS, sub)}
            onTabChange={(tab) => navigate('prep', tab)}
          />
        )}
        {view === 'resume' && (
          <ResumeSection
            key={resumeFocusJobId || 'default'}
            resumeState={resumeState}
            applications={tracker.applications}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            focusJobId={resumeFocusJobId}
            tab={tabFromRoute(RESUME_TABS, sub)}
            onTabChange={(tab) => navigate('resume', tab)}
          />
        )}
      </main>
    </div>
  );
}

export default App;
