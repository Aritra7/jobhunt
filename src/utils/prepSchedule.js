const DAY_MS = 24 * 60 * 60 * 1000;

// Countdown plan working backwards from the interview. Offsets are in days
// relative to the interview; checklistIds link each step to the checklist.
const PLAN = [
  { offset: -3, label: 'Research the company and re-read the job description', checklistIds: ['research', 'jd'] },
  { offset: -2, label: 'Write and rehearse 3 STAR stories', checklistIds: ['star'] },
  { offset: -1, label: 'Practice technical / role-specific questions; prepare your questions', checklistIds: ['technical', 'questions'] },
  { offset: 0, label: 'Interview day: confirm logistics, have resume + notes ready', checklistIds: ['logistics', 'resume'] },
  { offset: 1, label: 'Send a thank-you note', checklistIds: ['thanks'] },
];

/**
 * @param {string} interviewAt  yyyy-mm-ddThh:mm (local time)
 * @param {Record<string, boolean>} checklist
 * @param {Date} [now]
 */
export function buildPrepSchedule(interviewAt, checklist, now = new Date()) {
  const interview = new Date(interviewAt);
  if (Number.isNaN(interview.getTime())) return [];
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  return PLAN.map(step => {
    const date = new Date(interview.getFullYear(), interview.getMonth(), interview.getDate() + step.offset);
    const done = step.checklistIds.every(id => checklist[id]);
    const dayDiff = Math.round((date.getTime() - today) / DAY_MS);
    return {
      ...step,
      date,
      done,
      state: done ? 'done' : dayDiff < 0 ? 'overdue' : dayDiff === 0 ? 'today' : 'upcoming',
    };
  });
}
