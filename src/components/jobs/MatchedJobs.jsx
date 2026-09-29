import SectionCard from "../common/SectionCard";
import EmptyState from "../common/EmptyState";

const PREVIEW_COUNT = 3;

// Preview of the jobs that best fit the saved preferences (ported from main).
export default function MatchedJobs({ matches, onSelectJob, onUseProfile, onEditPreferences }) {
  const preview = matches.slice(0, PREVIEW_COUNT);
  const count = matches.length;

  return (
    <SectionCard
      compact
      title="Matched for you"
      badges={["V2"]}
      description={
        count === 0
          ? "No jobs match your saved preferences yet."
          : `${count} job${count === 1 ? "" : "s"} match your saved keywords and locations.`
      }
      actions={
        <div className="inline-actions matched-actions">
          <button className="btn btn-primary" onClick={onUseProfile}>
            Use saved profile
          </button>
          <button className="btn btn-secondary" onClick={onEditPreferences}>
            Edit preferences
          </button>
        </div>
      }
    >
      <div className="recommendation-list">
        {preview.map((job) => (
          <div className="recommendation-row" key={job.id}>
            <div>
              <strong>{job.title}</strong>
              <span>
                {job.company} · {job.location} · {job.mode}
              </span>
            </div>
            <button className="btn btn-soft" onClick={() => onSelectJob(job)}>
              View details
            </button>
          </div>
        ))}
        {count === 0 && (
          <EmptyState>Try adding keywords or another location in your preferences.</EmptyState>
        )}
      </div>
    </SectionCard>
  );
}
