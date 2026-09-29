import { useState } from "react";

export const WIZARD_STEPS = ["Choose Job", "Autofill", "Questions", "Review"];

export function formFromProfile(profile, answers) {
  const [firstName = "", ...rest] = profile.name.split(" ");
  return {
    firstName,
    lastName: rest.join(" "),
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
    whyInterested: answers.whyInterested,
    workAuthorization: answers.workAuthorization,
    portfolio: profile.github,
  };
}

// Picking a job restores its saved draft (form + step) if there is one;
// otherwise the current answers carry over and the wizard restarts at step 1.
function stateForJob(jobId, form, drafts) {
  const draft = drafts[jobId];
  if (draft) {
    return { jobId, form: { ...form, ...draft.form }, step: draft.step || 1, draftLoaded: true };
  }
  return { jobId, form, step: 1, draftLoaded: false };
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
