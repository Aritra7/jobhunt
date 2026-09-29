import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import Dashboard from "./pages/Dashboard";
import JobDiscovery from "./pages/JobDiscovery";
import ResumeProfile from "./pages/ResumeProfile";
import JobApplication from "./pages/JobApplication";
import ApplicationTracker from "./pages/ApplicationTracker";
import InterviewPrep from "./pages/InterviewPrep";
import CareerInsights from "./pages/CareerInsights";
import ReleasePlan from "./pages/ReleasePlan";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/jobs" element={<JobDiscovery />} />
        <Route path="/resume-profile" element={<ResumeProfile />} />
        <Route path="/apply" element={<JobApplication />} />
        <Route path="/tracker" element={<ApplicationTracker />} />
        <Route path="/interview" element={<InterviewPrep />} />
        <Route path="/insights" element={<CareerInsights />} />
        <Route path="/releases" element={<ReleasePlan />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
