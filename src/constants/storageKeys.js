// Every browser-storage key the app uses. Renaming one orphans data users
// already saved, so add new keys instead of changing these.
export const STORAGE_KEYS = {
  profile: "getajob.profile",
  tracker: "getajob.tracker",
  resume: "getajob.resume",
  template: "getajob.template",
  savedJobs: "getajob.saved", // before the tracker: saved job ids (migrated)
  hiddenJobs: "getajob.hidden",
  applications: "getajob.applications", // before the tracker: { [jobId]: app } (migrated)
  drafts: "getajob.drafts",
  answers: "getajob.answers",
  interviewHistory: "getajob.interviewHistory",
  practiceAnswers: "getajob.practiceAnswers",
};

// sessionStorage: job chosen on Job Discovery, picked up by Job Application.
export const SELECTED_JOB_KEY = "getajob.selectedJob";

// Preferences saved by the earlier "JobFind" app on main: { keywords, preferredLocation }.
export const LEGACY_PROFILE_KEY = "jobfind.profile";
