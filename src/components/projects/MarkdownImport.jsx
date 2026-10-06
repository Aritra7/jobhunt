import { useState } from "react";
import { fromMarkdown } from "../../utils/projectMarkdown";

const MAX_FILE_BYTES = 200 * 1024; // project write-ups are small text files

// Import project write-ups kept as markdown files (one per project), by
// choosing files or pasting the text.
export default function MarkdownImport({ onImport, onClose }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  function importText(markdown, source) {
    try {
      onImport(fromMarkdown(markdown));
      return "";
    } catch (err) {
      return `${source}: ${err.message}`;
    }
  }

  async function handleFiles(e) {
    const files = [...(e.target.files || [])];
    e.target.value = "";
    const problems = [];
    for (const file of files) {
      if (!file.name.toLowerCase().endsWith(".md") || file.size > MAX_FILE_BYTES) {
        problems.push(`${file.name}: choose a .md file under 200 KB.`);
        continue;
      }
      const problem = importText(await file.text(), file.name);
      if (problem) problems.push(problem);
    }
    setError(problems.join(" "));
    if (problems.length === 0) onClose();
  }

  function importPasted() {
    const problem = importText(text, "Pasted text");
    setError(problem);
    if (!problem) onClose();
  }

  return (
    <div className="panel">
      <h3>Import project markdown</h3>
      <label className="file-upload">
        Choose .md files
        <input type="file" accept=".md,text/markdown" multiple onChange={handleFiles} />
      </label>
      <label>
        …or paste one file
        <textarea
          rows={6}
          value={text}
          placeholder={"---\ntitle: My project\ntech: [Python]\n---\n\n## One-liner\n..."}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      {error && (
        <div className="error-box" role="alert">
          {error}
        </div>
      )}
      <div className="inline-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={importPasted}
          disabled={!text.trim()}
        >
          Import pasted text
        </button>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
