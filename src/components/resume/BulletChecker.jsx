import React from 'react';
import { bulletLines } from '../../hooks/useResume';
import { checkBullet, checkConsistency } from '../../utils/bulletCheck';

/**
 * Reviews every experience bullet against common resume-writing rules.
 * @param {{ resume: import('../../types').Resume, onEdit: () => void }} props
 */
export default function BulletChecker({ resume, onEdit }) {
  const entries = resume.experience.map(exp => ({
    exp,
    bullets: bulletLines(exp.bulletsText).map(text => ({ text, issues: checkBullet(text) })),
  })).filter(e => e.bullets.length > 0);

  const all = entries.flatMap(e => e.bullets);
  if (all.length === 0) {
    return (
      <div className="no-results">
        <p>Add experience bullet points in the builder to get feedback.</p>
        <button type="button" className="primary-button" onClick={onEdit}>Go to builder</button>
      </div>
    );
  }

  const strong = all.filter(b => b.issues.length === 0).length;
  const consistency = checkConsistency(all.map(b => b.text));

  return (
    <div className="bullet-checker">
      <p className="results-count">{strong} of {all.length} bullets look strong.</p>
      {consistency.map(note => <div key={note} className="warning-banner">{note}</div>)}
      {entries.map(({ exp, bullets }) => (
        <section key={exp.id} className="panel">
          <h4>{exp.title || 'Untitled role'}{exp.company && ` — ${exp.company}`}</h4>
          <ul className="bullet-review">
            {bullets.map((b, i) => (
              <li key={i} className={b.issues.length === 0 ? 'bullet-ok' : 'bullet-issues'}>
                <p className="bullet-text">{b.issues.length === 0 ? '✅' : '⚠️'} {b.text}</p>
                {b.issues.length > 0 && <ul>{b.issues.map(issue => <li key={issue.id}>{issue.message}</li>)}</ul>}
              </li>
            ))}
          </ul>
        </section>
      ))}
      <button type="button" className="secondary-button" onClick={onEdit}>Edit bullets in builder</button>
    </div>
  );
}
