import { jobs } from "../data/jobs";
export async function fetchJobs() {
  await new Promise((r) => setTimeout(r, 250));
  return jobs;
}
