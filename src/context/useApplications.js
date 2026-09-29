import { useMemo } from "react";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { defaultAnswers } from "../data/profile";
import { useLocalStorage } from "../hooks/useLocalStorage";
import useTracker from "../hooks/useTracker";
import { fetchJobDetails } from "../api/jobsApi";
import { mapKeys, toJobId } from "./migrations";

function withoutKey(record, key) {
  const next = { ...record };
  delete next[key];
  return next;
}

// Tracked applications (Prithvi's tracker), in-progress application drafts
// and answers reused across forms.
export function useApplications() {
  const tracker = useTracker();
  const [applicationDrafts, setApplicationDrafts] = useLocalStorage(STORAGE_KEYS.drafts, {}, (d) =>
    mapKeys(d, toJobId),
  );
  const [reusableAnswers, setReusableAnswers] = useLocalStorage(
    STORAGE_KEYS.answers,
    defaultAnswers,
  );

  /**
   * For sources that load descriptions on demand (Greenhouse), fetches it when
   * a job is tracked so the ATS score and cover letter have text to work with.
   * @param {import('../types').Job} job
   * @param {import('../types').ApplicationStatus} [status]
   */
  function trackJob(job, status = "saved") {
    tracker.trackJob(job, status);
    if (job.detailsKey) {
      fetchJobDetails(job)
        .then((full) => tracker.updateByJobId(job.id, { descriptionText: full.descriptionText }))
        .catch(() => {});
    }
  }

  // Job ids that are tracked with any status ("saved" in the UI).
  const trackedSet = useMemo(
    () => new Set(tracker.applications.map((a) => a.jobId).filter(Boolean)),
    [tracker.applications],
  );

  // The Save button: tracks the job, or un-saves it if it's only saved.
  function toggleSaved(job) {
    const app = tracker.findByJobId(job.id);
    if (!app) trackJob(job, "saved");
    else if (app.status === "saved") tracker.removeApplication(app.id);
  }

  function saveDraft(id, draft) {
    setApplicationDrafts((current) => ({
      ...current,
      [id]: { ...draft, savedAt: new Date().toISOString() },
    }));
  }

  return {
    ...tracker,
    trackJob,
    trackedSet,
    toggleSaved,
    applicationDrafts,
    saveDraft,
    clearDraft: (id) => setApplicationDrafts((current) => withoutKey(current, id)),
    reusableAnswers,
    setReusableAnswers,
  };
}
