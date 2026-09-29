import React, { useState } from 'react';
import ResearchLinks from '../common/ResearchLinks';
import { INTERVIEW_CHECKLIST } from '../../data/interviewQuestions';
import { buildPrepSchedule } from '../../utils/prepSchedule';
import { formatDate, formatDateTime } from '../../utils/format';
import { statusLabel } from '../../data/applicationStatuses';

/**
 * Per-interview planning: date/time, a countdown prep schedule, checklist and
 * company research. Data lives on the tracked application.
 * @param {{ tracker: ReturnType<typeof import('../../hooks/useTracker').default>, onFindJobs: () => void }} props
 */
export default function InterviewPlanner({ tracker, onFindJobs }) {
  const { applications, updateApplication } = tracker;
  // Interviewing first, then everything else.
  const ordered = [...applications].sort((a, b) =>
    Number(b.status === 'interviewing') - Number(a.status === 'interviewing'));
  const [selectedId, setSelectedId] = useState(ordered[0] ? ordered[0].id : '');
  const app = applications.find(a => a.id === selectedId) || ordered[0];

  if (!app) {
    return (
      <div className="no-results">
        <h2>No applications to plan for</h2>
        <p>Track a job first, then plan your interview prep here.</p>
        <button type="button" className="primary-button" onClick={onFindJobs}>Find jobs</button>
      </div>
    );
  }

  const schedule = app.interviewAt ? buildPrepSchedule(app.interviewAt, app.checklist) : [];
  const doneCount = INTERVIEW_CHECKLIST.filter(item => app.checklist[item.id]).length;

  /** @param {string} id */
  const toggleItem = (id) => updateApplication(app.id, { checklist: { ...app.checklist, [id]: !app.checklist[id] } });

  /** @param {string} value */
  const setInterviewAt = (value) => updateApplication(app.id, {
    interviewAt: value,
    ...(value && app.status !== 'interviewing' && app.status !== 'offer' ? { status: 'interviewing' } : {}),
  });

  return (
    <div className="interview-planner">
      <label className="form-field">
        <span className="form-label">Interview for</span>
        <select className="location-select" value={app.id} onChange={(e) => setSelectedId(e.target.value)}>
          {ordered.map(a => (
            <option key={a.id} value={a.id}>{a.title} — {a.company} ({statusLabel(a.status)})</option>
          ))}
        </select>
      </label>

      <div className="planner-grid">
        <section className="panel">
          <h3>Schedule</h3>
          <label className="inline-field">
            <span>Interview date & time</span>
            <input type="datetime-local" value={app.interviewAt} onChange={(e) => setInterviewAt(e.target.value)} />
          </label>
          {app.interviewAt ? (
            <>
              <p className="muted">Interview {formatDateTime(app.interviewAt)}</p>
              <ol className="prep-schedule">
                {schedule.map(step => (
                  <li key={step.offset} className={`prep-step prep-${step.state}`}>
                    <span className="prep-date">{formatDate(step.date.toISOString())}</span>
                    <span>{step.label}</span>
                    <span className="prep-state">{step.state === 'done' ? '✓ Done' : step.state === 'overdue' ? 'Overdue' : step.state === 'today' ? 'Today' : ''}</span>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <p className="muted">Set the interview time to get a day-by-day prep plan. Setting it moves the application to Interviewing.</p>
          )}
        </section>

        <section className="panel">
          <h3>Checklist <span className="muted">({doneCount}/{INTERVIEW_CHECKLIST.length})</span></h3>
          <ul className="checklist">
            {INTERVIEW_CHECKLIST.map(item => (
              <li key={item.id}>
                <label className="checkbox-label">
                  <input type="checkbox" checked={!!app.checklist[item.id]} onChange={() => toggleItem(item.id)} />
                  {item.label}
                </label>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h3>Company research: {app.company}</h3>
          <ResearchLinks company={app.company} />
          <CompanyNotes key={app.id} app={app} onSave={(notes) => updateApplication(app.id, { notes })} />
        </section>
      </div>
    </div>
  );
}

/**
 * @param {{ app: import('../../types').Application, onSave: (notes: string) => void }} props
 */
function CompanyNotes({ app, onSave }) {
  const [notes, setNotes] = useState(app.notes);
  return (
    <label className="form-field">
      <span className="form-label">Research notes (shared with the tracker)</span>
      <textarea className="notes-input" rows={5} maxLength={5000} value={notes}
        placeholder="Mission, products, recent news, people you'll meet, questions to ask..."
        onChange={(e) => setNotes(e.target.value)} onBlur={() => { if (notes !== app.notes) onSave(notes); }} />
    </label>
  );
}
