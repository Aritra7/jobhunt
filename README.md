# Get a Job — Full Product Prototype

React + Vite prototype aligned to the Agile Methods feature decomposition.

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
Job Discovery: search, location/work-mode/salary filters, details, company overview, save/hide, preferences, skill matching, recommendations.

Resume & Profile: profile editor, resume upload, builder, match score, ATS-style score, skill gaps, optimization suggestions.

Job Application: select job, autofill, screening questions, review/submit, saved drafts, reusable answers.

Application Tracker: Saved, Applied, Interview, Offer, Rejected, deadlines, reminders, notes.

Interview Preparation: common/behavioral/technical/job-specific questions, mock interview, answer scoring, feedback, practice history.

Career Insights: company overview, salary, required skills, match, skill gaps, role comparison, skill-demand snapshot.

## Run
```bash
npm install
npm run dev
```

## Intentional technical debt for Sprint Review
- Mock job data instead of live job APIs
- localStorage instead of authenticated backend/database storage
- No real authentication/authorization
- PDF/DOCX resume parsing not implemented
- Resume/interview scoring is heuristic, not production AI
- No automated test suite yet
- No real reminder/notification service
