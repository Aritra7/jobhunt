// Scores jobs against a saved profile. Keyword hits in the title count most,
// then tags, company and description. Work mode and job type act as filters.
const TITLE_WEIGHT = 5;
const TAG_WEIGHT = 3;
const COMPANY_WEIGHT = 2;
const DESCRIPTION_WEIGHT = 1;
const LOCATION_WEIGHT = 3;
const JOB_TYPE_WEIGHT = 1;

/**
 * @param {import('../types').Job} job
 * @param {import('../types').Profile} profile
 */
function passesFilters(job, profile) {
  if (profile.workMode === 'remote' && !job.remote) return false;
  if (profile.workMode === 'onsite' && job.remote) return false;
  if (profile.jobTypes.length > 0 && job.jobTypes.length > 0 &&
      !job.jobTypes.some(t => profile.jobTypes.includes(t))) return false;
  return true;
}

/**
 * @param {import('../types').Job} job
 * @param {import('../types').Profile | null} profile
 * @returns {number} 0 = not a match
 */
export function scoreJob(job, profile) {
  if (!profile || !passesFilters(job, profile)) return 0;

  let relevance = 0;
  const title = job.title.toLowerCase();
  const company = job.company.toLowerCase();
  const tags = job.tags.join(' ').toLowerCase();
  const description = job.descriptionText.toLowerCase();

  for (const keyword of profile.keywords) {
    const k = keyword.toLowerCase();
    if (!k) continue;
    if (title.includes(k)) relevance += TITLE_WEIGHT;
    if (tags.includes(k)) relevance += TAG_WEIGHT;
    if (company.includes(k)) relevance += COMPANY_WEIGHT;
    if (description.includes(k)) relevance += DESCRIPTION_WEIGHT;
  }

  const location = profile.preferredLocation.toLowerCase();
  if (location && job.location.toLowerCase().includes(location)) relevance += LOCATION_WEIGHT;

  // Filters alone (e.g. "remote only") don't make a match; something must be relevant,
  // unless the profile has no keywords/location at all.
  const hasRelevanceCriteria = profile.keywords.length > 0 || location !== '';
  if (hasRelevanceCriteria && relevance === 0) return 0;

  const typeBonus = profile.jobTypes.some(t => job.jobTypes.includes(t)) ? JOB_TYPE_WEIGHT : 0;
  return Math.max(relevance + typeBonus, 1);
}

/**
 * @param {import('../types').Job[]} jobs
 * @param {import('../types').Profile | null} profile
 */
export function matchJobs(jobs, profile) {
  return jobs
    .map(job => ({ job, score: scoreJob(job, profile) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.job.postedAt.localeCompare(a.job.postedAt))
    .map(({ job }) => job);
}
