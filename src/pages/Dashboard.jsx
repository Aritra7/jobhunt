import { jobs } from "../data/jobs";
import { useApp } from "../context/AppContext";
import { sortJobs } from "../utils/jobUtils";
import Hero from "../components/dashboard/Hero";
import StatsRow from "../components/dashboard/StatsRow";
import RecommendedList from "../components/dashboard/RecommendedList";
import WorkflowSteps from "../components/dashboard/WorkflowSteps";

export default function Dashboard() {
  const { profile, savedSet, applications } = useApp();
  const tracked = Object.values(applications);
  const interviews = tracked.filter((a) => a.status === "Interview").length;
  const active = tracked.filter((a) => !["Offer", "Rejected"].includes(a.status)).length;
  const recommended = sortJobs(jobs, "recommended", profile).slice(0, 3);

  return (
    <>
      <Hero
        focus={[
          ["Target roles", profile.targetRoles.length],
          ["Saved jobs", savedSet.size],
          ["Active applications", active],
          ["Interviews", interviews],
        ]}
      />
      <StatsRow
        stats={[
          ["Open roles", jobs.length],
          ["Saved jobs", savedSet.size],
          ["Applications tracked", tracked.length],
          ["Interview stage", interviews],
        ]}
      />
      <section className="dashboard-grid">
        <RecommendedList jobs={recommended} profile={profile} />
        <WorkflowSteps />
      </section>
    </>
  );
}
