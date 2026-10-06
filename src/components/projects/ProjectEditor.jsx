import ListInput from "../common/ListInput";
import LinesInput from "../common/LinesInput";

const TEXT_FIELDS = [
  ["title", "Title"],
  ["context", "Context (course, internship, personal…)"],
  ["dates", "Dates"],
  ["users", "Who used it"],
];

const LONG_FIELDS = [
  ["oneLiner", "One-liner", "e.g. a fault-tolerant key-value store replicated with Raft"],
  ["problem", "Problem / context", "What was wrong or missing, and for whom"],
  ["approach", "How it works", "Architecture, data flow, key design choices"],
  ["contribution", "My contribution", "Start with a verb: Built…, Owned…, Designed…"],
  ["impact", "Impact", "What changed because of it"],
];

// The facts of a project. Everything the phrasing drafts use comes from here,
// so no numbers or tools are ever made up.
export default function ProjectEditor({ project, onChange }) {
  const set = (key) => (e) => onChange({ [key]: e.target.value });

  return (
    <div className="stack">
      <div className="form-grid">
        {TEXT_FIELDS.map(([key, label]) => (
          <label key={key}>
            {label}
            <input value={project[key]} onChange={set(key)} />
          </label>
        ))}
      </div>
      {LONG_FIELDS.map(([key, label, placeholder]) => (
        <label key={key}>
          {label}
          <textarea value={project[key]} placeholder={placeholder} onChange={set(key)} />
        </label>
      ))}
      <div className="form-grid">
        <label>
          Tech
          <ListInput
            value={project.tech}
            onChange={(tech) => onChange({ tech })}
            placeholder="React, PostgreSQL, Go"
          />
        </label>
        <label>
          Domains
          <ListInput
            value={project.domains}
            onChange={(domains) => onChange({ domains })}
            placeholder="distributed-systems, llm"
          />
        </label>
        <label>
          Repo link
          <input
            value={project.links.repo}
            onChange={(e) => onChange({ links: { ...project.links, repo: e.target.value } })}
          />
        </label>
        <label>
          Demo link
          <input
            value={project.links.demo}
            onChange={(e) => onChange({ links: { ...project.links, demo: e.target.value } })}
          />
        </label>
      </div>
      <label>
        Measured results (one per line)
        <LinesInput
          value={project.metrics}
          placeholder="cut p95 latency from 120 ms to 40 ms"
          onChange={(metrics) => onChange({ metrics })}
        />
        <span className="form-hint">
          Only real numbers. Drafts use these as written and never invent new ones.
        </span>
      </label>
    </div>
  );
}
