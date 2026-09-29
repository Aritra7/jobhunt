# Get a Job — Full Product Prototype

React + Vite prototype aligned to the Agile Methods feature decomposition. It
combines three branches:

- **Kai's `kai-getajob`**: the UI and product structure (8 pages, dashboard,
  application wizard, insights, V1/V2 plan).
- **Prithvi's Sprint 3 work on `main`**: preferences, keyword matching,
  SEC-2 upload checks, resume templates.
- **Prithvi's `final-sprint`**: live job data, tracker, interview prep, resume
  tools, SEC-3/SEC-4 security and TD-3 type checking.

## Product areas
- Dashboard
- Job Discovery
- Resume & Profile
- Job Application
- Application Tracker
- Interview Preparation
- Career Insights
- V1 / V2 Release Plan

## Feature coverage
**Job Discovery:** live listings from Greenhouse (~30 US companies), Jobicy,
The Muse, Remotive and Arbeitnow, merged and de-duplicated; if none responds,
23 sample jobs are shown. Search across title, company, skills, tags and
description. Region, location, work-mode, job-type and pay filters; sorting;
show more / load more. Save, hide and restore jobs. Saved preferences
(keywords, locations, work modes, job types, minimum pay), "Matched for you"
and "Use saved profile". Job details (own URL `/jobs/:id`) show the sanitized
description, apply link, company profile, other roles, skill gaps and
"Check my resume".

**Resume & Profile:** profile editor, then tabs: builder (experience entries
with bullets, education, Modern / Classic / Creative templates, print to
PDF), import (PDF / Word / .txt read in the browser and parsed into the
builder), ATS score against a tracked job or pasted description, bullet
checker, cover-letter draft, autofill kit.

**Job Application:** select job, autofill, screening questions, review and
submit (adds the job to the tracker as Applied), saved drafts, reusable
answers.

**Application Tracker:** Saved, Applied, Interviewing, Offer, Rejected board;
deadlines with a due-soon banner, reminders, notes, interview time, status
history; add applications found elsewhere.

**Interview Preparation:** job-specific questions with mock interview and
answer scoring; a behavioral / technical / role-specific question bank with
timer, voice recording and saved answers; a per-interview planner (prep
schedule, checklist, research notes).

**Career Insights:** company context, pay, required skills, match, skill
gaps, role comparison, and a skill-demand snapshot across loaded jobs.

## Run
```bash
npm install
npm run dev         # start the app (http://localhost:5173)
npm test            # unit + interaction tests (offline: uses the sample jobs)
npm run test:live   # smoke test against the real job APIs
npm run typecheck   # JSDoc + TypeScript check of the whole app (TD-3)
npm run lint        # oxlint
npm run build       # production build
npm run format      # Prettier
```

## Project structure
```
src/
  api/          job sources (one adapter each), normalization, HTTP + caching,
                resume text extraction; sources/sample.js is the offline fallback
  app/          App, routes table (routes, nav and titles), app-level tests
  context/      AppProvider, JobsContext, domain hooks (applications, resume,
                hidden jobs) and migrations of data saved by earlier versions
  constants/    browser-storage keys
  data/         sample jobs, default profile/resume, question bank, skills list,
                statuses, templates, release plan
  hooks/        useJobs, useJobFilters, useJobOptions, useTracker, useResume, ...
  utils/        pure logic: matching, filtering, ATS, bullet checks, sanitizing
  components/   common/ building blocks, layout/, one folder per product area
                (prep/ and parts of resume/ and tracker/ come from final-sprint)
  pages/        one thin page per route, composed from components
  styles/       index.css imports the stylesheet parts in cascade order;
                ported.css styles the final-sprint components in Kai's design
  __tests__/    Prithvi's unit tests (other tests sit next to their modules)
```

Saved data lives in `localStorage` under the `getajob.*` keys in
`src/constants/storageKeys.js`. Don't rename existing keys: users' saved data
would be lost. Data saved by earlier versions (numeric sample-job ids, the old
application and resume shapes, and Prithvi's `jobfind.*` keys) is migrated
automatically (`src/context/migrations.js`, `legacyProfile.js`).

## Security
- **SEC-2:** resume uploads must be .pdf / .docx / .txt, at most 5 MB, and are
  identified by their bytes, not the file name. Files never leave the browser.
- **SEC-3:** third-party HTML (job descriptions) is sanitized with DOMPurify
  and rendered only through `<SafeHtml>`; links are limited to http(s).
- **SEC-4:** search input is cleaned and length-capped, filter values are
  whitelisted, API parameters are URL-encoded.

## Intentional technical debt for Sprint Review
- localStorage instead of authenticated backend/database storage
- No real authentication/authorization
- Live job APIs are called from the browser (no backend cache or rate limiting)
- Skills, work mode and pay for live jobs are inferred from free text
- Resume parsing, ATS and interview scoring are heuristic, not production AI
- Pay is shown as an hourly equivalent so internships and full-time roles compare
- No real reminder/notification service
- No end-to-end browser tests yet (unit and jsdom interaction tests only)
