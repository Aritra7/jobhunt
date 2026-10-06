# Get a Job

Get a Job brings the whole job search into one place: find real openings,
tailor your resume, apply, track every application, and prepare for
interviews, all in the browser, with no account needed.

## Who it's for
Students and early-career candidates who are juggling job boards, resume
files, spreadsheets and interview notes, and want one connected workflow
instead.

## What you can do

### Dashboard
See your job search at a glance: open roles, saved jobs, active applications,
interviews, and the jobs recommended for you.

### Job Discovery
- Browse live listings from company career pages and job boards (Greenhouse,
  Jobicy, The Muse, Remotive, Arbeitnow), merged and de-duplicated. If the
  sources can't be reached, sample jobs are shown so the app still works.
- Search by title, company, skill or keyword, and filter by region, location,
  work mode (on-site, hybrid, remote), job type and minimum pay.
- Sort by recommendation, pay or company, and load more as you go.
- Save or hide jobs, and restore anything hidden by mistake.
- Set preferences (keywords, locations, work modes, job types, minimum pay) to
  get "Matched for you" picks, and fill the filters with "Use saved profile".
- Open a job to read the full description, see your skill match and gaps,
  learn about the company, apply on the original posting, or check your
  resume against it. Every job has its own link.

### Resume & Profile
- Keep your profile (contact details, skills, target roles) in one place; it
  fills in applications automatically.
- Build your resume with experience entries, bullet points and education, in
  a Modern, Classic or Creative template, and print or save it as a PDF.
- Import an existing PDF, Word or text resume to fill the builder in seconds.
- Get an ATS-style score against any saved job or pasted job description, and
  add missing skills in one click.
- Check your bullet points, draft a cover letter, and copy common application
  answers from the autofill kit.

### Projects & Tailored Resumes
- Keep a write-up of every project: context, who used it, the problem, how it
  works, your contribution, impact, tech and measured results.
- See how well each project fits SDE, FDE, AI engineer and MLE roles (0–3),
  and adjust the score yourself.
- Phrase each project for each role: draft bullets from the project's facts
  (no invented numbers or tools), edit them, and check them against resume
  tone rules (strong verb, a number, no "I", no filler words).
- Import and export projects as markdown files, one file per project.
- Generate a resume for a role, optionally tailored to a saved job or a pasted
  job description: the best-fitting projects are picked (top 3 by default),
  their role-specific bullets are used, skills the job asks for come first,
  and the result gets an ATS score. Print it, download it as markdown, or
  save the version to reopen later.

### Job Application
A guided four-step flow: choose the job, review your autofilled details,
answer screening questions, then review and submit. Drafts are saved, and
your answers are reused next time. Submitted jobs move to the tracker.

### Application Tracker
Follow every application from Saved to Applied, Interviewing, Offer or
Rejected. Add deadlines (with a warning when they're close), reminders,
notes and interview times, see each application's status history, and add
jobs you found elsewhere.

### Interview Preparation
- Practice questions written for a specific job, or run a mock interview and
  get a score with feedback on each answer.
- Use the question bank (behavioral, technical, role-specific) with a timer,
  voice recording and saved answers.
- Plan each interview with a day-by-day prep schedule, a checklist and
  company research notes.

### Career Insights
Compare roles side by side on pay, required skills, your match and skill
gaps, and see which skills are most in demand across current openings.

### V1 / V2 Release Plan
The product's feature breakdown and what each release delivers.

## Getting started
```bash
npm install
npm run dev         # open http://localhost:5173
```

| Command | What it does |
|---|---|
| `npm test` | Unit and interaction tests (run offline against the sample jobs) |
| `npm run test:live` | Smoke test against the real job APIs |
| `npm run typecheck` | Type-checks the whole app (JSDoc + TypeScript) |
| `npm run lint` | Lints the code (oxlint) |
| `npm run build` | Production build |
| `npm run format` | Formats the code (Prettier) |

## Privacy and security
- Everything you enter (profile, resume, tracker, practice answers) stays in
  your browser's local storage. Resume files are read in the browser and
  never uploaded.
- **SEC-2:** resume uploads must be .pdf, .docx or .txt, at most 5 MB, and are
  identified by their contents, not just the file name.
- **SEC-3:** job descriptions from outside sources are sanitized before they
  are shown, and links are limited to http(s).
- **SEC-4:** search input is cleaned and length-limited, filter values are
  checked against allowed options, and API parameters are encoded.

## Project structure
```
src/
  api/          job sources, normalization, HTTP + caching, resume text extraction
  app/          app shell, routes, app-level tests
  context/      shared app state and upgrades of previously saved data
  constants/    browser-storage keys
  data/         sample jobs, default profile and resume, question bank, skills list
  hooks/        reusable state and data hooks
  utils/        pure logic: matching, filtering, ATS scoring, bullet checks, sanitizing
  components/   shared building blocks and one folder per product area
  pages/        one page per route
  styles/       stylesheets, imported in order from index.css
```
Saved data uses the `getajob.*` keys in `src/constants/storageKeys.js`. Don't
rename existing keys, or users' saved data will be lost.

## Known limitations (technical debt)
- Data is stored in the browser, not in an authenticated backend
- No user accounts or authentication
- Job APIs are called from the browser, with no backend cache or rate limiting
- Skills, work mode and pay for live jobs are inferred from the posting text
- Resume parsing, ATS scoring and interview feedback use simple rules, not AI
- Pay is shown as an hourly equivalent so internships and full-time roles compare
- Reminders don't send notifications
- No end-to-end browser tests yet (unit and interaction tests only)
