import { useState } from "react";
import { useApp } from "../context/AppContext";
import { DUE_SOON_DAYS, dueSoon, groupByStatus, withReminders } from "../utils/trackerUtils";
import { daysUntil } from "../utils/format";
import SectionCard from "../components/common/SectionCard";
import TrackerBoard from "../components/tracker/TrackerBoard";
import ReminderList from "../components/tracker/ReminderList";
import AddApplicationForm from "../components/tracker/AddApplicationForm";

export default function ApplicationTracker() {
  const { applications, addApplication, updateApplication, removeApplication } = useApp();
  const [adding, setAdding] = useState(false);
  const soon = dueSoon(applications, daysUntil);

  return (
    <>
      {soon.length > 0 && (
        <div className="notice-box" role="status">
          ⏰ {soon.length} deadline{soon.length === 1 ? "" : "s"} in the next {DUE_SOON_DAYS} days:{" "}
          {soon.map((a) => `${a.title} (${a.company})`).join(", ")}
        </div>
      )}
      <SectionCard
        title="Application Pipeline"
        badges={["V1"]}
        description="Track opportunities through Saved, Applied, Interviewing, Offer, or Rejected."
        actions={
          !adding && (
            <button className="btn btn-primary" onClick={() => setAdding(true)}>
              + Add application
            </button>
          )
        }
      >
        {adding && <AddApplicationForm onAdd={addApplication} onCancel={() => setAdding(false)} />}
        <TrackerBoard
          columns={groupByStatus(applications)}
          onUpdate={updateApplication}
          onRemove={removeApplication}
        />
      </SectionCard>
      <SectionCard
        title="Deadlines, Reminders & Notes"
        badges={["V2"]}
        description="Keep follow-ups and important dates attached to the application."
      >
        <ReminderList applications={withReminders(applications)} />
      </SectionCard>
    </>
  );
}
