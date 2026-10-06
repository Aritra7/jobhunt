import { extractSkills } from "./ats";
import { draftBullets, projectText, roleFit } from "./projectPhrasing";
import { resumeSkills } from "../hooks/useResume";

// Builds a resume tailored to a role (and optionally a job description) from
// the project library: rank projects, take the role's bullets, order skills.

export const DEFAULT_PROJECT_COUNT = 3; // a one-page resume rarely fits more

const lower = (list) => new Set(list.map((s) => s.toLowerCase()));

/** Skills a job description asks for that the project shows. */
export function matchedSkills(project, jobText) {
  if (!jobText?.trim()) return [];
  const projectSkills = lower([...project.tech, ...extractSkills(projectText(project))]);
  return extractSkills(jobText).filter((skill) => projectSkills.has(skill.toLowerCase()));
}

/**
 * Projects ordered for a role: role fit first, then overlap with the job
 * description, then whether the project has measured results.
 */
export function rankProjects(projects, roleId, jobText = "") {
  return projects
    .map((project) => {
      const fit = roleFit(project, roleId);
      const matched = matchedSkills(project, jobText);
      const score = fit * 10 + matched.length * 3 + (project.metrics.length ? 2 : 0);
      return { project, fit, matched, score };
    })
    .sort((a, b) => b.score - a.score);
}

/** The project's saved bullets for the role, or drafts if none are saved yet. */
export function bulletsForRole(project, roleId) {
  const saved = project.bullets[roleId] || [];
  return saved.length ? saved : draftBullets(project, roleId);
}

/** Resume skills with the ones the job asks for moved to the front. */
export function orderSkills(skills, jobText) {
  const wanted = lower(jobText?.trim() ? extractSkills(jobText) : []);
  return [...skills].sort(
    (a, b) => Number(wanted.has(b.toLowerCase())) - Number(wanted.has(a.toLowerCase())),
  );
}

/**
 * The tailored resume: the base resume plus a Projects section built from the
 * chosen projects, with skills ordered for the job. Contact, summary,
 * experience and education come from the base resume unchanged.
 */
export function buildTailoredResume(resume, projects, roleId, jobText = "") {
  return {
    ...resume,
    skillsText: orderSkills(resumeSkills(resume), jobText).join(", "),
    projects: projects.map((project) => ({
      id: project.id,
      title: project.title,
      context: project.context,
      dates: project.dates,
      tech: project.tech,
      bullets: bulletsForRole(project, roleId),
    })),
  };
}

/**
 * The tailored resume in the builder's shape (projects as extra experience
 * entries), so the existing ATS score can rate it against the job.
 */
export function asScorableResume(tailored) {
  return {
    ...tailored,
    experience: [
      ...tailored.experience,
      ...tailored.projects.map((p) => ({
        id: p.id,
        title: p.title,
        company: p.context,
        start: "",
        end: p.dates,
        bulletsText: [...p.bullets, p.tech.join(", ")].join("\n"),
      })),
    ],
  };
}

/** The tailored resume as markdown, for saving or pasting elsewhere. */
export function resumeToMarkdown(tailored, roleName) {
  const { contact } = tailored;
  const lines = [
    `# ${contact.name}`,
    [contact.email, contact.phone, contact.location, contact.linkedin].filter(Boolean).join(" · "),
    "",
    `_${roleName} resume_`,
    "",
  ];
  if (tailored.summary) lines.push("## Summary", tailored.summary, "");
  if (tailored.experience.length) {
    lines.push("## Experience");
    for (const exp of tailored.experience) {
      lines.push(`### ${[exp.title, exp.company].filter(Boolean).join(", ")}`);
      lines.push(
        ...exp.bulletsText
          .split("\n")
          .filter(Boolean)
          .map((b) => `- ${b}`),
        "",
      );
    }
  }
  if (tailored.projects.length) {
    lines.push("## Projects");
    for (const project of tailored.projects) {
      lines.push(`### ${project.title} (${project.tech.join(", ")})`);
      lines.push(...project.bullets.map((b) => `- ${b}`), "");
    }
  }
  if (tailored.education.length) {
    lines.push("## Education");
    for (const edu of tailored.education) {
      lines.push(`- ${[edu.school, edu.degree].filter(Boolean).join(", ")}`);
    }
    lines.push("");
  }
  lines.push("## Skills", resumeSkills(tailored).join(", "));
  return lines.join("\n") + "\n";
}
