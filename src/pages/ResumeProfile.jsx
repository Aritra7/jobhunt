import { useMemo, useState } from "react";
import { jobs } from "../data/jobs";
import { useApp } from "../context/AppContext";
import { analyzeResumeForJob } from "../utils/resumeUtils";
import SectionCard from "../components/common/SectionCard";
import JobSelect from "../components/common/JobSelect";
import ProfileForm from "../components/resume/ProfileForm";
import ResumeUpload from "../components/resume/ResumeUpload";
import ResumeEditor from "../components/resume/ResumeEditor";
import ResumeAnalysis from "../components/resume/ResumeAnalysis";
import ResumePreview from "../components/resume/ResumePreview";

export default function ResumeProfile() {
  const { profile, setProfile, resume, setResume } = useApp();
  const [jobId, setJobId] = useState(jobs[0].id);
  const job = jobs.find((x) => x.id === jobId);
  const analysis = useMemo(() => analyzeResumeForJob(resume, job), [resume, job]);

  return (
    <>
      <ProfileForm profile={profile} setProfile={setProfile} />
      <SectionCard
        title="Resume Builder & Optimization"
        badges={["V1", "V2"]}
        description="Build the base resume in V1, then use match analysis and optimization suggestions as V2 intelligence."
      >
        <ResumeUpload fileName={resume.fileName} setResume={setResume} />
        <div className="resume-layout">
          <div className="stack">
            <label>
              Target job
              <JobSelect jobs={jobs} value={jobId} onChange={setJobId} />
            </label>
            <ResumeEditor resume={resume} setResume={setResume} />
            <ResumeAnalysis job={job} analysis={analysis} />
          </div>
          <ResumePreview profile={profile} resume={resume} />
        </div>
      </SectionCard>
    </>
  );
}
