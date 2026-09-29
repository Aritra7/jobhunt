import React, { useState, useMemo } from 'react';
import Navbar from './components/Navbar';
import JobSearch from './components/jobs/JobSearch';
import JobPreferences from './components/preferences/JobPreferences';
import Tracker from './components/tracker/Tracker';
import InterviewPrep from './components/prep/InterviewPrep';
import ResumeSection from './components/resume/ResumeSection';
import useJobs from './hooks/useJobs';
import useProfile from './hooks/useProfile';
import useTracker from './hooks/useTracker';
import useHiddenJobs from './hooks/useHiddenJobs';
import useResume from './hooks/useResume';
import useLocalStorage from './hooks/useLocalStorage';
import { TEMPLATES } from './data/templates';

function App() {
  const [currentView, setCurrentView] = useState('jobs');
  const [resumeFocus, setResumeFocus] = useState(/** @type {{ tab: string, jobId: string | null } | null} */ (null));
  const [selectedTemplate, setSelectedTemplate] = useLocalStorage('jobfind.template', 'modern',
    raw => (TEMPLATES.some(t => t.id === raw) ? raw : 'modern'));

  const jobsState = useJobs();
  const { profile, hasProfile, saveProfile, clearProfile } = useProfile();
  const tracker = useTracker();
  const hidden = useHiddenJobs();
  const resumeState = useResume();

  const locationSuggestions = useMemo(
    () => [...new Set(jobsState.jobs.map(j => j.location))].sort().slice(0, 200),
    [jobsState.jobs]
  );

  const activeCount = tracker.applications.filter(a => a.status !== 'rejected').length;
  const navItems = [
    { id: 'jobs', label: 'Jobs' },
    { id: 'preferences', label: 'Preferences' },
    { id: 'tracker', label: 'Tracker', badge: activeCount },
    { id: 'prep', label: 'Interview Prep' },
    { id: 'resume', label: 'Resume' },
  ];

  /** @param {string} view */
  const navigate = (view) => {
    if (view === 'resume') setResumeFocus(null);
    setCurrentView(view);
    window.scrollTo({ top: 0 });
  };

  /** "Check my resume" from a job: track it (so it has a description to score against) and open ATS. */
  const checkResumeAgainst = (/** @type {import('./types').Job} */ job) => {
    tracker.trackJob(job, 'saved');
    setResumeFocus({ tab: 'ats', jobId: job.id });
    setCurrentView('resume');
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="app-container">
      <Navbar items={navItems} currentView={currentView} setCurrentView={navigate} />

      <main className="main-content">
        {currentView === 'jobs' && (
          <JobSearch
            jobsState={jobsState}
            profile={profile}
            hasProfile={hasProfile}
            tracker={tracker}
            hidden={hidden}
            onEditProfile={() => navigate('preferences')}
            onCheckResume={checkResumeAgainst}
          />
        )}
        {currentView === 'preferences' && (
          <JobPreferences
            profile={profile}
            onSave={saveProfile}
            onClear={clearProfile}
            locationSuggestions={locationSuggestions}
            onDone={() => navigate('jobs')}
          />
        )}
        {currentView === 'tracker' && <Tracker tracker={tracker} onFindJobs={() => navigate('jobs')} />}
        {currentView === 'prep' && <InterviewPrep tracker={tracker} onFindJobs={() => navigate('jobs')} />}
        {currentView === 'resume' && (
          <ResumeSection
            key={resumeFocus ? `${resumeFocus.tab}:${resumeFocus.jobId}` : 'default'}
            resumeState={resumeState}
            applications={tracker.applications}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            focus={resumeFocus}
          />
        )}
      </main>
    </div>
  );
}

export default App;
