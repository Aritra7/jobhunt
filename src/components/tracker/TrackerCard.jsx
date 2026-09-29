import { STATUSES } from "../../utils/trackerUtils";

const REMOVE = "__remove__";

export default function TrackerCard({
  job,
  application = {},
  onStatusChange,
  onRemove,
  onMetaChange,
}) {
  return (
    <div className="tracker-card">
      <strong>{job.title}</strong>
      <span>{job.company}</span>
      <select
        value={application.status || "Saved"}
        onChange={(e) =>
          e.target.value === REMOVE ? onRemove(job.id) : onStatusChange(job.id, e.target.value)
        }
      >
        {STATUSES.map((status) => (
          <option key={status}>{status}</option>
        ))}
        <option value={REMOVE}>Remove from tracker</option>
      </select>
      {application.status && (
        <div className="tracker-meta">
          <input
            type="date"
            value={application.deadline || ""}
            onChange={(e) => onMetaChange(job.id, "deadline", e.target.value)}
          />
          <input
            placeholder="Reminder"
            value={application.reminder || ""}
            onChange={(e) => onMetaChange(job.id, "reminder", e.target.value)}
          />
          <textarea
            placeholder="Notes / follow-up..."
            value={application.notes || ""}
            onChange={(e) => onMetaChange(job.id, "notes", e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
