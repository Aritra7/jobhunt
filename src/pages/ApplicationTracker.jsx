import { jobs } from "../data/jobs";
import { useApp } from "../context/AppContext";
import FeatureBadge from "../components/FeatureBadge";
const STATUSES = ["Saved", "Applied", "Interview", "Offer", "Rejected"];
export default function ApplicationTracker() {
  const { applications, upsertApplication, removeApplication, savedSet } = useApp();
  const savedOnly = jobs.filter((j) => savedSet.has(j.id) && !applications[j.id]);
  function meta(id, k, v) {
    const a = applications[id] || { status: "Saved" };
    upsertApplication(id, a.status, { [k]: v });
  }
  return (
    <>
      <section className="card">
        <div className="card-header">
          <div>
            <div className="title-with-badge">
              <h3>Application Pipeline</h3>
              <FeatureBadge release="V1" />
            </div>
            <p>Track opportunities through Saved, Applied, Interview, Offer, or Rejected.</p>
          </div>
        </div>
        <div className="tracker-board tracker-five">
          {STATUSES.map((status) => {
            const tracked = jobs.filter((j) => applications[j.id]?.status === status);
            const items = status === "Saved" ? [...savedOnly, ...tracked] : tracked;
            return (
              <div className="tracker-col" key={status}>
                <h4>
                  {status}
                  <span>{items.length}</span>
                </h4>
                {items.map((job) => {
                  const app = applications[job.id] || {};
                  return (
                    <div className="tracker-card" key={`${status}-${job.id}`}>
                      <strong>{job.title}</strong>
                      <span>{job.company}</span>
                      <select
                        value={app.status || "Saved"}
                        onChange={(e) =>
                          e.target.value === "__remove__"
                            ? removeApplication(job.id)
                            : upsertApplication(job.id, e.target.value)
                        }
                      >
                        {STATUSES.map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                        <option value="__remove__">Remove from tracker</option>
                      </select>
                      {app.status && (
                        <div className="tracker-meta">
                          <input
                            type="date"
                            value={app.deadline || ""}
                            onChange={(e) => meta(job.id, "deadline", e.target.value)}
                          />
                          <input
                            placeholder="Reminder"
                            value={app.reminder || ""}
                            onChange={(e) => meta(job.id, "reminder", e.target.value)}
                          />
                          <textarea
                            placeholder="Notes / follow-up..."
                            value={app.notes || ""}
                            onChange={(e) => meta(job.id, "notes", e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </section>
      <section className="card">
        <div className="card-header">
          <div>
            <div className="title-with-badge">
              <h3>Deadlines, Reminders & Notes</h3>
              <FeatureBadge release="V2" />
            </div>
            <p>Keep follow-ups and important dates attached to the application.</p>
          </div>
        </div>
        <div className="reminder-list">
          {jobs
            .filter((j) => applications[j.id]?.deadline || applications[j.id]?.reminder)
            .map((job) => (
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
          {!jobs.some((j) => applications[j.id]?.deadline || applications[j.id]?.reminder) && (
            <div className="empty">Add a deadline or reminder to a tracked application.</div>
          )}
        </div>
      </section>
    </>
  );
}
