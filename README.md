# JobFind

A job-search companion: find real jobs, track applications, prepare for interviews, and tailor your resume — all in the browser, no account needed.

## Features

| Area | What it does |
|---|---|
| **Jobs** | Live listings from ~30 US company career pages (Greenhouse), Jobicy, The Muse, Remotive and Arbeitnow, merged and de-duplicated. Region (US by default), keyword, location, job type and remote filters. Save or hide jobs. |
| **Recommendations** | Jobs ranked against your saved preferences (target roles, location, work mode, job types). "Use saved profile" fills the filters in one click. |
| **Job detail** | Full description, apply link, company profile (The Muse), other open roles at the company, and research links. |
| **Tracker** | Every saved job with status (Saved → Applied → Interviewing → Offer / Rejected), deadlines with due-soon alerts, notes, and a status history. Add jobs found elsewhere. |
| **Interview Prep** | Behavioral, technical and role-specific question bank with a timer, voice recording and saved written answers. Per-interview planner with a day-by-day prep schedule, checklist and company research notes. |
| **Resume** | Resume builder with three templates and print-to-PDF, ATS keyword score against any saved job, bullet-point checker, cover-letter draft, and an autofill kit for application forms. |

All user data (preferences, tracker, resume, practice answers) is stored in the browser's `localStorage`. Every screen, job and tab has its own URL (`#/jobs/<id>`, `#/resume/ats`, …), so the browser's back/forward buttons and trackpad swipes move within the app.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script | Purpose |
|---|---|
| `npm run build` | Production build |
| `npm test` | Unit tests (Vitest) |
| `npm run typecheck` | Checks component props and types (JSDoc + TypeScript) |
| `npm run lint` | Oxlint |

## Job data sources

| Source | Notes |
|---|---|
| [Greenhouse](https://developers.greenhouse.io/job-board.html) | Public job boards of US companies (Stripe, Airbnb, Figma, Databricks, …; list in `src/api/sources/greenhouse.js`). Lists load up front; each description loads when the job is opened or tracked. |
| [Jobicy](https://jobicy.com) | Free, keyless remote jobs open to US candidates, often with salary. Cached for 1 hour. |
| [Arbeitnow](https://www.arbeitnow.com) | Free, keyless, updated hourly. Mostly Europe + remote. |
| [Remotive](https://remotive.com) | Free, keyless, remote-only, often lists salary. Cached for 6 hours to respect its ~4 requests/day guideline. |
| [The Muse](https://www.themuse.com) | Free, keyless, US-focused. Also used for company profiles. |

Each source is one adapter in `src/api/sources/` that returns the shared `Job` shape (`src/types.js`). To add a source, write an adapter and register it in `src/api/jobsApi.js`. If a source is down, the others still load and the UI shows a warning. Every listing links back to its source, as the sources' terms require.

## Security

- **XSS:** third-party HTML (job descriptions) is sanitized with DOMPurify and rendered only through `<SafeHtml>`. Everything else is rendered as React text. Links are restricted to `http(s)`.
- **Input handling:** search input is length-capped and stripped of control characters and angle brackets, and filter values are whitelisted. Queries are never built by string concatenation, and API parameters are URL-encoded.
- **Uploads:** resume uploads are limited to `.pdf`/`.docx` and 5 MB (client-side; a server-side check is needed once there is a backend).

## Project structure

```
src/
  api/          job sources, normalization, HTTP + caching
  components/   jobs/ preferences/ tracker/ prep/ resume/ common/
  data/         question bank, skills dictionary, statuses, templates
  hooks/        state + localStorage persistence
  utils/        sanitize, matching, ATS scoring, bullet checks, formatting
  __tests__/    unit tests
```
