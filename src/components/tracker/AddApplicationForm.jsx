import React, { useState } from 'react';
import StatusSelect from './StatusSelect';
import { safeUrl } from '../../utils/sanitize';

const EMPTY = { title: '', company: '', location: '', url: '', deadline: '', descriptionText: '' };

/**
 * Manually add an application for a job found outside the app.
 * @param {{ onAdd: (fields: Record<string, any>) => void, onCancel: () => void }} props
 */
export default function AddApplicationForm({ onAdd, onCancel }) {
  const [fields, setFields] = useState(EMPTY);
  const [status, setStatus] = useState(/** @type {import('../../types').ApplicationStatus} */ ('applied'));
  const [error, setError] = useState('');

  /** @param {keyof typeof EMPTY} key */
  const bind = (key) => ({
    value: fields[key],
    onChange: (/** @type {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} */ e) =>
      setFields(f => ({ ...f, [key]: e.target.value })),
  });

  /** @param {React.FormEvent} e */
  const submit = (e) => {
    e.preventDefault();
    if (!fields.title.trim() || !fields.company.trim()) {
      setError('Job title and company are required.');
      return;
    }
    if (fields.url.trim() && !safeUrl(fields.url)) {
      setError('Link must start with http:// or https://');
      return;
    }
    onAdd({ ...fields, status, sourceName: 'Manual entry' });
    setFields(EMPTY);
    setError('');
    onCancel();
  };

  return (
    <form className="add-application-form" onSubmit={submit}>
      <h3>Add application</h3>
      <div className="form-grid">
        <label className="form-field"><span className="form-label">Job title *</span><input className="search-input" maxLength={150} {...bind('title')} /></label>
        <label className="form-field"><span className="form-label">Company *</span><input className="search-input" maxLength={120} {...bind('company')} /></label>
        <label className="form-field"><span className="form-label">Location</span><input className="search-input" maxLength={120} {...bind('location')} /></label>
        <label className="form-field"><span className="form-label">Posting link</span><input className="search-input" type="url" placeholder="https://" maxLength={500} {...bind('url')} /></label>
        <label className="form-field"><span className="form-label">Deadline</span><input className="search-input" type="date" {...bind('deadline')} /></label>
        <label className="form-field"><span className="form-label">Status</span><StatusSelect value={status} onChange={setStatus} /></label>
      </div>
      <label className="form-field">
        <span className="form-label">Job description (optional — used for the ATS score and cover letter)</span>
        <textarea className="notes-input" rows={4} maxLength={8000} {...bind('descriptionText')} />
      </label>
      {error && <div className="error-message" role="alert">❌ {error}</div>}
      <div className="form-actions">
        <button type="submit" className="primary-button">Add</button>
        <button type="button" className="secondary-button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
