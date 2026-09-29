import { APPLICATION_STATUSES } from "../data/applicationStatuses";

export { APPLICATION_STATUSES };
export const DUE_SOON_DAYS = 3;

// Buckets tracked applications into the board's status columns.
export function groupByStatus(applications) {
  return APPLICATION_STATUSES.map(({ id, label }) => ({
    status: id,
    label,
    applications: applications.filter((app) => app.status === id),
  }));
}

export function withReminders(applications) {
  return applications.filter((app) => app.deadline || app.reminder);
}

/** Open applications whose deadline is today or within the next few days. */
export function dueSoon(applications, daysUntil) {
  return applications.filter((app) => {
    if (!app.deadline || !["saved", "applied"].includes(app.status)) return false;
    const days = daysUntil(app.deadline);
    return days >= 0 && days <= DUE_SOON_DAYS;
  });
}
