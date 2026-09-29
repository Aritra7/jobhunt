import EmptyState from "../common/EmptyState";

export default function ReminderList({ jobs, applications }) {
  return (
    <div className="reminder-list">
      {jobs.map((job) => (
        <div className="reminder-row" key={job.id}>
          <div>
            <strong>{job.company}</strong>
            <span>{job.title}</span>
          </div>
          <div>
            <span>{applications[job.id]?.deadline || "No deadline"}</span>
            <span>{applications[job.id]?.reminder || "No reminder"}</span>
          </div>
        </div>
      ))}
      {jobs.length === 0 && (
        <EmptyState>Add a deadline or reminder to a tracked application.</EmptyState>
      )}
    </div>
  );
}
