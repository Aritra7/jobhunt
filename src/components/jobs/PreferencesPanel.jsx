import { useState } from "react";
import { WORK_MODES } from "../../data/jobs";
import { JOB_TYPES } from "../../api/jobModel";
import ListInput from "../common/ListInput";

const EMPTY_PREFERENCES = {
  keywords: [],
  preferredLocations: [],
  preferredModes: [],
  jobTypes: [],
  needsSponsorship: false,
  minSalary: 0,
};

function pickPreferences(profile) {
  const { keywords, preferredLocations, preferredModes, jobTypes, needsSponsorship, minSalary } =
    profile;
  return { keywords, preferredLocations, preferredModes, jobTypes, needsSponsorship, minSalary };
}

const toggle = (items, item) =>
  items.includes(item) ? items.filter((x) => x !== item) : [...items, item];

function ToggleChips({ options, selected, onToggle }) {
  return (
    <div className="chips">
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <button
            type="button"
            key={option}
            className={`chip button-chip toggle-chip${active ? " accent" : ""}`}
            aria-pressed={active}
            onClick={() => onToggle(option)}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

// Saved job preferences (from main's and Prithvi's Preferences pages):
// keywords, locations, work modes, job types and minimum pay. Edits apply on
// Save; Clear empties them. They drive recommendations and "Matched for you".
export default function PreferencesPanel({ profile, setProfile }) {
  const [draft, setDraft] = useState(() => pickPreferences(profile));
  const [status, setStatus] = useState("");

  function update(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
    setStatus("");
  }

  function save(preferences) {
    setDraft(preferences);
    setProfile((current) => ({ ...current, ...preferences }));
  }

  return (
    <form
      className="preference-panel preference-form"
      onSubmit={(e) => {
        e.preventDefault();
        save(draft);
        setStatus("Preferences saved.");
      }}
    >
      <label>
        Keywords
        <ListInput
          value={draft.keywords}
          onChange={(list) => update("keywords", list)}
          placeholder="e.g. frontend, react, data"
        />
        <span className="form-hint">
          Comma-separated. Matched against job title, company and description.
        </span>
      </label>
      <label>
        Minimum hourly pay
        <input
          type="number"
          min="0"
          value={draft.minSalary}
          onChange={(e) => update("minSalary", Number(e.target.value || 0))}
        />
      </label>
      <label>
        Preferred locations
        <ListInput
          value={draft.preferredLocations}
          onChange={(list) => update("preferredLocations", list)}
          placeholder="e.g. Pittsburgh, New York, Remote"
        />
        <span className="form-hint">
          Comma-separated. A job matches if its location contains one.
        </span>
      </label>
      <fieldset className="preference-field">
        <legend>Job types</legend>
        <ToggleChips
          options={JOB_TYPES}
          selected={draft.jobTypes}
          onToggle={(type) => update("jobTypes", toggle(draft.jobTypes, type))}
        />
      </fieldset>
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={draft.needsSponsorship}
          onChange={(e) => update("needsSponsorship", e.target.checked)}
        />
        I need visa sponsorship (hide jobs that won't sponsor)
      </label>
      <fieldset className="preference-field">
        <legend>Preferred work modes</legend>
        <ToggleChips
          options={WORK_MODES}
          selected={draft.preferredModes}
          onToggle={(mode) => update("preferredModes", toggle(draft.preferredModes, mode))}
        />
      </fieldset>
      <div className="inline-actions preference-actions">
        <button type="submit" className="btn btn-primary">
          Save preferences
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            save(EMPTY_PREFERENCES);
            setStatus("Preferences cleared.");
          }}
        >
          Clear
        </button>
        {status && (
          <span className="preference-status" role="status">
            ✓ {status}
          </span>
        )}
      </div>
    </form>
  );
}
