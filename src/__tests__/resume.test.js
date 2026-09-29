import { describe, it, expect } from 'vitest';
import { extractSkills, atsScore } from '../utils/ats';
import { checkBullet, checkConsistency } from '../utils/bulletCheck';
import { draftCoverLetter } from '../utils/coverLetter';
import { buildPrepSchedule } from '../utils/prepSchedule';
import { EMPTY_RESUME } from '../hooks/useResume';

const resume = {
  ...EMPTY_RESUME,
  contact: { ...EMPTY_RESUME.contact, name: 'Sam Lee', email: 'sam@example.com' },
  summary: 'Frontend developer who builds fast, accessible web apps for students and small teams across campus.',
  skillsText: 'React, JavaScript, CSS, Figma, Git',
  experience: [{ id: '1', title: 'Web Developer', company: 'Campus Lab', start: '2025', end: 'Present',
    bulletsText: 'Built a React dashboard used by 200 students weekly\nhelped with testing' }],
  education: [{ id: '1', school: 'CMU', degree: 'MS', start: '2025', end: '2026' }],
};

describe('extractSkills', () => {
  it('finds skills including symbols and aliases', () => {
    expect(extractSkills('We use C++, C#, .NET, Node.js and k8s')).toEqual(expect.arrayContaining(['C++', 'C#', '.NET', 'Node.js', 'Kubernetes']));
  });

  it('does not match ordinary English words', () => {
    const found = extractSkills('You will rest, go to spring events and express ideas. You excel at swift delivery.');
    expect(found).not.toEqual(expect.arrayContaining(['REST APIs']));
    expect(found).not.toContain('Go');
    expect(found).not.toContain('Spring Boot');
    expect(found).not.toContain('Express.js');
    expect(found).not.toContain('Excel');
    expect(found).not.toContain('Swift');
  });

  it('matches case-sensitive skills when written as the proper name', () => {
    expect(extractSkills('Backend in Go and Rust')).toEqual(expect.arrayContaining(['Go', 'Rust']));
  });
});

describe('atsScore', () => {
  it('reports matched and missing keywords', () => {
    const result = atsScore(resume, 'Looking for React, TypeScript and CSS experience. Figma a plus.');
    expect(result.matched).toEqual(expect.arrayContaining(['React', 'CSS', 'Figma']));
    expect(result.missing).toEqual(['TypeScript']);
    expect(result.score).toBeGreaterThan(70);
  });

  it('scores an empty resume low', () => {
    expect(atsScore(EMPTY_RESUME, 'React, TypeScript').score).toBe(0);
  });
});

describe('checkBullet', () => {
  it('accepts a strong, quantified bullet', () => {
    expect(checkBullet('Built a React dashboard used by 200 students weekly')).toEqual([]);
  });

  it('flags weak openers, missing metrics, first person and length', () => {
    const ids = checkBullet('helped with testing').map(i => i.id);
    expect(ids).toEqual(expect.arrayContaining(['weak-opener', 'no-metric', 'too-short', 'lowercase']));
    expect(checkBullet('I built my first app for 10 users in a week').map(i => i.id)).toContain('first-person');
  });

  it('flags inconsistent trailing periods', () => {
    expect(checkConsistency(['Did a thing.', 'Did another'])).toHaveLength(1);
    expect(checkConsistency(['Did a thing', 'Did another'])).toHaveLength(0);
  });
});

describe('draftCoverLetter', () => {
  it('uses the job, the overlapping skills and the latest experience', () => {
    const letter = draftCoverLetter(resume, { title: 'Frontend Engineer', company: 'Acme', descriptionText: 'React and CSS' });
    expect(letter).toContain('Frontend Engineer role at Acme');
    expect(letter).toContain('React and CSS');
    expect(letter).toContain('Web Developer at Campus Lab');
    expect(letter.trim().endsWith('Sam Lee')).toBe(true);
  });
});

describe('buildPrepSchedule', () => {
  it('plans the days before the interview and tracks progress', () => {
    const now = new Date(2026, 8, 28);
    const steps = buildPrepSchedule('2026-10-01T10:00', { research: true, jd: true }, now);
    expect(steps).toHaveLength(5);
    expect(steps[0].date.getDate()).toBe(28);
    expect(steps[0].state).toBe('done');
    expect(steps[1].state).toBe('upcoming');
  });
});
