import { useMemo } from "react";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { resumeTemplates } from "../data/resumeTemplates";
import useResume from "../hooks/useResume";
import { readStored, useLocalStorage } from "../hooks/useLocalStorage";
import { pickAllowed } from "../utils/sanitize";

const TEMPLATE_IDS = resumeTemplates.map((t) => t.id);

const contactFromProfile = (profile) => ({
  name: profile.name,
  email: profile.email,
  phone: profile.phone,
  location: profile.location,
  linkedin: profile.linkedIn,
});

const profileFromContact = (contact) => ({
  name: contact.name,
  email: contact.email,
  phone: contact.phone,
  location: contact.location,
  linkedIn: contact.linkedin,
});

/**
 * Prithvi's structured resume, with contact details kept in one place: the
 * profile. Returns the same { resume, updateResume, ... } shape his resume
 * components expect, plus the chosen template.
 */
export function useResumeState(profile, setProfile) {
  const base = useResume();
  const [template, setTemplate] = useLocalStorage(STORAGE_KEYS.template, null, (raw) =>
    // The template used to be saved on the resume itself.
    pickAllowed(raw ?? readStored(STORAGE_KEYS.resume, {}).template, TEMPLATE_IDS, "modern"),
  );

  const contact = useMemo(() => contactFromProfile(profile), [profile]);
  const resume = useMemo(() => ({ ...base.resume, contact }), [base.resume, contact]);

  function updateResume(updater) {
    const next = updater(resume);
    base.updateResume(() => next);
    if (next.contact && JSON.stringify(next.contact) !== JSON.stringify(contact)) {
      setProfile((p) => ({ ...p, ...profileFromContact(next.contact) }));
    }
  }

  return { ...base, resume, updateResume, template, setTemplate };
}
