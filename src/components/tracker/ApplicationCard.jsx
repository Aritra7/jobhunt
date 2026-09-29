import React, { useState } from 'react';
import StatusSelect from './StatusSelect';
import { statusLabel } from '../../data/applicationStatuses';
import { daysUntil, formatDate, formatDateTime } from '../../utils/format';

const DUE_SOON_DAYS = 3;

/** @param {string} deadline */
function deadlineBadge(deadline) {
  if (!deadline) return null;
  const days = daysUntil(deadline);
  if (days < 0) return { className: 'deadline-overdue', text: `Deadline passed ${-days}d ago` };
  if (days === 0) return { className: 'deadline-soon', text: 'Due today' };
  if (days <= DUE_SOON_DAYS) return { className: 'deadline-soon', text: `Due in ${days}d` };
  return { className: 'deadline-ok', text: `Due ${formatDate(deadline)}` };
}

/**
 * @param {{
 *   application: import('../../types').Application,
 *   onUpdate: (id: string, patch: Partial<import('../../types').Application>) => void,
 *   onRemove: (id: string) => void,
 * }} props
 */
export default function ApplicationCard({ application: app, onUpdate, onRemove }) {
  const [notes, setNotes] = useState(app.notes);
  const [notesSaved, setNotesSaved] = useState(true);
  const badge = deadlineBadge(app.deadline);

  const saveNotes = () => {
    if (notes !== app.notes) onUpdate(app.id, { notes });
    setNotesSaved(true);
  };

  const remove = () => {
    if (window.confirm(`Stop tracking "${app.title}" at ${app.company}? Notes and history will be deleted.`)) {
      onRemove(app.id);
    }
  };

  return (
    <article className={`application-card status-border-${app.status}`}>
      <div className="application-header">
        <div>
          <h3 className="application-title">
            {app.url ? <a href={app.url} target="_blank" rel="noopener noreferrer">{app.title} ↗</a> : app.title}
          </h3>
          <p className="muted">{app.company}{app.location && ` · ${app.location}`} · {app.sourceName}</p>
        </div>
        <StatusSelect value={app.status} onChange={(status) => onUpdate(app.id, { status })} />
      </div>

      <div className="application-fields">
        <label className="inline-field">
          <span>Deadline</span>
          <input type="date" value={app.deadline} onChange={(e) => onUpdate(app.id, { deadline: e.target.value })} />
          {badge && <span className={`deadline-badge ${badge.className}`}>{badge.text}</span>}
        </label>
        {(app.status === 'interviewing' || app.interviewAt) && (
          <label className="inline-field">
            <span>Interview</span>
            <input type="datetime-local" value={app.interviewAt} onChange={(e) => onUpdate(app.id, { interviewAt: e.target.value })} />
          </label>
        )}
        {app.appliedAt && <span className="muted">Applied {formatDate(app.appliedAt)}</span>}
      </div>

      <label className="form-field">
        <span className="form-label">Notes</span>
        <textarea
          className="notes-input"
          rows={3}
          maxLength={5000}
          placeholder="Recruiter name, referral, salary discussed, follow-up plan..."
          value={notes}
          onChange={(e) => { setNotes(e.target.value); setNotesSaved(false); }}
          onBlur={saveNotes}
        />
        <span className="form-hint">{notesSaved ? 'Saved' : 'Unsaved - click outside the box to save'}</span>
      </label>

      <div className="application-footer">
        <details>
          <summary>History ({app.history.length})</summary>
          <ol className="history-list">
            {app.history.map((entry, i) => (
              <li key={i}><strong>{statusLabel(entry.status)}</strong> — {formatDateTime(entry.at)}</li>
            ))}
          </ol>
        </details>
        <button type="button" className="link-button danger" onClick={remove}>Remove</button>
      </div>
    </article>
  );
}
