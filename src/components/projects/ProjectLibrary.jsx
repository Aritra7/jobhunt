import { useState } from "react";
import { emptyProject, toMarkdown } from "../../utils/projectMarkdown";
import { downloadText } from "../../utils/download";
import ProjectList from "./ProjectList";
import ProjectEditor from "./ProjectEditor";
import RolePhrasing from "./RolePhrasing";
import MarkdownImport from "./MarkdownImport";

// The Projects tab: a write-up per project, phrased for each role family.
export default function ProjectLibrary({ library }) {
  const { projects } = library;
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
  );
}
