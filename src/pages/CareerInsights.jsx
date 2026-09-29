import { useMemo, useState } from "react";
import { jobs } from "../data/jobs";
import { useApp } from "../context/AppContext";
import { topSkills } from "../utils/jobUtils";
import { companyFirstLabel } from "../utils/labels";
import SectionCard from "../components/common/SectionCard";
import JobSelect from "../components/common/JobSelect";
import InsightPanel from "../components/insights/InsightPanel";
import SkillDemand from "../components/insights/SkillDemand";

export default function CareerInsights() {
  const { profile } = useApp();
  // The first role is shared by "Role to inspect" and the left side of "Compare".
  const [aId, setAId] = useState(jobs[0].id);
  const [bId, setBId] = useState(jobs[1].id);
  const a = jobs.find((job) => job.id === aId);
  const b = jobs.find((job) => job.id === bId);
  const demand = useMemo(() => topSkills(jobs), []);

  return (
    <>
      <SectionCard
        title="Role & Company Insights"
        badges={["V1"]}
        description="Bring salary, company context, required skills, and profile match into one decision view."
      >
        <label>
          Role to inspect
          <JobSelect jobs={jobs} value={aId} onChange={setAId} />
        </label>
        <InsightPanel job={a} profile={profile} />
      </SectionCard>
      <SectionCard
        title="Compare Roles"
        badges={["V2"]}
        description="Compare two opportunities side by side before deciding where to spend application time."
      >
        <div className="compare-selects">
          <JobSelect jobs={jobs} value={aId} onChange={setAId} format={companyFirstLabel} />
          <JobSelect jobs={jobs} value={bId} onChange={setBId} format={companyFirstLabel} />
        </div>
        <div className="compare-grid">
          <InsightPanel job={a} profile={profile} />
          <InsightPanel job={b} profile={profile} />
        </div>
      </SectionCard>
      <SectionCard
        title="Skill Demand Snapshot"
        badges={["V2"]}
        description="A lightweight trend view based on the prototype job dataset."
      >
        <SkillDemand skills={demand} totalJobs={jobs.length} />
      </SectionCard>
    </>
  );
}
