import { describe, it, expect } from 'vitest';
import { parseResumeText, applyImportedResume } from '../utils/parseResume';
import { detectFileKind } from '../utils/fileSignature';
import { EMPTY_RESUME } from '../hooks/useResume';

// Typical PDF text: right-aligned dates arrive after a wide gap, bullets as "•".
const PDF_STYLE = `Jordan Rivera
Pittsburgh, PA | (412) 555-0199 | jordan.rivera@andrew.cmu.edu | linkedin.com/in/jordanrivera
SUMMARY
Software engineer focused on web platforms and data tooling.
EXPERIENCE
Software Engineer Intern | Duolingo   Jun 2025 – Aug 2025
• Built an internal React dashboard used by 40 engineers to track experiment results
• Reduced API latency by 35% by caching hot endpoints in Redis
Teaching Assistant, Carnegie Mellon University   Jan 2025 – May 2025
• Held weekly office hours for 120 students in Intro to Programming
and graded weekly assignments
PROJECTS
JobFind – Job Search Companion   Sep 2026 – Present
• Aggregated 1,700+ live jobs from 5 APIs with React and Vite
EDUCATION
Carnegie Mellon University   Pittsburgh, PA
M.S. in Information Systems   Expected May 2027
University of Texas at Austin
B.S. Computer Science   2020 – 2024
SKILLS
Languages: Python, JavaScript, TypeScript, SQL
Tools: React, Node.js, Docker, Git, AWS`;

// Typical Word export: company/date line, then title line, bullets from list items.
const DOCX_STYLE = `Priya Shah
priya.shah@gmail.com • 555-123-4567 • github.com/priyashah
Professional Experience
Stripe — San Francisco, CA   2023 – Present
Backend Engineer
• Designed idempotent payment APIs handling 2M requests per day
Education
Georgia Institute of Technology, Bachelor of Science in Computer Science, 2023
Technical Skills
Go, Ruby, PostgreSQL, Kafka`;

describe('parseResumeText', () => {
  const { resume, found } = parseResumeText(PDF_STYLE);

  it('extracts contact details', () => {
    expect(resume.contact).toEqual({
      name: 'Jordan Rivera',
      email: 'jordan.rivera@andrew.cmu.edu',
      phone: '(412) 555-0199',
      location: 'Pittsburgh, PA',
      linkedin: 'linkedin.com/in/jordanrivera',
    });
  });

  it('extracts summary and skills (listed + detected)', () => {
    expect(resume.summary).toBe('Software engineer focused on web platforms and data tooling.');
    expect(resume.skillsText.split(', ')).toEqual(expect.arrayContaining(['Python', 'TypeScript', 'SQL', 'React', 'Node.js', 'Docker', 'AWS', 'Redis']));
  });

  it('splits experience into entries with titles, companies, dates and bullets', () => {
    const [intern, ta, project] = resume.experience;
    expect(intern).toMatchObject({ title: 'Software Engineer Intern', company: 'Duolingo', start: 'Jun 2025', end: 'Aug 2025' });
    expect(intern.bulletsText.split('\n')).toHaveLength(2);
    expect(ta).toMatchObject({ title: 'Teaching Assistant', company: 'Carnegie Mellon University', start: 'Jan 2025' });
    expect(ta.bulletsText).toBe('Held weekly office hours for 120 students in Intro to Programming and graded weekly assignments');
    expect(project).toMatchObject({ title: 'JobFind', end: 'Present' });
    expect(found.projects).toBe(1);
  });

  it('extracts education', () => {
    expect(resume.education.map(e => [e.school, e.degree, e.end])).toEqual([
      ['Carnegie Mellon University', 'M.S. in Information Systems', 'May 2027'],
      ['University of Texas at Austin', 'B.S. Computer Science', '2024'],
    ]);
  });

  it('handles a Word-style layout (company line, then title line)', () => {
    const r = parseResumeText(DOCX_STYLE).resume;
    expect(r.contact.name).toBe('Priya Shah');
    expect(r.contact.phone).toBe('555-123-4567');
    expect(r.contact.linkedin).toBe('github.com/priyashah');
    expect(r.experience[0]).toMatchObject({ title: 'Backend Engineer', company: 'Stripe', start: '2023', end: 'Present' });
    expect(r.education[0]).toMatchObject({ school: 'Georgia Institute of Technology', degree: 'Bachelor of Science in Computer Science', end: '2023' });
    expect(r.skillsText).toContain('Kafka');
  });

  it('finds bullets in PDFs that draw bullet glyphs as shapes (no "•" in the text)', () => {
    const text = `Alex Morgan
Seattle, WA | (206) 555-0147 | alex.morgan@uw.edu
EXPERIENCE
Software Engineer Intern | Amazon May 2025 – Aug 2025
Built a TypeScript service that cut order lookup time by 30% for 5,000 support agents
Wrote integration tests with Jest and raised coverage from 55% to 82%
Web Developer, UW Information School Sep 2023 – Apr 2025
Redesigned the department site in React, improving Lighthouse accessibility score to 98
EDUCATION
University of Washington 2021 – 2025
B.S. in Informatics`;
    const r = parseResumeText(text).resume;
    expect(r.experience.map(e => [e.title, e.company, e.bulletsText.split('\n').length])).toEqual([
      ['Software Engineer Intern', 'Amazon', 2],
      ['Web Developer', 'UW Information School', 1],
    ]);
    expect(r.education[0]).toMatchObject({ school: 'University of Washington', degree: 'B.S. in Informatics', start: '2021', end: '2025' });
  });

  it('returns empty fields rather than garbage for unstructured text', () => {
    const r = parseResumeText('Just some notes without any structure').resume;
    expect(r.contact.email).toBe('');
    expect(r.experience).toEqual([]);
    expect(r.education).toEqual([]);
  });
});

describe('applyImportedResume', () => {
  const imported = parseResumeText(PDF_STYLE).resume;
  const current = { ...EMPTY_RESUME, contact: { ...EMPTY_RESUME.contact, name: 'My Name' }, skillsText: 'Figma, python' };

  it('replace overwrites everything', () => {
    expect(applyImportedResume(current, imported, 'replace')).toBe(imported);
  });

  it('fill keeps existing values, fills gaps and merges skills without duplicates', () => {
    const merged = applyImportedResume(current, imported, 'fill');
    expect(merged.contact.name).toBe('My Name');
    expect(merged.contact.email).toBe('jordan.rivera@andrew.cmu.edu');
    const skills = merged.skillsText.split(', ');
    expect(skills.slice(0, 2)).toEqual(['Figma', 'python']);
    expect(skills.filter(s => s.toLowerCase() === 'python')).toHaveLength(1);
    expect(merged.experience).toHaveLength(3);
  });
});

describe('detectFileKind', () => {
  const enc = (s) => new TextEncoder().encode(s);
  it('trusts file contents, not names', () => {
    expect(detectFileKind(enc('%PDF-1.7\n...'))).toBe('pdf');
    expect(detectFileKind(new Uint8Array([0x50, 0x4b, 0x03, 0x04, ...enc('....word/document.xml')]))).toBe('docx');
    expect(detectFileKind(new Uint8Array([0x50, 0x4b, 0x03, 0x04, ...enc('....some other zip')]))).toBe('unknown');
    expect(detectFileKind(enc('<script>alert(1)</script>'))).toBe('unknown');
    expect(detectFileKind(new Uint8Array([0x4d, 0x5a]))).toBe('unknown'); // an .exe renamed to .pdf
  });
});
