import { useRef, useState } from "react";
import {
  MAX_RESUME_SIZE_MB,
  RESUME_ACCEPT,
  RESUME_EXTENSIONS,
  validateResumeFile,
} from "../../utils/fileValidation";
import { readResumeFile } from "../../services/resumeParser";

const countWords = (text) => (text.match(/\S+/g) || []).length;

function resultMessage(fileName, kind, text) {
  if (kind === "doc") {
    return `${fileName} attached. Older .doc files can't be read in the browser. Save it as .docx or PDF to use its text for matching.`;
  }
  if (!text) {
    return `${fileName} attached, but no selectable text was found (it may be a scanned image). Matching will use the builder fields below.`;
  }
  return `Loaded text from ${fileName} (${countWords(text)} words). It is now used for the ATS match.`;
}

// Attaches a resume after the SEC-2 type/size checks and extracts its text
// (.txt, .pdf, .docx) so matching and suggestions can use it.
export default function ResumeUpload({ fileName, rawText, setResume }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  const latestUpload = useRef(0);

  async function handleChange(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file after an error
    if (!file) return;

    const problem = validateResumeFile(file);
    setError(problem);
    setMessage("");
    if (problem) return;

    const upload = ++latestUpload.current;
    setReading(true);
    try {
      const { kind, text } = await readResumeFile(file);
      if (upload !== latestUpload.current) return; // a newer upload replaced this one
      // Always replace rawText so text from a previous file isn't matched against.
      setResume((c) => ({ ...c, fileName: file.name, rawText: text }));
      setMessage(resultMessage(file.name, kind, text));
    } catch {
      if (upload !== latestUpload.current) return;
      setResume((c) => ({ ...c, fileName: file.name, rawText: "" }));
      setError(
        `Couldn't read text from ${file.name}. The file may be damaged or password-protected. It is attached, but matching will use the builder fields below.`,
      );
    } finally {
      if (upload === latestUpload.current) setReading(false);
    }
  }

  return (
    <>
      <div className="upload-row">
        <label className="file-upload">
          Upload existing resume
          <input type="file" accept={RESUME_ACCEPT} onChange={handleChange} disabled={reading} />
        </label>
        <div className="upload-status" aria-live="polite">
          {reading ? "Reading resume…" : fileName ? `Attached: ${fileName}` : "No resume attached"}
          <span className="upload-hint">
            {RESUME_EXTENSIONS.join(", ")} · up to {MAX_RESUME_SIZE_MB} MB
          </span>
        </div>
      </div>
      {error && (
        <div className="error-box" role="alert">
          {error}
        </div>
      )}
      {message && <div className="info-box">{message}</div>}
      {rawText && (
        <details className="extracted-text">
          <summary>View extracted resume text</summary>
          <pre>{rawText}</pre>
        </details>
      )}
    </>
  );
}
