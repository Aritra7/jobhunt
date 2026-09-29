import React from 'react';

/**
 * Form for every resume section. All edits go through updateResume, which
 * normalizes and persists them.
 * @param {{ resumeState: ReturnType<typeof import('../../hooks/useResume').default> }} props
 */
export default function ResumeEditor({ resumeState }) {
  const { resume, updateResume, addExperience, addEducation } = resumeState;

  /**
   * @param {keyof import('../../types').Resume['contact']} key
   * @param {string} value
   */
  const setContact = (key, value) => updateResume(r => ({ ...r, contact: { ...r.contact, [key]: value } }));

  /**
   * @param {'experience' | 'education'} section
   * @param {string} id
   * @param {string} key
   * @param {string} value
   */
  const setEntry = (section, id, key, value) => updateResume(r => ({
    ...r, [section]: r[section].map(e => (e.id === id ? { ...e, [key]: value } : e)),
  }));

  /**
   * @param {'experience' | 'education'} section
   * @param {string} id
   */
  const removeEntry = (section, id) => updateResume(r => ({ ...r, [section]: r[section].filter(e => e.id !== id) }));

  /**
   * @param {'experience' | 'education'} section
   * @param {number} index
   * @param {-1 | 1} delta
   */
  const moveEntry = (section, index, delta) => updateResume(r => {
    const list = [...r[section]];
    const target = index + delta;
    if (target < 0 || target >= list.length) return r;
    [list[index], list[target]] = [list[target], list[index]];
    return { ...r, [section]: list };
  });

  const emailInvalid = resume.contact.email !== '' && !/^\S+@\S+\.\S+$/.test(resume.contact.email);

  return (
    <div className="resume-editor">
      <section className="panel">
        <h3>Contact</h3>
        <div className="form-grid">
          <label className="form-field"><span className="form-label">Full name</span>
            <input className="search-input" maxLength={100} value={resume.contact.name} onChange={(e) => setContact('name', e.target.value)} /></label>
          <label className="form-field"><span className="form-label">Email</span>
            <input className="search-input" type="email" maxLength={120} value={resume.contact.email} onChange={(e) => setContact('email', e.target.value)} aria-invalid={emailInvalid} />
            {emailInvalid && <span className="field-error">Enter a valid email address.</span>}</label>
          <label className="form-field"><span className="form-label">Phone</span>
            <input className="search-input" type="tel" maxLength={40} value={resume.contact.phone} onChange={(e) => setContact('phone', e.target.value)} /></label>
          <label className="form-field"><span className="form-label">Location</span>
            <input className="search-input" maxLength={100} value={resume.contact.location} onChange={(e) => setContact('location', e.target.value)} /></label>
          <label className="form-field"><span className="form-label">LinkedIn / portfolio</span>
            <input className="search-input" maxLength={200} value={resume.contact.linkedin} onChange={(e) => setContact('linkedin', e.target.value)} /></label>
        </div>
      </section>

      <section className="panel">
        <h3>Summary</h3>
        <textarea className="notes-input" rows={4} maxLength={1500} value={resume.summary}
          placeholder="2–3 sentences: who you are, what you're great at, what you're looking for."
          onChange={(e) => updateResume(r => ({ ...r, summary: e.target.value }))} />
      </section>

      <section className="panel">
        <h3>Skills</h3>
        <input className="search-input" maxLength={1500} value={resume.skillsText}
          placeholder="React, TypeScript, SQL, Figma, Agile..."
          onChange={(e) => updateResume(r => ({ ...r, skillsText: e.target.value }))} />
        <span className="form-hint">Comma-separated.</span>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h3>Experience</h3>
          <button type="button" className="secondary-button small" onClick={addExperience}>+ Add experience</button>
        </div>
        {resume.experience.length === 0 && <p className="muted">Add jobs, internships, or major projects.</p>}
        {resume.experience.map((exp, i) => (
          <div key={exp.id} className="entry">
            <div className="form-grid">
              <label className="form-field"><span className="form-label">Title</span>
                <input className="search-input" maxLength={120} value={exp.title} onChange={(e) => setEntry('experience', exp.id, 'title', e.target.value)} /></label>
              <label className="form-field"><span className="form-label">Company / project</span>
                <input className="search-input" maxLength={120} value={exp.company} onChange={(e) => setEntry('experience', exp.id, 'company', e.target.value)} /></label>
              <label className="form-field"><span className="form-label">Start</span>
                <input className="search-input" maxLength={30} placeholder="Jun 2025" value={exp.start} onChange={(e) => setEntry('experience', exp.id, 'start', e.target.value)} /></label>
              <label className="form-field"><span className="form-label">End</span>
                <input className="search-input" maxLength={30} placeholder="Present" value={exp.end} onChange={(e) => setEntry('experience', exp.id, 'end', e.target.value)} /></label>
            </div>
            <label className="form-field"><span className="form-label">Bullet points (one per line)</span>
              <textarea className="notes-input" rows={4} maxLength={3000} value={exp.bulletsText}
                placeholder={'Built a React dashboard used by 200+ students weekly\nReduced page load time by 40% by ...'}
                onChange={(e) => setEntry('experience', exp.id, 'bulletsText', e.target.value)} /></label>
            <EntryActions onUp={() => moveEntry('experience', i, -1)} onDown={() => moveEntry('experience', i, 1)} onRemove={() => removeEntry('experience', exp.id)} />
          </div>
        ))}
      </section>

      <section className="panel">
        <div className="panel-header">
          <h3>Education</h3>
          <button type="button" className="secondary-button small" onClick={addEducation}>+ Add education</button>
        </div>
        {resume.education.map((edu, i) => (
          <div key={edu.id} className="entry">
            <div className="form-grid">
              <label className="form-field"><span className="form-label">School</span>
                <input className="search-input" maxLength={150} value={edu.school} onChange={(e) => setEntry('education', edu.id, 'school', e.target.value)} /></label>
              <label className="form-field"><span className="form-label">Degree</span>
                <input className="search-input" maxLength={150} value={edu.degree} onChange={(e) => setEntry('education', edu.id, 'degree', e.target.value)} /></label>
              <label className="form-field"><span className="form-label">Start</span>
                <input className="search-input" maxLength={30} value={edu.start} onChange={(e) => setEntry('education', edu.id, 'start', e.target.value)} /></label>
              <label className="form-field"><span className="form-label">End</span>
                <input className="search-input" maxLength={30} value={edu.end} onChange={(e) => setEntry('education', edu.id, 'end', e.target.value)} /></label>
            </div>
            <EntryActions onUp={() => moveEntry('education', i, -1)} onDown={() => moveEntry('education', i, 1)} onRemove={() => removeEntry('education', edu.id)} />
          </div>
        ))}
      </section>
    </div>
  );
}

/** @param {{ onUp: () => void, onDown: () => void, onRemove: () => void }} props */
function EntryActions({ onUp, onDown, onRemove }) {
  return (
    <div className="entry-actions">
      <button type="button" className="link-button" onClick={onUp} aria-label="Move up">↑</button>
      <button type="button" className="link-button" onClick={onDown} aria-label="Move down">↓</button>
      <button type="button" className="link-button danger" onClick={onRemove}>Remove</button>
    </div>
  );
}
