import StatusSelect from "./StatusSelect";
import { statusLabel } from "../../data/applicationStatuses";
import { formatDate, formatDateTime } from "../../utils/format";

// One application on the board: status, dates, reminder, notes and history.
export default function TrackerCard({ application: app, onUpdate, onRemove }) {
  const update = (patch) => onUpdate(app.id, patch);

  function remove() {
    if (window.confirm(`Stop tracking "${app.title}" at ${app.company}?`)) onRemove(app.id);
  }

  return (
    <div className="tracker-card">
      <strong>
        {app.url ? (
          <a href={app.url} target="_blank" rel="noopener noreferrer">
            {app.title} ↗
          </a>
        ) : (
          app.title
        )}
      </strong>
      <span>
        {app.company} · {app.sourceName}
      </span>
      <StatusSelect value={app.status} onChange={(status) => update({ status })} />
      <div className="tracker-meta">
        <input
          type="date"
          aria-label="Deadline"
          value={app.deadline}
          onChange={(e) => update({ deadline: e.target.value })}
        />
        {(app.status === "interviewing" || app.interviewAt) && (
          <input
            type="datetime-local"
            aria-label="Interview date and time"
            value={app.interviewAt}
            onChange={(e) => update({ interviewAt: e.target.value })}
          />
        )}
        <input
          placeholder="Reminder"
          value={app.reminder}
          onChange={(e) => update({ reminder: e.target.value })}
        />
        <textarea
          placeholder="Notes / follow-up..."
          value={app.notes}
          onChange={(e) => update({ notes: e.target.value })}
        />
        {app.appliedAt && <span className="muted">Applied {formatDate(app.appliedAt)}</span>}
        <details>
          <summary>History ({app.history.length})</summary>
          <ol className="history-steps">
            {app.history.map((entry, i) => (
              <li key={i}>
                {statusLabel(entry.status)} · {formatDateTime(entry.at)}
              </li>
            ))}
          </ol>
        </details>
        <button className="link-btn danger" onClick={remove}>
          Remove from tracker
        </button>
      </div>
    </div>
  );
}
