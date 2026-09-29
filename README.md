# Get a Job — Full Product Prototype

React + Vite prototype aligned to the Agile Methods feature decomposition. It
combines Kai's full-product prototype with the Sprint 3 features from the
earlier JobFind app on `main` (preferences, keyword matching, SEC-2 upload
checks, resume templates and its job dataset).

## Product areas
- Job Discovery
- Resume & Profile
- Job Application
- Application Tracker
- Interview Preparation
- Career Insights
- Dashboard
- V1 / V2 Release Plan

## Feature coverage
**Job Discovery:** search across title, company, skills, description and requirements;
location, work-mode and pay filters; sorting; details drawer with company overview;
save / hide / restore; saved preferences (keywords, locations, work modes, minimum pay);
"Matched for you" with "Use saved profile"; skill match and recommendations.

**Resume & Profile:** profile editor, resume upload (.txt/.pdf/.doc/.docx up to 5 MB,
SEC-2) with in-browser text extraction from .txt, .pdf and .docx that feeds the ATS
match (older .doc files are attached only), resume builder with Modern / Classic / Creative templates, ATS-style score,
skill gaps and optimization suggestions.

**Job Application:** select job, autofill, screening questions, review/submit, saved
drafts, reusable answers.

**Application Tracker:** Saved, Applied, Interview, Offer, Rejected, deadlines,
reminders, notes.

**Interview Preparation:** common/behavioral/technical/job-specific questions, mock
interview, answer scoring, feedback, practice history.

**Career Insights:** company overview, salary, required skills, match, skill gaps,
role comparison, skill-demand snapshot.

## Run
```bash
npm install
npm run dev       # start the app
npm test          # unit + interaction tests (Vitest)
npm run lint      # oxlint
npm run build     # production build
npm run format    # Prettier
```

## Project structure
```
src/
  app/          App, routes table (routes, nav and titles), app-level tests
  context/      AppProvider + domain hooks (job lists, applications), legacy migration
  constants/    browser-storage keys
  data/         mock jobs (internships + full-time), default profile, releases, templates
  hooks/        useJobs, useJobFilters, useApplicationWizard, useLocalStorage, ...
  services/     mock job service
  utils/        pure logic: scoring, matching, filtering, validation (unit tested)
  components/   common/ building blocks, layout/, and one folder per product area
  pages/        one thin page per route, composed from components
  styles/       index.css imports the stylesheet parts in cascade order
```
Saved data lives in `localStorage` under the `getajob.*` keys in
`src/constants/storageKeys.js`. Don't rename existing keys: users' saved data
would be lost. Preferences saved by the old JobFind app (`jobfind.profile`) are
migrated automatically.

## Intentional technical debt for Sprint Review
- Mock job data instead of live job APIs
- localStorage instead of authenticated backend/database storage
- No real authentication/authorization
- Resume text is extracted but not structured: fields like skills and experience are not
  auto-filled from the file; legacy .doc and scanned (image-only) PDFs can't be read
- Resume/interview scoring and keyword matching are heuristic, not production AI
- Full-time roles show an hourly-equivalent pay so they compare with internships
- No real reminder/notification service
- No end-to-end browser tests yet (unit and jsdom interaction tests only)
