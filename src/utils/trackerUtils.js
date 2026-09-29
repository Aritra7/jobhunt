export const STATUSES = ["Saved", "Applied", "Interview", "Offer", "Rejected"];

// Buckets jobs into tracker columns. Jobs that are saved but not yet tracked
// appear first in the "Saved" column.
export function groupByStatus(jobs, applications, savedSet) {
  const savedOnly = jobs.filter((job) => savedSet.has(job.id) && !applications[job.id]);
  return STATUSES.map((status) => {
    const tracked = jobs.filter((job) => applications[job.id]?.status === status);
    return { status, jobs: status === "Saved" ? [...savedOnly, ...tracked] : tracked };
  });
}

export function jobsWithReminders(jobs, applications) {
  return jobs.filter((job) => applications[job.id]?.deadline || applications[job.id]?.reminder);
}
