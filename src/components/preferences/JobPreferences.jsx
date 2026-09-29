import React, { useState } from 'react';
import { JOB_TYPES } from '../../api/jobModel';

const WORK_MODES = [
  { id: 'any', label: 'Any' },
  { id: 'remote', label: 'Remote only' },
  { id: 'onsite', label: 'On-site / hybrid' },
];

/**
 * Saved job preferences: target roles, location, work mode and job types.
 * @param {{
 *   profile: import('../../types').Profile | null,
 *   onSave: (profile: any) => void,
 *   onClear: () => void,
 *   locationSuggestions: string[],
 *   onDone: () => void,
 * }} props
 */
export default function JobPreferences({ profile, onSave, onClear, locationSuggestions, onDone }) {
  const [keywordsText, setKeywordsText] = useState(profile ? profile.keywords.join(', ') : '');
  const [preferredLocation, setPreferredLocation] = useState(profile ? profile.preferredLocation : '');
  const [workMode, setWorkMode] = useState(profile ? profile.workMode : 'any');
  const [jobTypes, setJobTypes] = useState(profile ? profile.jobTypes : /** @type {string[]} */ ([]));
  const [saved, setSaved] = useState(false);

  /** @param {() => void} fn */
  const edit = (fn) => { fn(); setSaved(false); };

  /** @param {string} type */
  const toggleType = (type) => edit(() =>
    setJobTypes(prev => (prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])));

  /** @param {React.FormEvent} e */
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ keywords: keywordsText.split(','), preferredLocation, workMode, jobTypes });
    setSaved(true);
  };

  const handleClear = () => {
    setKeywordsText('');
    setPreferredLocation('');
    setWorkMode('any');
    setJobTypes([]);
    setSaved(false);
    onClear();
  };

  return (
    <div className="preferences-view">
      <h2>Job Preferences</h2>
      <p className="section-description">
        Tell us what you're looking for. We use this to recommend jobs and pre-fill your search.
      </p>

      <form className="preferences-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span className="form-label">Target job roles / keywords</span>
          <input
            type="text"
            className="search-input"
            placeholder="e.g. frontend developer, react, data analyst"
            maxLength={400}
            value={keywordsText}
            onChange={(e) => edit(() => setKeywordsText(e.target.value))}
          />
          <span className="form-hint">Separate with commas. The first one is used when you click "Use saved profile".</span>
        </label>

        <label className="form-field">
          <span className="form-label">Preferred location</span>
          <input
            type="text"
            className="search-input"
            placeholder="e.g. New York, Berlin, Remote"
            list="location-suggestions"
            maxLength={80}
            value={preferredLocation}
            onChange={(e) => edit(() => setPreferredLocation(e.target.value))}
          />
          <datalist id="location-suggestions">
            {locationSuggestions.map(l => <option key={l} value={l} />)}
          </datalist>
        </label>

        <fieldset className="form-field">
          <legend className="form-label">Work mode</legend>
          <div className="choice-row">
            {WORK_MODES.map(mode => (
              <label key={mode.id} className="checkbox-label">
                <input
                  type="radio"
                  name="workMode"
                  value={mode.id}
                  checked={workMode === mode.id}
                  onChange={() => edit(() => setWorkMode(/** @type {any} */ (mode.id)))}
                />
                {mode.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="form-field">
          <legend className="form-label">Job types</legend>
          <div className="choice-row">
            {JOB_TYPES.map(type => (
              <label key={type} className="checkbox-label">
                <input type="checkbox" checked={jobTypes.includes(type)} onChange={() => toggleType(type)} />
                {type}
              </label>
            ))}
          </div>
          <span className="form-hint">Leave empty for any.</span>
        </fieldset>

        <div className="form-actions">
          <button type="submit" className="primary-button">Save preferences</button>
          {profile && <button type="button" className="secondary-button" onClick={handleClear}>Clear</button>}
        </div>
      </form>

      {saved && (
        <div className="success-message">
          ✅ Preferences saved. <button type="button" className="link-button" onClick={onDone}>See recommended jobs →</button>
        </div>
      )}
    </div>
  );
}
