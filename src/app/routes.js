import Dashboard from "../pages/Dashboard";
import JobDiscovery from "../pages/JobDiscovery";
import ResumeProfile from "../pages/ResumeProfile";
import ProjectLibrary from "../pages/ProjectLibrary";
import JobApplication from "../pages/JobApplication";
import ApplicationTracker from "../pages/ApplicationTracker";
import InterviewPrep from "../pages/InterviewPrep";
import CareerInsights from "../pages/CareerInsights";
import ReleasePlan from "../pages/ReleasePlan";

// Single source for routing, the sidebar nav and the topbar title.
export const routes = [
  {
    path: "/",
    page: Dashboard,
    icon: "⌂",
    label: "Dashboard",
    subtitle: "Your workspace",
    title: "Dashboard",
  },
  {
    path: "/jobs",
    param: "jobId", // /jobs/:jobId opens a job's details
    page: JobDiscovery,
    icon: "⌕",
    label: "Job Discovery",
    subtitle: "Find opportunities",
    title: "Job Discovery",
  },
  {
    path: "/resume-profile",
    param: "tab",
    page: ResumeProfile,
    icon: "R",
    label: "Resume & Profile",
    subtitle: "Build your materials",
    title: "Resume & Profile",
  },
  {
    path: "/projects",
    param: "tab",
    page: ProjectLibrary,
    icon: "P",
    label: "Projects",
    subtitle: "Phrase & tailor resumes",
    title: "Projects & Tailored Resumes",
  },
  {
    path: "/apply",
    page: JobApplication,
    icon: "A",
    label: "Job Application",
    subtitle: "Apply faster",
    title: "Job Application",
  },
  {
    path: "/tracker",
    page: ApplicationTracker,
    icon: "T",
    label: "Application Tracker",
    subtitle: "Track progress",
    title: "Application Tracker",
  },
  {
    path: "/interview",
    param: "tab",
    page: InterviewPrep,
    icon: "I",
    label: "Interview Prep",
    subtitle: "Practice smarter",
    title: "Interview Preparation",
  },
  {
    path: "/insights",
    page: CareerInsights,
    icon: "C",
    label: "Career Insights",
    subtitle: "Understand the role",
    title: "Career Insights",
  },
  {
    path: "/releases",
    page: ReleasePlan,
    icon: "V",
    label: "V1 / V2 Plan",
    subtitle: "Release strategy",
    title: "V1 / V2 Release Plan",
  },
];

export function titleForPath(pathname) {
  const route = routes.find(
    ({ path }) => pathname === path || (path !== "/" && pathname.startsWith(`${path}/`)),
  );
  return route?.title || "Get a Job";
}
