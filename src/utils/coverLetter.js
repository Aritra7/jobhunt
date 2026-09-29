import { resumeSkills } from '../hooks/useResume';
import { extractSkills } from './ats';
import { bulletLines } from '../hooks/useResume';

/**
 * Template-based cover letter draft from the resume + a target job.
 * Deliberately a starting point for the user to edit, not a finished letter.
 * @param {import('../types').Resume} resume
 * @param {{ title: string, company: string, descriptionText: string }} job
 */
export function draftCoverLetter(resume, job) {
  const name = resume.contact.name.trim() || '[Your name]';
  const wanted = extractSkills(job.descriptionText).map(s => s.toLowerCase());
  const mine = resumeSkills(resume);
  const overlap = mine.filter(s => wanted.includes(s.toLowerCase())).slice(0, 3);
  const skills = (overlap.length > 0 ? overlap : mine.slice(0, 3));
  const skillPhrase = skills.length > 1
    ? `${skills.slice(0, -1).join(', ')} and ${skills[skills.length - 1]}`
    : skills[0] || '[your key skills]';

  const recent = resume.experience[0];
  const highlight = recent ? bulletLines(recent.bulletsText)[0] : '';
  const experienceLine = recent
    ? `Most recently, as ${recent.title || '[role]'} at ${recent.company || '[company]'}, I ${highlight ? lowerFirst(highlight.replace(/\.$/, '')) : '[describe a result you are proud of]'}.`
    : 'In my recent work, I [describe a result you are proud of].';

  return [
    `Dear ${job.company} Hiring Team,`,
    '',
    `I'm excited to apply for the ${job.title} role at ${job.company}. My background in ${skillPhrase} lines up closely with what you're looking for.`,
    '',
    experienceLine,
    '',
    `What draws me to ${job.company} is [something specific about the company, product or team]. I'd welcome the chance to bring the same focus on results to your team.`,
    '',
    'Thank you for your time and consideration. I look forward to hearing from you.',
    '',
    'Sincerely,',
    name,
  ].join('\n');
}

/** @param {string} s */
function lowerFirst(s) {
  return s.charAt(0).toLowerCase() + s.slice(1);
}
