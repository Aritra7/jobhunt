import React, { useState } from 'react';
import Timer from './Timer';
import useTimer from '../../hooks/useTimer';
import AnswerRecorder from './AnswerRecorder';
import useLocalStorage, { readStored } from '../../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { BEHAVIORAL_QUESTIONS, TECHNICAL_QUESTIONS, ROLE_QUESTIONS, STAR_TIP } from '../../data/interviewQuestions';
import { cleanText } from '../../utils/sanitize';
import { formatDateTime } from '../../utils/format';

const ROLES = Object.keys(ROLE_QUESTIONS);
const TRACKS = [
  { id: 'behavioral', label: 'Behavioral' },
  { id: 'technical', label: 'Technical' },
  { id: 'role', label: 'Role-specific' },
];

/**
 * @param {string} track
 * @param {string} role
 */
function questionsFor(track, role) {
  if (track === 'behavioral') return BEHAVIORAL_QUESTIONS;
  if (track === 'technical') return TECHNICAL_QUESTIONS;
  return ROLE_QUESTIONS[role] || [];
}

/**
 * @param {string[]} list
 * @param {string} current
 */
function randomOther(list, current) {
  const options = list.length > 1 ? list.filter(q => q !== current) : list;
  return options[Math.floor(Math.random() * options.length)] || '';
}

/**
 * Practice interview: random questions, a timer, voice recording and saved written answers.
 */
export default function PracticeSession() {
  const [track, setTrack] = useState('behavioral');
  const [role, setRole] = useState(ROLES[0]);
  const [question, setQuestion] = useState(BEHAVIORAL_QUESTIONS[0]);
  const [draft, setDraft] = useState('');
  const timer = useTimer();
  // Saved as getajob.practiceAnswers; answers saved by the JobFind app carry over.
  const [answers, setAnswers] = useLocalStorage(STORAGE_KEYS.practiceAnswers,
    /** @type {Record<string, { text: string, at: string, seconds: number }[]> | null} */ (null),
    stored => {
      const raw = stored ?? readStored('jobfind.practiceAnswers', {});
      return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    });

  /**
   * @param {string} nextTrack
   * @param {string} nextRole
   */
  const pick = (nextTrack, nextRole) => {
    setQuestion(randomOther(questionsFor(nextTrack, nextRole), question));
    setDraft('');
    timer.reset();
  };

  const saveAnswer = () => {
    const text = cleanText(draft, 5000).trim();
    if (!text) return;
    setAnswers(prev => ({ ...prev, [question]: [{ text, at: new Date().toISOString(), seconds: timer.seconds }, ...(prev[question] || [])] }));
    setDraft('');
    timer.stop();
  };

  /** @param {number} index */
  const deleteAnswer = (index) => setAnswers(prev => ({ ...prev, [question]: (prev[question] || []).filter((_, i) => i !== index) }));

  const previous = answers[question] || [];
  const practicedCount = Object.values(answers).filter(list => list.length > 0).length;

  return (
    <div className="practice-session">
      <div className="practice-controls">
        <div className="status-chips" role="group" aria-label="Question type">
          {TRACKS.map(t => (
            <button key={t.id} type="button" className={track === t.id ? 'chip active' : 'chip'}
              onClick={() => { setTrack(t.id); pick(t.id, role); }}>
              {t.label}
            </button>
          ))}
        </div>
        {track === 'role' && (
          <label className="inline-field">
            <span>Role</span>
            <select className="location-select" value={role} onChange={(e) => { setRole(e.target.value); pick(track, e.target.value); }}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
        )}
        <span className="muted">{practicedCount} question{practicedCount === 1 ? '' : 's'} practiced</span>
      </div>

      <div className="question-card">
        <p className="question-text">{question}</p>
        {track === 'behavioral' && <p className="form-hint">{STAR_TIP}</p>}
        <div className="question-actions">
          <Timer running={timer.running} seconds={timer.seconds} onTick={timer.setSeconds} />
          {timer.running
            ? <button type="button" className="secondary-button small" onClick={timer.stop}>Pause</button>
            : <button type="button" className="secondary-button small" onClick={timer.start}>{timer.seconds ? 'Resume' : 'Start timer'}</button>}
          <button type="button" className="secondary-button small" onClick={() => pick(track, role)}>Next question →</button>
        </div>
        <AnswerRecorder key={question} />
      </div>

      <label className="form-field">
        <span className="form-label">Write your answer</span>
        <textarea className="notes-input" rows={6} maxLength={5000} value={draft}
          placeholder="Draft your answer here, then save it to review later."
          onChange={(e) => { setDraft(e.target.value); if (!timer.running && !timer.seconds) timer.start(); }} />
      </label>
      <div className="form-actions">
        <button type="button" className="primary-button" onClick={saveAnswer} disabled={!draft.trim()}>Save answer</button>
      </div>

      {previous.length > 0 && (
        <div className="saved-answers">
          <h4>Your previous answers to this question</h4>
          {previous.map((a, i) => (
            <div key={a.at} className="saved-answer">
              <div className="saved-answer-meta">
                <span className="muted">{formatDateTime(a.at)}{a.seconds ? ` · ${Math.round(a.seconds / 60 * 10) / 10} min` : ''}</span>
                <button type="button" className="link-button danger" onClick={() => deleteAnswer(i)}>Delete</button>
              </div>
              <p>{a.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
