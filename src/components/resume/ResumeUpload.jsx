import React, { useState } from 'react';
import { extractResumeText } from '../../api/resumeText';
import { parseResumeText, applyImportedResume } from '../../utils/parseResume';
import { resumeSkills } from '../../hooks/useResume';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const VALID_EXTENSIONS = ['.pdf', '.docx'];

/** @param {string} bulletsText */
function bulletCount(bulletsText) {
  const n = bulletsText ? bulletsText.split('\n').length : 0;
  return `${n} bullet${n === 1 ? '' : 's'}`;
}

/** @param {import('../../types').Resume} r */
function hasContent(r) {
  return !!(r.contact.name || r.contact.email || r.summary || r.skillsText || r.experience.length || r.education.length);
}

/**
 * Upload a PDF/Word resume, read it in the browser, and fill the builder.
 * @param {{
 *   resumeState: ReturnType<typeof import('../../hooks/useResume').default>,
 *   onReview: () => void,
 * }} props
 */
export default function ResumeUpload({ resumeState, onReview }) {
  const { resume, updateResume } = resumeState;
  const [status, setStatus] = useState(/** @type {'idle' | 'reading' | 'parsed' | 'applied'} */ ('idle'));
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState(/** @type {ReturnType<typeof parseResumeText> | null} */ (null));
  const [dragging, setDragging] = useState(false);

  /** @param {File | undefined} file */
  const handleFile = async (file) => {
    setError('');
    if (!file) return;
    if (!VALID_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext))) {
      setError('Please upload a .pdf or .docx file.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }
    setFileName(file.name);
    setStatus('reading');
    try {
      const extracted = await extractResumeText(file);
      if (!extracted.trim()) {
        throw new Error('No text found. If this PDF is a scanned image, export it from Word/Google Docs instead.');
      }
      setText(extracted);
      setParsed(parseResumeText(extracted));
      setStatus('parsed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read this file.');
      setStatus('idle');
    }
  };

  /** @param {'replace' | 'fill'} mode */
  const apply = (mode) => {
    if (!parsed) return;
    if (mode === 'replace' && hasContent(resume) &&
        !window.confirm('Replace everything in your builder with this resume?')) return;
    updateResume(current => applyImportedResume(current, parsed.resume, mode));
    setStatus('applied');
  };

  /** @param {React.DragEvent} e */
  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const found = parsed ? parsed.resume : null;
  const skills = found ? resumeSkills(found) : [];

  return (
    <div className="resume-upload-section">
      <h3>Import your existing resume</h3>
      <p className="section-description">
        We read your PDF or Word file right here in your browser (it's never uploaded) and fill in the builder for you.
      </p>
      <div
        className={dragging ? 'upload-container dragging' : 'upload-container'}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input
          type="file"
          id="resume-upload"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => { handleFile(e.target.files ? e.target.files[0] : undefined); e.target.value = ''; }}
          className="file-input"
        />
        <label htmlFor="resume-upload" className="upload-button">
          {status === 'reading' ? 'Reading…' : 'Choose File'}
        </label>
        <p className="upload-hint">or drag it here · .pdf or .docx, up to {MAX_FILE_SIZE_MB} MB</p>
      </div>

      {error && <div className="error-message" role="alert">❌ {error}</div>}
      {status === 'reading' && <p className="muted" role="status">Reading {fileName}…</p>}

      {found && status === 'parsed' && (
        <div className="import-preview">
          <h4>Found in {fileName}</h4>
          <dl className="import-fields">
            <dt>Name</dt><dd>{found.contact.name || <span className="muted">not found</span>}</dd>
            <dt>Email</dt><dd>{found.contact.email || <span className="muted">not found</span>}</dd>
            <dt>Phone</dt><dd>{found.contact.phone || <span className="muted">not found</span>}</dd>
            <dt>Location</dt><dd>{found.contact.location || <span className="muted">not found</span>}</dd>
            <dt>LinkedIn / profile</dt><dd>{found.contact.linkedin || <span className="muted">not found</span>}</dd>
            <dt>Summary</dt><dd>{found.summary ? `${found.summary.split(/\s+/).length} words` : <span className="muted">not found</span>}</dd>
            <dt>Skills</dt>
            <dd>{skills.length > 0
              ? <div className="job-tags">{skills.map(s => <span key={s} className="tag">{s}</span>)}</div>
              : <span className="muted">not found</span>}</dd>
            <dt>Experience</dt>
            <dd>{found.experience.length > 0 ? (
              <ul className="import-list">
                {found.experience.map(e => (
                  <li key={e.id}>
                    <strong>{e.title || 'Untitled'}</strong>{e.company && ` — ${e.company}`}
                    <span className="muted"> {[e.start, e.end].filter(Boolean).join(' – ')} · {bulletCount(e.bulletsText)}</span>
                  </li>
                ))}
              </ul>
            ) : <span className="muted">not found</span>}</dd>
            <dt>Education</dt>
            <dd>{found.education.length > 0 ? (
              <ul className="import-list">
                {found.education.map(e => <li key={e.id}><strong>{e.school}</strong>{e.degree && ` — ${e.degree}`}</li>)}
              </ul>
            ) : <span className="muted">not found</span>}</dd>
          </dl>
          <p className="form-hint">Job titles and dates are detected from your layout — double-check them in the builder.</p>
          <div className="form-actions">
            <button type="button" className="primary-button" onClick={() => apply('replace')}>Replace builder with this</button>
            <button type="button" className="secondary-button" onClick={() => apply('fill')}>Only fill empty fields</button>
          </div>
          <details>
            <summary>Show extracted text</summary>
            <pre className="extracted-text">{text}</pre>
          </details>
        </div>
      )}

      {status === 'applied' && (
        <div className="success-message">
          ✅ Builder filled from {fileName}.{' '}
          <button type="button" className="link-button" onClick={onReview}>Review it in the Builder →</button>
        </div>
      )}
    </div>
  );
}
