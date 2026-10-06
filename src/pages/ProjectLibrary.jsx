import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useProjects } from "../hooks/useProjects";
import { useRouteTab } from "../hooks/useRouteTab";
import { PROJECT_TABS } from "../data/tabs";
import { emptyProject, toMarkdown } from "../utils/projectMarkdown";
import { downloadText } from "../utils/download";
import SectionCard from "../components/common/SectionCard";
import Tabs from "../components/common/Tabs";
import ProjectList from "../components/projects/ProjectList";
import ProjectEditor from "../components/projects/ProjectEditor";
import RolePhrasing from "../components/projects/RolePhrasing";
import MarkdownImport from "../components/projects/MarkdownImport";
import ResumeGenerator from "../components/projects/ResumeGenerator";

export default function ProjectLibrary() {
  const { resumeState, applications } = useApp();
  const library = useProjects();
  const { projects } = library;
  const [tab, setTab] = useRouteTab(PROJECT_TABS, "/projects");
  const [selectedId, setSelectedId] = useState(projects[0]?.id ?? null);
  const [importing, setImporting] = useState(false);
  const project = projects.find((p) => p.id === selectedId) || projects[0];
  const update = (patch) => library.updateProject(project.id, patch);

  function remove() {
    if (window.confirm(`Delete "${project.title}" from your projects?`)) {
      library.removeProject(project.id);
      setSelectedId(null);
    }
  }

  return (
    <SectionCard
      title="Projects & Tailored Resumes"
      badges={["V2"]}
      description="Keep a write-up of every project, phrase it for SDE, FDE, AI or MLE roles, and generate a resume tailored to the role and job."
    >
      <Tabs tabs={PROJECT_TABS} active={tab} onChange={setTab} label="Projects sections" />
      {tab === "library" && (
        <div className="project-layout">
          <div className="stack">
            <div className="inline-actions">
              <button
                className="btn btn-primary"
                onClick={() => setSelectedId(library.addProject(emptyProject()))}
              >
                + New project
              </button>
              <button className="btn btn-secondary" onClick={() => setImporting(true)}>
                Import .md
              </button>
            </div>
            {importing && (
              <MarkdownImport
                onImport={(p) => setSelectedId(library.addProject(p))}
                onClose={() => setImporting(false)}
              />
            )}
            <ProjectList projects={projects} selectedId={project?.id} onSelect={setSelectedId} />
          </div>
          {project && (
            <div className="stack" key={project.id}>
              <div className="inline-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => downloadText(`${project.id}.md`, toMarkdown(project))}
                >
                  Download .md
                </button>
                <button className="btn btn-ghost" onClick={remove}>
                  Delete project
                </button>
              </div>
              <h4>Project facts</h4>
              <ProjectEditor project={project} onChange={update} />
              <h4>Phrase it for a role</h4>
              <RolePhrasing project={project} onChange={update} />
            </div>
          )}
        </div>
      )}
      {tab === "generate" && (
        <ResumeGenerator
          projects={projects}
          resume={resumeState.resume}
          template={resumeState.template}
          applications={applications}
          variants={library.variants}
          onSaveVariant={library.saveVariant}
          onRemoveVariant={library.removeVariant}
        />
      )}
    </SectionCard>
  );
}
