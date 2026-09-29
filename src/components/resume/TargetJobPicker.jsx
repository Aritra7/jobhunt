import React from 'react';

/**
 * @typedef {{ title: string, company: string, descriptionText: string }} TargetJob
 */

/**
 * Picks the job to tailor the resume to: a tracked application or a pasted description.
 * @param {{
 *   applications: import('../../types').Application[],
 *   targetId: string,
 *   onTargetIdChange: (id: string) => void,
 *   pasted: TargetJob,
 *   onPastedChange: (job: TargetJob) => void,
 * }} props
 */
export default function TargetJobPicker({ applications, targetId, onTargetIdChange, pasted, onPastedChange }) {
  const withDescription = applications.filter(a => a.descriptionText.trim());

  return (
    <div className="panel target-picker">
      <label className="form-field">
        <span className="form-label">Target job</span>
        <select className="location-select" value={targetId} onChange={(e) => onTargetIdChange(e.target.value)}>
          <option value="paste">Paste a job description…</option>
          {withDescription.map(a => <option key={a.id} value={a.id}>{a.title} — {a.company}</option>)}
        </select>
        {withDescription.length === 0 && <span className="form-hint">Tip: jobs you save from search show up here automatically.</span>}
      </label>

      {targetId === 'paste' && (
        <>
          <div className="form-grid">
            <label className="form-field"><span className="form-label">Job title</span>
              <input className="search-input" maxLength={150} value={pasted.title} onChange={(e) => onPastedChange({ ...pasted, title: e.target.value })} /></label>
            <label className="form-field"><span className="form-label">Company</span>
              <input className="search-input" maxLength={120} value={pasted.company} onChange={(e) => onPastedChange({ ...pasted, company: e.target.value })} /></label>
          </div>
          <label className="form-field"><span className="form-label">Job description</span>
            <textarea className="notes-input" rows={6} maxLength={8000} value={pasted.descriptionText}
              onChange={(e) => onPastedChange({ ...pasted, descriptionText: e.target.value })} /></label>
        </>
      )}
    </div>
  );
}
