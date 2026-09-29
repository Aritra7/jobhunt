import { useApp } from "../context/AppContext";
import { useJobsData } from "../context/JobsContext";
import { sortJobs } from "../utils/jobUtils";
import Hero from "../components/dashboard/Hero";
import StatsRow from "../components/dashboard/StatsRow";
import RecommendedList from "../components/dashboard/RecommendedList";
import WorkflowSteps from "../components/dashboard/WorkflowSteps";

export default function Dashboard() {
  const { profile, applications } = useApp();
  const { jobs, status } = useJobsData();
  const count = (statuses) => applications.filter((a) => statuses.includes(a.status)).length;
  const saved = count(["saved"]);
  const interviews = count(["interviewing"]);
  const active = count(["saved", "applied", "interviewing"]);
  const recommended = sortJobs(jobs, "recommended", profile).slice(0, 3);

  return (
    <>
      <Hero
        focus={[
          ["Target roles", profile.targetRoles.length],
          ["Saved jobs", saved],
          ["Active applications", active],
          ["Interviews", interviews],
        ]}
      />
      <StatsRow
        stats={[
          [
            status === "sample" ? "Sample roles" : "Open roles",
            status === "loading" ? "…" : jobs.length,
          ],
          ["Saved jobs", saved],
          ["Applications tracked", applications.length],
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
