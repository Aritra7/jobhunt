import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useProjects } from "../hooks/useProjects";
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
import GrammarReview from "../components/resume/GrammarReview";
import ProjectLibrary from "../components/projects/ProjectLibrary";
import ResumeGenerator from "../components/projects/ResumeGenerator";

const EMPTY_TARGET = { title: "", company: "", descriptionText: "" };

// Tabs that work against a target job share one job picker.
const TARGET_TABS = ["tailored", "ats", "cover"];
// Tabs that show a resume preview can print it.
const PRINT_TABS = ["builder", "tailored"];

// Which tracked application to tailor to: the one "Check my resume" came
// from, else the first with a description, else a pasted description.
function initialTargetId(applications, focusJobId) {
  const focused = focusJobId && applications.find((a) => a.jobId === focusJobId);
  const withText = applications.find((a) => a.descriptionText);
  return (focused || withText || { id: "paste" }).id;
}

export default function ResumeProfile() {
  const { profile, setProfile, resumeState, applications } = useApp();
  const library = useProjects();
  const [tab, setTab] = useRouteTab(RESUME_TABS, "/resume-profile");
  const focusJobId = useLocation().state?.jobId;
  const [targetId, setTargetId] = useState(() => initialTargetId(applications, focusJobId));
  const [pasted, setPasted] = useState(EMPTY_TARGET);
  const tracked = applications.find((a) => a.id === targetId);
  const target = tracked || (targetId === "paste" ? pasted : null);
  const { resume } = resumeState;

  function pasteJobText(descriptionText) {
    setTargetId("paste");
    setPasted({ ...EMPTY_TARGET, descriptionText });
  }

  return (
    <>
      <ProfileForm profile={profile} setProfile={setProfile} />
      <SectionCard
        title="Resume Builder & Optimization"
        badges={["V1", "V2"]}
        description="Build your resume, keep a write-up of every project, generate resumes tailored to a role and job, then score and polish them."
        actions={
          PRINT_TABS.includes(tab) && (
            <button className="btn btn-secondary" onClick={() => window.print()}>
              Print / save as PDF
            </button>
          )
        }
      >
        <Tabs tabs={RESUME_TABS} active={tab} onChange={setTab} label="Resume tools" />
        {TARGET_TABS.includes(tab) && (
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
        {tab === "projects" && <ProjectLibrary library={library} />}
        {tab === "tailored" && (
          <ResumeGenerator
            projects={library.projects}
            resumeState={resumeState}
            target={target}
            onLoadJobText={pasteJobText}
            variants={library.variants}
            onSaveVariant={library.saveVariant}
            onRemoveVariant={library.removeVariant}
          />
        )}
        {tab === "upload" && (
          <ResumeUpload resumeState={resumeState} onReview={() => setTab("builder")} />
        )}
        {tab === "ats" && <AtsChecker resumeState={resumeState} target={target} />}
        {tab === "bullets" && (
          <>
            <BulletChecker resume={resume} onEdit={() => setTab("builder")} />
            <GrammarReview resumeState={resumeState} />
          </>
        )}
        {tab === "cover" && <CoverLetter key={targetId} resume={resume} target={target} />}
        {tab === "autofill" && <AutofillKit resume={resume} onEdit={() => setTab("builder")} />}
      </SectionCard>
    </>
  );
}
