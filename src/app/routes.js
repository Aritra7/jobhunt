import Dashboard from "../pages/Dashboard";
import JobDiscovery from "../pages/JobDiscovery";
import ResumeProfile from "../pages/ResumeProfile";
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
    page: JobDiscovery,
    icon: "⌕",
    label: "Job Discovery",
    subtitle: "Find opportunities",
    title: "Job Discovery",
  },
  {
    path: "/resume-profile",
    page: ResumeProfile,
    icon: "R",
    label: "Resume & Profile",
    subtitle: "Build your materials",
    title: "Resume & Profile",
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
  return routes.find((route) => route.path === pathname)?.title || "Get a Job";
}
