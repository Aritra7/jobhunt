import React from 'react';
import { atsScore } from '../../utils/ats';

/** @param {number} score */
function scoreClass(score) {
  if (score >= 75) return 'score-good';
  if (score >= 50) return 'score-ok';
  return 'score-low';
}

/**
 * ATS-style score: keyword coverage against the job + standard sections.
 * @param {{
 *   resumeState: ReturnType<typeof import('../../hooks/useResume').default>,
 *   target: import('./TargetJobPicker').TargetJob | null,
 * }} props
 */
export default function AtsChecker({ resumeState, target }) {
  const { resume, updateResume } = resumeState;

  if (!target || !target.descriptionText.trim()) {
    return <p className="muted">Pick a saved job or paste a job description to see your ATS score.</p>;
  }

  const result = atsScore(resume, target.descriptionText);

  /** @param {string} skill */
  const addSkill = (skill) => updateResume(r => ({
    ...r, skillsText: r.skillsText.trim() ? `${r.skillsText.trim().replace(/,$/, '')}, ${skill}` : skill,
  }));

  return (
    <div className="ats-result">
      <div className="ats-score-row">
        <div className={`ats-score ${scoreClass(result.score)}`} aria-label={`ATS score ${result.score} out of 100`}>
          {result.score}<span>/100</span>
        </div>
        <p>
          {result.keywordsFound === 0
            ? 'No recognizable skills found in this job description, so the score is based on resume sections only.'
            : `Your resume covers ${result.matched.length} of ${result.keywordsFound} key skills in this posting.`}
        </p>
      </div>

      {result.matched.length > 0 && (
        <div>
          <h4>Matched keywords</h4>
          <div className="job-tags">{result.matched.map(s => <span key={s} className="tag tag-good">✓ {s}</span>)}</div>
        </div>
      )}

      {result.missing.length > 0 && (
        <div>
          <h4>Missing keywords</h4>
          <p className="form-hint">Only add skills you really have — click one to add it to your Skills section.</p>
          <div className="job-tags">
            {result.missing.map(s => (
              <button key={s} type="button" className="tag tag-missing" onClick={() => addSkill(s)}>+ {s}</button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4>Resume sections</h4>
        <ul className="checklist">
          {result.sections.map(s => <li key={s.label}>{s.ok ? '✅' : '⚠️'} {s.label}</li>)}
        </ul>
      </div>
    </div>
  );
}
