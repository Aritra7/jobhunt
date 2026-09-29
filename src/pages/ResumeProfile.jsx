import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useRouteTab } from "../hooks/useRouteTab";
import { RESUME_TABS } from "../data/tabs";
import SectionCard from "../components/common/SectionCard";
import Tabs from "../components/common/Tabs";
import ProfileForm from "../components/resume/ProfileForm";
import ResumeEditor from "../components/resume/ResumeEditor";
import ResumePreview from "../components/resume/ResumePreview";
import TemplatePicker from "../components/resume/TemplatePicker";
import ResumeUpload from "../components/resume/ResumeUpload";
import TargetJobPicker from "../components/resume/TargetJobPicker";
import AtsChecker from "../components/resume/AtsChecker";
import BulletChecker from "../components/resume/BulletChecker";
import CoverLetter from "../components/resume/CoverLetter";
import AutofillKit from "../components/resume/AutofillKit";

const EMPTY_TARGET = { title: "", company: "", descriptionText: "" };

// Which tracked application to tailor to: the one "Check my resume" came
// from, else the first with a description, else a pasted description.
function initialTargetId(applications, focusJobId) {
  const focused = focusJobId && applications.find((a) => a.jobId === focusJobId);
  const withText = applications.find((a) => a.descriptionText);
  return (focused || withText || { id: "paste" }).id;
}

export default function ResumeProfile() {
  const { profile, setProfile, resumeState, applications } = useApp();
  const [tab, setTab] = useRouteTab(RESUME_TABS, "/resume-profile");
  const focusJobId = useLocation().state?.jobId;
  const [targetId, setTargetId] = useState(() => initialTargetId(applications, focusJobId));
  const [pasted, setPasted] = useState(EMPTY_TARGET);
  const tracked = applications.find((a) => a.id === targetId);
  const target = tracked || (targetId === "paste" ? pasted : null);
  const { resume } = resumeState;

  return (
    <>
      <ProfileForm profile={profile} setProfile={setProfile} />
      <SectionCard
        title="Resume Builder & Optimization"
        badges={["V1", "V2"]}
        description="Build the base resume in V1, then import, score and tailor it for each job in V2."
        actions={
          tab === "builder" && (
            <button className="btn btn-secondary" onClick={() => window.print()}>
              Print / save as PDF
            </button>
          )
        }
      >
        <Tabs tabs={RESUME_TABS} active={tab} onChange={setTab} label="Resume tools" />
        {(tab === "ats" || tab === "cover") && (
          <TargetJobPicker
            applications={applications}
            targetId={tracked ? targetId : "paste"}
            onTargetIdChange={setTargetId}
            pasted={pasted}
            onPastedChange={setPasted}
          />
        )}
        {tab === "builder" && (
          <div className="resume-layout">
            <ResumeEditor resumeState={resumeState} showContact={false} />
            <div className="stack preview-column">
              <TemplatePicker selected={resumeState.template} onSelect={resumeState.setTemplate} />
              <ResumePreview resume={resume} template={resumeState.template} />
            </div>
          </div>
        )}
        {tab === "upload" && (
          <ResumeUpload resumeState={resumeState} onReview={() => setTab("builder")} />
        )}
        {tab === "ats" && <AtsChecker resumeState={resumeState} target={target} />}
        {tab === "bullets" && <BulletChecker resume={resume} onEdit={() => setTab("builder")} />}
        {tab === "cover" && <CoverLetter key={targetId} resume={resume} target={target} />}
        {tab === "autofill" && <AutofillKit resume={resume} onEdit={() => setTab("builder")} />}
      </SectionCard>
    </>
  );
}
