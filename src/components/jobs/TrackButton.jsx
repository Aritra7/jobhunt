import { statusLabel } from "../../data/applicationStatuses";

// Save button that reflects the job's tracker status ("Saved ✓", "Applied ✓").
export default function TrackButton({ application, onToggle, label = "Save" }) {
  if (!application) {
    return (
      <button className="btn btn-secondary" onClick={onToggle}>
        {label}
      </button>
    );
  }
  const onlySaved = application.status === "saved";
  return (
    <button
      className="btn btn-success"
      onClick={onlySaved ? onToggle : undefined}
      title={onlySaved ? "Remove from saved" : "Change the status in the Tracker"}
    >
      {statusLabel(application.status)} ✓
    </button>
  );
}
