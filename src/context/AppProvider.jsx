import { useEffect } from "react";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { defaultProfile } from "../data/profile";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useJobs } from "../hooks/useJobs";
import { AppContext } from "./AppContext";
import { JobsContext } from "./JobsContext";
import { removeLegacyProfile, withLegacyProfile } from "./legacyProfile";
import { useApplications } from "./useApplications";
import { useJobLists } from "./useJobLists";
import { useResumeState } from "./useResumeState";

export function AppProvider({ children }) {
  const [profile, setProfile] = useLocalStorage(
    STORAGE_KEYS.profile,
    defaultProfile,
    withLegacyProfile,
  );
  const resumeState = useResumeState(profile, setProfile);
  const [interviewHistory, setInterviewHistory] = useLocalStorage(
    STORAGE_KEYS.interviewHistory,
    [],
  );
  const jobLists = useJobLists();
  const applications = useApplications();
  const jobsData = useJobs();

  // Runs after useLocalStorage has saved the merged profile.
  useEffect(removeLegacyProfile, []);

  const value = {
    profile,
    setProfile,
    resumeState,
    interviewHistory,
    setInterviewHistory,
    ...jobLists,
    ...applications,
  };

  return (
    <AppContext.Provider value={value}>
      <JobsContext.Provider value={jobsData}>{children}</JobsContext.Provider>
    </AppContext.Provider>
  );
}
