import { useApp } from "../context/AppContext";
import { useProjects } from "../hooks/useProjects";
import { useRouteTab } from "../hooks/useRouteTab";
import { APPLY_TABS } from "../data/tabs";
import SectionCard from "../components/common/SectionCard";
import Tabs from "../components/common/Tabs";
import ApplicationWizard from "../components/application/ApplicationWizard";
import AnswerBank from "../components/application/AnswerBank";

export default function JobApplication() {
  const { reusableAnswers, setReusableAnswers } = useApp();
  const { projects } = useProjects();
  const [tab, setTab] = useRouteTab(APPLY_TABS, "/apply");

  return (
    <SectionCard
      title="Guided Job Application"
      badges={["V1", "V2"]}
      description="V1 handles the submission flow. V2 adds saved drafts and an answer bank reused across applications."
    >
      <Tabs tabs={APPLY_TABS} active={tab} onChange={setTab} label="Application sections" />
      {tab === "guided" && <ApplicationWizard projects={projects} />}
      {tab === "answers" && <AnswerBank bank={reusableAnswers} setBank={setReusableAnswers} />}
    </SectionCard>
  );
}
