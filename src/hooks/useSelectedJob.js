import { useNavigate } from "react-router-dom";
import { SELECTED_JOB_KEY } from "../constants/storageKeys";

// Job Discovery hands the chosen job to Job Application through sessionStorage,
// so the choice survives a page refresh on /apply.
export function useStartApplication() {
  const navigate = useNavigate();
  return (jobId) => {
    try {
      sessionStorage.setItem(SELECTED_JOB_KEY, String(jobId));
    } catch {
      // Storage unavailable: /apply falls back to the first job.
    }
    navigate("/apply");
  };
}

// Returns the handed-over job id, or "" when there is none.
export function readSelectedJobId() {
  try {
    return sessionStorage.getItem(SELECTED_JOB_KEY) || "";
  } catch {
    return "";
  }
}

export function clearSelectedJob() {
  try {
    sessionStorage.removeItem(SELECTED_JOB_KEY);
  } catch {
    // ignore
  }
}
