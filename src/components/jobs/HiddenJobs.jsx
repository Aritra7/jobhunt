import SectionCard from "../common/SectionCard";

export default function HiddenJobs({ jobs, onRestore }) {
  if (jobs.length === 0) return null;
  return (
    <SectionCard
      compact
      title="Hidden jobs"
      description="Restore an opportunity if you hid it by mistake."
    >
      <div className="chips">
        {jobs.map((job) => (
          <button className="chip button-chip" key={job.id} onClick={() => onRestore(job.id)}>
            Restore {job.company}
          </button>
        ))}
      </div>
    </SectionCard>
  );
}
