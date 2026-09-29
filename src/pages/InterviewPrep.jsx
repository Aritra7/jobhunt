import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useRouteTab } from "../hooks/useRouteTab";
import { PREP_TABS } from "../data/tabs";
import SectionCard from "../components/common/SectionCard";
import Tabs from "../components/common/Tabs";
import JobQuestions from "../components/interview/JobQuestions";
import PracticeHistory from "../components/interview/PracticeHistory";
import PracticeSession from "../components/prep/PracticeSession";
import InterviewPlanner from "../components/prep/InterviewPlanner";

export default function InterviewPrep() {
  const app = useApp();
  const { interviewHistory } = app;
  const [tab, setTab] = useRouteTab(PREP_TABS, "/interview");
  const [mockMode, setMockMode] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <SectionCard
        title="Interview Practice"
        badges={["V1", "V2"]}
        description="Practice questions for a specific job or from the question bank (with a timer and voice recording), then plan the days before each interview."
        actions={
          tab === "job" && (
            <button
              className={`btn ${mockMode ? "btn-success" : "btn-soft"}`}
              onClick={() => setMockMode((v) => !v)}
            >
              {mockMode ? "Exit mock interview" : "Start mock interview"}
            </button>
          )
        }
      >
        <Tabs tabs={PREP_TABS} active={tab} onChange={setTab} label="Interview prep sections" />
        {tab === "job" && <JobQuestions mockMode={mockMode} />}
        {tab === "practice" && <PracticeSession />}
        {tab === "planner" && (
          <InterviewPlanner tracker={app} onFindJobs={() => navigate("/jobs")} />
        )}
      </SectionCard>
      {tab === "job" && <PracticeHistory history={interviewHistory} />}
    </>
  );
}
