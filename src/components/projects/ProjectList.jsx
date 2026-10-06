import FitBadges from "./FitBadges";

export default function ProjectList({ projects, selectedId, onSelect }) {
  return (
    <div className="project-list">
      {projects.map((project) => (
        <button
          type="button"
          key={project.id}
          className={`project-item${project.id === selectedId ? " selected" : ""}`}
          aria-pressed={project.id === selectedId}
          onClick={() => onSelect(project.id)}
        >
          <strong>{project.title}</strong>
          <span className="muted">{project.oneLiner || "No one-liner yet"}</span>
          <FitBadges project={project} />
        </button>
      ))}
      {projects.length === 0 && <p className="muted">No projects yet. Add or import one.</p>}
    </div>
  );
}
