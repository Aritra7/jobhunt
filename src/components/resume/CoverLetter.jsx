import React, { useState } from 'react';
import CopyButton from '../common/CopyButton';
import { draftCoverLetter } from '../../utils/coverLetter';

/**
 * Draft cover letter from the resume + target job, editable before copying.
 * @param {{ resume: import('../../types').Resume, target: import('./TargetJobPicker').TargetJob | null }} props
 */
export default function CoverLetter({ resume, target }) {
  const [text, setText] = useState('');

  if (!target || !target.title.trim() || !target.company.trim()) {
    return <p className="muted">Pick a saved job, or paste a job with its title and company, to draft a cover letter.</p>;
  }

  const generate = () => setText(draftCoverLetter(resume, target));

  return (
    <div className="cover-letter">
      <div className="form-actions">
        <button type="button" className="primary-button" onClick={generate}>{text ? 'Regenerate draft' : 'Generate draft'}</button>
        {text && <CopyButton text={text} label="Copy letter" />}
      </div>
      {text && (
        <>
          <p className="form-hint">Fill in the [bracketed] parts and make it yours. It's a template, not AI.</p>
          <textarea className="notes-input cover-letter-text" rows={18} value={text} onChange={(e) => setText(e.target.value)} />
        </>
      )}
    </div>
  );
}
