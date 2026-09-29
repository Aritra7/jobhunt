import React from 'react';
import CopyButton from '../common/CopyButton';
import { bulletLines, resumeSkills } from '../../hooks/useResume';

/**
 * One-click copy of the details application forms ask for over and over.
 * @param {{ resume: import('../../types').Resume, onEdit: () => void }} props
 */
export default function AutofillKit({ resume, onEdit }) {
  const { contact } = resume;
  const [firstName, ...rest] = contact.name.trim().split(/\s+/);
  const latest = resume.experience[0];
  const school = resume.education[0];

  const fields = [
    { label: 'First name', value: firstName || '' },
    { label: 'Last name', value: rest.join(' ') },
    { label: 'Email', value: contact.email },
    { label: 'Phone', value: contact.phone },
    { label: 'Location', value: contact.location },
    { label: 'LinkedIn / portfolio', value: contact.linkedin },
    { label: 'Current / latest title', value: latest ? latest.title : '' },
    { label: 'Current / latest company', value: latest ? latest.company : '' },
    { label: 'School', value: school ? school.school : '' },
    { label: 'Degree', value: school ? school.degree : '' },
    { label: 'Skills', value: resumeSkills(resume).join(', ') },
    { label: 'Summary / "About you"', value: resume.summary },
    { label: 'Latest role highlights', value: latest ? bulletLines(latest.bulletsText).map(b => `• ${b}`).join('\n') : '' },
  ];

  const filled = fields.filter(f => f.value).length;

  return (
    <div className="autofill-kit">
      <p className="section-description">
        Copy these straight into application forms. Filled from your resume ({filled}/{fields.length} available).{' '}
        {filled < fields.length && <button type="button" className="link-button" onClick={onEdit}>Complete your resume</button>}
      </p>
      <dl className="autofill-list">
        {fields.map(f => (
          <div key={f.label} className="autofill-row">
            <dt>{f.label}</dt>
            <dd className={f.value ? '' : 'muted'}>{f.value || 'Not filled in'}</dd>
            <CopyButton text={f.value} />
          </div>
        ))}
      </dl>
    </div>
  );
}
