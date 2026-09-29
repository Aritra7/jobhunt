import { jobs } from "../data/jobs";
import { useApp } from "../context/AppContext";
import { groupByStatus, jobsWithReminders } from "../utils/trackerUtils";
import SectionCard from "../components/common/SectionCard";
import TrackerBoard from "../components/tracker/TrackerBoard";
import ReminderList from "../components/tracker/ReminderList";

export default function ApplicationTracker() {
  const { applications, upsertApplication, removeApplication, savedSet } = useApp();

  // Editing a saved-but-untracked card starts tracking it as "Saved".
  function updateMeta(id, key, value) {
    const status = applications[id]?.status || "Saved";
    upsertApplication(id, status, { [key]: value });
  }

  return (
    <>
      <SectionCard
        title="Application Pipeline"
        badges={["V1"]}
        description="Track opportunities through Saved, Applied, Interview, Offer, or Rejected."
      >
        <TrackerBoard
          columns={groupByStatus(jobs, applications, savedSet)}
          applications={applications}
          onStatusChange={upsertApplication}
          onRemove={removeApplication}
          onMetaChange={updateMeta}
        />
      </SectionCard>
      <SectionCard
        title="Deadlines, Reminders & Notes"
        badges={["V2"]}
        description="Keep follow-ups and important dates attached to the application."
      >
        <ReminderList jobs={jobsWithReminders(jobs, applications)} applications={applications} />
      </SectionCard>
    </>
  );
}
