import EmptyState from "../common/EmptyState";

export default function ReminderList({ applications }) {
  return (
    <div className="reminder-list">
      {applications.map((app) => (
        <div className="reminder-row" key={app.id}>
          <div>
            <strong>{app.company}</strong>
            <span>{app.title}</span>
          </div>
          <div>
            <span>{app.deadline || "No deadline"}</span>
            <span>{app.reminder || "No reminder"}</span>
          </div>
        </div>
      ))}
      {applications.length === 0 && (
        <EmptyState>Add a deadline or reminder to a tracked application.</EmptyState>
      )}
    </div>
  );
}
