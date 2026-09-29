import { createContext, useContext } from "react";

// Jobs are loaded once (live, or sample as a fallback) and shared by every page.
export const JobsContext = createContext(null);

export function useJobsData() {
  const value = useContext(JobsContext);
  if (!value) throw new Error("useJobsData must be used inside AppProvider");
  return value;
}
