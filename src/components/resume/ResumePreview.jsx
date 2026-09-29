import React from 'react';
import { bulletLines, resumeSkills } from '../../hooks/useResume';

/**
 * Printable resume in the chosen template. Everything is rendered as React
 * text (auto-escaped), so resume content can never inject markup (SEC-3).
 * @param {{ resume: import('../../types').Resume, template: string }} props
 */
export default function ResumePreview({ resume, template }) {
  const { contact } = resume;
  const contactLine = [contact.email, contact.phone, contact.location, contact.linkedin].filter(Boolean);
  const skills = resumeSkills(resume);
  const isEmpty = !contact.name && !resume.summary && skills.length === 0 && resume.experience.length === 0 && resume.education.length === 0;

  return (
    <div className={`resume-preview template-${template}`} id="resume-print-area">
      {isEmpty && <p className="muted">Your resume preview appears here as you fill in the form.</p>}
      {contact.name && <h1 className="rp-name">{contact.name}</h1>}
      {contactLine.length > 0 && <p className="rp-contact">{contactLine.join('  ·  ')}</p>}

      {resume.summary && (
        <section><h2 className="rp-heading">Summary</h2><p>{resume.summary}</p></section>
      )}

      {resume.experience.length > 0 && (
        <section>
          <h2 className="rp-heading">Experience</h2>
          {resume.experience.map(exp => (
            <div key={exp.id} className="rp-entry">
              <div className="rp-entry-header">
                <strong>{exp.title}{exp.company && `, ${exp.company}`}</strong>
                <span>{[exp.start, exp.end].filter(Boolean).join(' – ')}</span>
              </div>
              <ul>{bulletLines(exp.bulletsText).map((b, i) => <li key={i}>{b}</li>)}</ul>
            </div>
          ))}
        </section>
      )}

      {resume.education.length > 0 && (
        <section>
          <h2 className="rp-heading">Education</h2>
          {resume.education.map(edu => (
            <div key={edu.id} className="rp-entry rp-entry-header">
              <span><strong>{edu.school}</strong>{edu.degree && ` — ${edu.degree}`}</span>
              <span>{[edu.start, edu.end].filter(Boolean).join(' – ')}</span>
            </div>
          ))}
        </section>
      )}

      {skills.length > 0 && (
        <section><h2 className="rp-heading">Skills</h2><p>{skills.join(' · ')}</p></section>
      )}
    </div>
  );
}
