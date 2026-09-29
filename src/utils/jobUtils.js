export function getMatchScore(job, profileSkills = []) {
  if (!job?.skills?.length) return 0;

  const normalized = (profileSkills || []).map((skill) =>
    String(skill).toLowerCase()
  );

  const matches = job.skills.filter((skill) =>
    normalized.includes(String(skill).toLowerCase())
  ).length;

  return Math.round((matches / job.skills.length) * 100);
}

export function getSkillGaps(job, profileSkills = []) {
  const normalized = (profileSkills || []).map((skill) =>
    String(skill).toLowerCase()
  );

  return (job?.skills || []).filter(
    (skill) =>
      !normalized.includes(String(skill).toLowerCase())
  );
}

export function filterJobs(jobs, filters) {
  const query = String(filters?.query || "")
    .trim()
    .toLowerCase();

  return (jobs || []).filter((job) => {
    const searchable = [
      job.title,
      job.company,
      job.location,
      job.mode,
      job.type,
      ...(job.skills || []),
    ]
      .join(" ")
      .toLowerCase();

    const matchesQuery =
      searchable.includes(query);

    const matchesLocation =
      !filters?.location ||
      filters.location === "all" ||
      job.location === filters.location;

    const matchesMode =
      !filters?.mode ||
      filters.mode === "all" ||
      job.mode === filters.mode;

    const matchesSalary =
      Number(filters?.minSalary || 0) <=
      Number(job.salaryMax || 0);

    return (
      matchesQuery &&
      matchesLocation &&
      matchesMode &&
      matchesSalary
    );
  });
}

export function recommendationScore(
  job,
  profile = {}
) {
  const skills =
    profile.skills || [];

  const preferredLocations =
    profile.preferredLocations ||
    (profile.location
      ? [profile.location]
      : []);

  const preferredModes =
    profile.preferredModes || [];

  const minSalary =
    Number(profile.minSalary ?? 0);

  const skillScore =
    getMatchScore(job, skills);

  const locationBoost =
    preferredLocations.some(
      (location) =>
        location === job.location ||
        location === job.mode ||
        (location === "Remote" &&
          job.mode === "Remote")
    )
      ? 10
      : 0;

  const modeBoost =
    preferredModes.includes(job.mode)
      ? 8
      : 0;

  const salaryBoost =
    Number(job.salaryMax || 0) >= minSalary
      ? 5
      : 0;

  return Math.min(
    100,
    skillScore +
      locationBoost +
      modeBoost +
      salaryBoost
  );
}

export function formatSalary(job) {
  if (!job) {
    return "Salary unavailable";
  }

  if (job.salaryMin === job.salaryMax) {
    return `$${job.salaryMin}/hr`;
  }

  return `$${job.salaryMin}–${job.salaryMax}/hr`;
}