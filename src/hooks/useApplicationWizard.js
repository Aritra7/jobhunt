import { useState } from "react";
import { DEFAULT_QUESTION_IDS } from "../data/screeningQuestions";
import { upgradeDraftForm } from "../utils/screening";

export const WIZARD_STEPS = ["Choose Job", "Autofill", "Questions", "Review"];

/**
 * The starting form: contact details from the profile, and the default
 * screening questions. Answers start empty and fall back to the answer bank
 * (filled for the job) until the user edits them.
 */
export function formFromProfile(profile) {
  const [firstName = "", ...rest] = profile.name.split(" ");
  return {
    firstName,
    lastName: rest.join(" "),
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
    portfolio: profile.github,
    questionIds: DEFAULT_QUESTION_IDS,
    answers: {},
  };
}

// Picking a job restores its saved draft (form + step) if there is one;
// otherwise contact details carry over, answers restart from the answer bank
// (they mention the company) and the wizard restarts at step 1.
function stateForJob(jobId, form, drafts) {
  const draft = drafts[jobId];
  if (draft) {
    const draftForm = upgradeDraftForm(draft.form);
    return { jobId, form: { ...form, ...draftForm }, step: draft.step || 1, draftLoaded: true };
  }
  return { jobId, form: { ...form, answers: {} }, step: 1, draftLoaded: false };
}

export function useApplicationWizard({ initialJobId, initialForm, drafts }) {
  const [state, setState] = useState(() => stateForJob(initialJobId, initialForm, drafts));

  return {
    ...state,
    selectJob: (jobId) => setState((s) => stateForJob(jobId, s.form, drafts)),
    updateField: (key, value) => setState((s) => ({ ...s, form: { ...s.form, [key]: value } })),
    next: () => setState((s) => ({ ...s, step: Math.min(s.step + 1, WIZARD_STEPS.length) })),
    back: () => setState((s) => ({ ...s, step: Math.max(s.step - 1, 1) })),
  };
}
