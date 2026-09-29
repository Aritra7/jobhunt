import { extractSkills } from './ats';

// Best-effort conversion of plain resume text into builder fields. Contact
// details and skills are reliable; experience/education splitting depends on
// the resume's layout, so the user reviews the result in the builder.

const MAX_SKILLS = 40;
const MAX_ENTRIES = 12;

/** @type {[string, RegExp][]} */
const HEADINGS = [
  ['summary', /^(summary|professional summary|profile|professional profile|about( me)?|objective|career objective)$/i],
  ['experience', /^(experience|work experience|professional experience|relevant experience|employment( history)?|work history|internships?)$/i],
  ['projects', /^((personal |academic |selected |technical )?projects)$/i],
  ['education', /^(education|academic background|education & certifications)$/i],
  ['skills', /^((technical |core |key )?skills|skills (&|and) (tools|interests|technologies)|technologies|tools|technical proficiencies)$/i],
  ['other', /^(certifications?|awards|honou?rs|publications|leadership|activities|extracurriculars|volunteer( experience)?|interests|languages|references|coursework|relevant coursework)$/i],
];

const MONTH = '(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\\.?';
const DATE = `(?:${MONTH}\\s*'?\\d{2,4}|\\d{1,2}\\/\\d{2,4}|(?:19|20)\\d{2})`;
const DATE_RANGE = new RegExp(`(${DATE})\\s*(?:-|–|—|to)\\s*(${DATE}|present|current|now|ongoing)`, 'i');
const SINGLE_DATE = new RegExp(`(?:expected\\s+)?(${MONTH}\\s*\\d{4}|(?:19|20)\\d{2})`, 'i');

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE = /(?:\+?\d{1,2}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;
const LINKEDIN = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_%-]+\/?/i;
const PROFILE_URL = /(?:https?:\/\/)?(?:www\.)?(?:github\.com|gitlab\.com)\/[A-Za-z0-9_-]+\/?/i;
const CITY_STATE = /\b([A-Z][a-zA-Z.' -]+,\s*[A-Z]{2})\b/;
const BULLET = /^\s*[•●▪◦‣∙·*–-]\s*/;
const ROLE_WORDS = /\b(engineer|developer|intern|analyst|manager|designer|assistant|lead|scientist|consultant|associate|specialist|researcher|coordinator|founder|officer|architect|administrator|technician|fellow|representative|tutor|teaching|instructor|president|director|head)\b/i;
const SCHOOL_WORDS = /\b(university|college|institute|school|academy|polytechnic)\b/i;
const DEGREE_WORDS = /\b(bachelor|master|b\.?\s?s\.?|m\.?\s?s\.?|b\.?\s?a\.?|m\.?\s?a\.?|b\.?\s?e\.?|ph\.?\s?d|mba|b\.?\s?tech|m\.?\s?tech|associate|diploma|minor|major|high school)\b/i;

function newId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

/** @param {string} line */
function headingOf(line) {
  const clean = line.replace(/[:\s]+$/, '').trim();
  if (clean.length > 40) return null;
  const found = HEADINGS.find(([, pattern]) => pattern.test(clean));
  return found ? found[0] : null;
}

/** @param {string} s */
const isBullet = (s) => BULLET.test(s) && !/^\s*[–-]\s*\d/.test(s);
/** @param {string} s */
const stripBullet = (s) => s.replace(BULLET, '').trim();
/** @param {string} s */
const hasRange = (s) => DATE_RANGE.test(s);

/**
 * Splits text into lines, joining lone bullet glyphs with the line after them.
 * @param {string} text
 */
function toLines(text) {
  const raw = text.replace(/\r/g, '').split('\n').map(l => l.replace(/\s+$/, '')).filter(l => l.trim());
  /** @type {string[]} */
  const lines = [];
  for (let i = 0; i < raw.length; i++) {
    if (/^\s*[•●▪◦‣∙·*]\s*$/.test(raw[i]) && i + 1 < raw.length) {
      lines.push(`• ${raw[++i].trim()}`);
    } else {
      lines.push(raw[i].trim());
    }
  }
  return lines;
}

/**
 * @param {string[]} lines
 * @returns {{ header: string[], sections: Record<string, string[]> }}
 */
function splitSections(lines) {
  /** @type {Record<string, string[]>} */
  const sections = {};
  const header = [];
  let current = null;
  for (const line of lines) {
    const heading = headingOf(line);
    if (heading) {
      current = heading;
      sections[current] = sections[current] || [];
    } else if (current) {
      sections[current].push(line);
    } else {
      header.push(line);
    }
  }
  return { header, sections };
}

/**
 * @param {string} text
 * @returns {{ start: string, end: string }}
 */
function datesIn(text) {
  const range = text.match(DATE_RANGE);
  if (range) return { start: tidy(range[1]), end: tidy(range[2]) };
  const single = text.match(SINGLE_DATE);
  return single ? { start: '', end: tidy(single[1]) } : { start: '', end: '' };
}

/** @param {string} s */
function tidy(s) {
  const t = s.trim().replace(/\s+/g, ' ');
  return /^(present|current|now|ongoing)$/i.test(t) ? 'Present' : t.charAt(0).toUpperCase() + t.slice(1);
}

/** @param {string} s */
function withoutDates(s) {
  return s.replace(DATE_RANGE, ' ').replace(new RegExp(`\\(?\\s*${DATE}\\s*\\)?`, 'ig'), ' ')
    .replace(/\s{2,}/g, ' ').replace(/^[\s|,•·–—-]+|[\s|,•·–—(-]+$/g, '').trim();
}

/**
 * Header lines of one entry -> title + company (+ location dropped).
 * @param {string[]} headerLines
 */
function titleAndCompany(headerLines) {
  const pieces = headerLines
    .map(withoutDates)
    .flatMap(l => l.split(/\s{3,}|\s[|•·–—]\s|\s-\s|\s+at\s+|,\s(?=[A-Z])/))
    .map(p => p.trim())
    .filter(p => p && !/^(remote|hybrid|on-?site)$/i.test(p) && !/^[A-Z][a-zA-Z.' -]+,?\s*[A-Z]{2}$/.test(p));
  const titleIndex = pieces.findIndex(p => ROLE_WORDS.test(p));
  if (titleIndex === -1) return { title: pieces[0] || '', company: pieces[1] || '' };
  const title = pieces[titleIndex];
  const company = pieces.find((p, i) => i !== titleIndex) || '';
  return { title, company };
}

/**
 * Titles, companies and locations are short; bullet points read like sentences.
 * Needed because many PDFs (Chrome, Google Docs) draw bullets as shapes, so
 * bullet lines arrive without a "•".
 * @param {string} line
 */
function looksLikeHeader(line) {
  return withoutDates(line).split(/\s+/).length <= 7 && !/[.;]$/.test(line.trim());
}

/**
 * Groups experience/project lines into entries: header lines (title, company,
 * dates) followed by bullets. Wrapped bullet lines are joined back together.
 * @param {string[]} lines
 * @returns {import('../types').ExperienceEntry[]}
 */
function parseEntries(lines) {
  /** @type {{ header: string[], bullets: string[], dated: boolean }[]} */
  const groups = [];
  let cur = null;

  /** @param {number} i */
  const startsEntry = (i) => !isBullet(lines[i]) &&
    (hasRange(lines[i]) ||
      (looksLikeHeader(lines[i]) && i + 1 < lines.length && !isBullet(lines[i + 1]) && hasRange(lines[i + 1])));

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const newEntry = !cur || (startsEntry(i) && (cur.bullets.length > 0 || (cur.dated && hasRange(line))));
    if (newEntry && !isBullet(line)) {
      cur = { header: [line], bullets: [], dated: hasRange(line) };
      groups.push(cur);
      continue;
    }
    if (!cur) continue;
    if (isBullet(line)) {
      cur.bullets.push(stripBullet(line));
    } else if (cur.bullets.length === 0 && cur.header.length < 3 && looksLikeHeader(line) &&
               !(cur.dated && cur.header.length >= 2)) {
      cur.header.push(line);
      if (hasRange(line)) cur.dated = true;
    } else if (cur.bullets.length > 0 && /^[a-z(&,]/.test(line)) {
      // Wrapped continuation of the previous bullet.
      cur.bullets[cur.bullets.length - 1] += ` ${line}`;
    } else {
      cur.bullets.push(line);
    }
  }

  return groups.slice(0, MAX_ENTRIES).map(g => {
    const { title, company } = titleAndCompany(g.header);
    const { start, end } = datesIn(g.header.join(' '));
    return { id: newId(), title, company, start, end, bulletsText: g.bullets.join('\n') };
  }).filter(e => e.title || e.bulletsText);
}

/**
 * @param {string[]} lines
 * @returns {import('../types').EducationEntry[]}
 */
function parseEducation(lines) {
  /** @type {string[][]} */
  const groups = [];
  for (const line of lines) {
    if (SCHOOL_WORDS.test(line) || groups.length === 0) groups.push([line]);
    else groups[groups.length - 1].push(line);
  }
  return groups.slice(0, 5).map(group => {
    const pieces = group.flatMap(l => l.split(/\s{3,}|\s[|•·–—]\s|,\s(?=[A-Z])/)).map(withoutDates).filter(Boolean);
    const school = pieces.find(p => SCHOOL_WORDS.test(p)) || pieces[0] || '';
    const degree = pieces.find(p => p !== school && DEGREE_WORDS.test(p)) || '';
    const { start, end } = datesIn(group.join(' '));
    return { id: newId(), school, degree, start, end };
  }).filter(e => e.school);
}

/**
 * @param {string[]} skillLines
 * @param {string} fullText
 */
function parseSkills(skillLines, fullText) {
  const listed = skillLines
    .map(l => stripBullet(l).replace(/^[^:]{1,30}:\s*/, ''))
    .flatMap(l => l.split(/[,;|•·]|\s{3,}/))
    .map(s => s.replace(/\.$/, '').trim())
    .filter(s => s.length >= 1 && s.length <= 40 && !/^(and|etc)$/i.test(s));
  const seen = new Set();
  /** @type {string[]} */
  const skills = [];
  for (const skill of [...listed, ...extractSkills(fullText)]) {
    const key = skill.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      skills.push(skill);
    }
  }
  return skills.slice(0, MAX_SKILLS);
}

/**
 * @param {string[]} header
 * @param {string} fullText
 */
function parseContact(header, fullText) {
  const email = (fullText.match(EMAIL) || [''])[0];
  const phoneMatch = header.join('  ').match(PHONE) || fullText.slice(0, 600).match(PHONE);
  const linkedinMatch = fullText.match(LINKEDIN) || fullText.match(PROFILE_URL);
  const segments = header.flatMap(l => l.split(/\s[|•·]\s|\s{3,}|\s\|\s?/)).map(s => s.trim()).filter(Boolean);
  const name = segments.find(s =>
    !EMAIL.test(s) && !/\d/.test(s) && !/https?:|www\.|\.com/i.test(s) &&
    /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ.'-]*(\s+[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ.'-]*){1,3}$/.test(s)) || '';
  const locationSegment = segments.find(s => s !== name && CITY_STATE.test(s) && !EMAIL.test(s));
  return {
    name,
    email,
    phone: phoneMatch ? phoneMatch[0].trim() : '',
    location: locationSegment ? (locationSegment.match(CITY_STATE) || [''])[0] : '',
    linkedin: linkedinMatch ? linkedinMatch[0].replace(/\/$/, '') : '',
  };
}

/**
 * @param {string} text  Plain text extracted from a PDF/DOCX resume
 * @returns {{ resume: import('../types').Resume, found: { projects: number } }}
 */
export function parseResumeText(text) {
  const lines = toLines(text);
  const { header, sections } = splitSections(lines);
  const experience = parseEntries(sections.experience || []);
  const projects = parseEntries(sections.projects || []);

  return {
    resume: {
      contact: parseContact(header.length ? header : lines.slice(0, 5), text),
      summary: (sections.summary || []).map(stripBullet).join(' ').replace(/\s+/g, ' ').trim(),
      skillsText: parseSkills(sections.skills || [], text).join(', '),
      experience: [...experience, ...projects],
      education: parseEducation(sections.education || []),
    },
    found: { projects: projects.length },
  };
}

/**
 * Applies an imported resume to the builder.
 * 'replace' overwrites everything; 'fill' only fills fields that are empty
 * (skills are merged).
 * @param {import('../types').Resume} current
 * @param {import('../types').Resume} imported
 * @param {'replace' | 'fill'} mode
 * @returns {import('../types').Resume}
 */
export function applyImportedResume(current, imported, mode) {
  if (mode === 'replace') return imported;
  const contact = { ...current.contact };
  for (const key of /** @type {(keyof typeof contact)[]} */ (Object.keys(contact))) {
    if (!contact[key].trim()) contact[key] = imported.contact[key];
  }
  const skills = [...current.skillsText.split(','), ...imported.skillsText.split(',')].map(s => s.trim()).filter(Boolean);
  const uniqueSkills = skills.filter((s, i) => skills.findIndex(x => x.toLowerCase() === s.toLowerCase()) === i);
  return {
    contact,
    summary: current.summary.trim() ? current.summary : imported.summary,
    skillsText: uniqueSkills.join(', '),
    experience: current.experience.length ? current.experience : imported.experience,
    education: current.education.length ? current.education : imported.education,
  };
}
