import { STORAGE_KEYS } from "../constants/storageKeys";
import { defaultAnswers } from "../data/profile";
import { useLocalStorage } from "../hooks/useLocalStorage";

function withoutKey(record, key) {
  const next = { ...record };
  delete next[key];
  return next;
}

// Tracked applications, in-progress drafts and answers reused across forms.
export function useApplications() {
  const [applications, setApplications] = useLocalStorage(STORAGE_KEYS.applications, {});
  const [applicationDrafts, setApplicationDrafts] = useLocalStorage(STORAGE_KEYS.drafts, {});
  const [reusableAnswers, setReusableAnswers] = useLocalStorage(
    STORAGE_KEYS.answers,
    defaultAnswers,
  );

  function upsertApplication(id, status = "Interested", extra = {}) {
    setApplications((current) => ({
      ...current,
      [id]: { ...(current[id] || {}), status, updatedAt: new Date().toISOString(), ...extra },
    }));
  }

  function saveDraft(id, draft) {
    setApplicationDrafts((current) => ({
      ...current,
      [id]: { ...draft, savedAt: new Date().toISOString() },
    }));
  }

  return {
    applications,
    setApplications,
    upsertApplication,
    removeApplication: (id) => setApplications((current) => withoutKey(current, id)),
    applicationDrafts,
    saveDraft,
    clearDraft: (id) => setApplicationDrafts((current) => withoutKey(current, id)),
    reusableAnswers,
    setReusableAnswers,
  };
}
