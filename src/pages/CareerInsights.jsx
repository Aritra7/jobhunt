import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { useJobsData } from "../context/JobsContext";
import { useJobChoice } from "../hooks/useJobOptions";
import { topSkills } from "../utils/jobUtils";
import { companyFirstLabel } from "../utils/labels";
import SectionCard from "../components/common/SectionCard";
import JobSelect from "../components/common/JobSelect";
import InsightPanel from "../components/insights/InsightPanel";
import SkillDemand from "../components/insights/SkillDemand";

export default function CareerInsights() {
  const { profile } = useApp();
  // The first role is shared by "Role to inspect" and the left side of "Compare".
  const [aId, setAId] = useState(null);
  const [bId, setBId] = useState(null);
  const { job: a, choices } = useJobChoice(aId);
  const second = useJobChoice(bId);
  const b = bId ? second.job : choices[1] || a;
  const compareChoices = second.choices;
  const { jobs } = useJobsData();
  const demand = useMemo(() => topSkills(jobs), [jobs]);

  if (!a) {
    return (
      <SectionCard title="Role & Company Insights" badges={["V1"]}>
        <p className="muted">Loading jobs…</p>
      </SectionCard>
    );
  }

  return (
    <>
      <SectionCard
        title="Role & Company Insights"
        badges={["V1"]}
        description="Bring salary, company context, required skills, and profile match into one decision view."
      >
        <label>
          Role to inspect
          <JobSelect jobs={choices} value={a.id} onChange={setAId} />
        </label>
        <InsightPanel job={a} profile={profile} />
      </SectionCard>
      <SectionCard
        title="Compare Roles"
        badges={["V2"]}
        description="Compare two opportunities side by side before deciding where to spend application time."
      >
        <div className="compare-selects">
          <JobSelect jobs={choices} value={a.id} onChange={setAId} format={companyFirstLabel} />
          <JobSelect
            jobs={compareChoices}
            value={b.id}
            onChange={setBId}
            format={companyFirstLabel}
          />
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
