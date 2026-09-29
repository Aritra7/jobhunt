import React, { useState } from 'react';
import Tabs from '../common/Tabs';
import { RESUME_TABS } from '../../data/tabs';
import ResumeEditor from './ResumeEditor';
import ResumePreview from './ResumePreview';
import TemplatePicker from './TemplatePicker';
import TargetJobPicker from './TargetJobPicker';
import AtsChecker from './AtsChecker';
import BulletChecker from './BulletChecker';
import CoverLetter from './CoverLetter';
import AutofillKit from './AutofillKit';
import ResumeUpload from './ResumeUpload';

const EMPTY_TARGET = { title: '', company: '', descriptionText: '' };

/**
 * Resume Tools. The active tab comes from the URL; `focusJobId` preselects
 * the target job (e.g. "Check my resume" from a job detail).
 * @param {{
 *   resumeState: ReturnType<typeof import('../../hooks/useResume').default>,
 *   applications: import('../../types').Application[],
 *   selectedTemplate: string,
 *   setSelectedTemplate: (id: string) => void,
 *   focusJobId: string | null,
 *   tab: string,
 *   onTabChange: (tab: string) => void,
 * }} props
 */
export default function ResumeSection({ resumeState, applications, selectedTemplate, setSelectedTemplate, focusJobId, tab, onTabChange: setTab }) {
  const focusedApp = focusJobId ? applications.find(a => a.jobId === focusJobId) : null;
  const [targetId, setTargetId] = useState(focusedApp ? focusedApp.id : (applications.find(a => a.descriptionText) || { id: 'paste' }).id);
  const [pasted, setPasted] = useState(EMPTY_TARGET);

  const trackedTarget = applications.find(a => a.id === targetId);
  const target = targetId === 'paste' ? pasted : trackedTarget || null;
  const { resume } = resumeState;
  const needsTarget = tab === 'ats' || tab === 'cover';

  return (
    <div className="resume-section-view">
      <div className="view-header">
        <div>
          <h2>Resume Tools</h2>
          <p className="section-description">Build your resume once, then check and tailor it for every job. Saved automatically.</p>
        </div>
        {tab === 'builder' && <button type="button" className="secondary-button" onClick={() => window.print()}>Print / save as PDF</button>}
      </div>

      <Tabs tabs={RESUME_TABS} active={tab} onChange={setTab} label="Resume tools" />

      {needsTarget && (
        <TargetJobPicker
          applications={applications}
          targetId={trackedTarget || targetId === 'paste' ? targetId : 'paste'}
          onTargetIdChange={setTargetId}
          pasted={pasted}
          onPastedChange={setPasted}
        />
      )}

      {tab === 'builder' && (
        <div className="resume-builder">
          <ResumeEditor resumeState={resumeState} />
          <div className="resume-builder-preview">
            <TemplatePicker selectedTemplate={selectedTemplate} setSelectedTemplate={setSelectedTemplate} />
            <ResumePreview resume={resume} template={selectedTemplate} />
          </div>
        </div>
      )}
      {tab === 'ats' && <AtsChecker resumeState={resumeState} target={target} />}
      {tab === 'bullets' && <BulletChecker resume={resume} onEdit={() => setTab('builder')} />}
      {tab === 'cover' && <CoverLetter key={targetId} resume={resume} target={target} />}
      {tab === 'autofill' && <AutofillKit resume={resume} onEdit={() => setTab('builder')} />}
      {tab === 'upload' && <div className="resume-grid"><ResumeUpload /></div>}
    </div>
  );
}
