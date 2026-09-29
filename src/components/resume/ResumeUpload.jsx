import { useState } from "react";
import {
  MAX_RESUME_SIZE_MB,
  RESUME_ACCEPT,
  RESUME_EXTENSIONS,
  validateResumeFile,
} from "../../utils/fileValidation";

function isTextFile(file) {
  return file.type.startsWith("text/") || file.name.endsWith(".txt");
}

// Attaches a resume file after the SEC-2 type/size checks. Text files are read
// so matching can use their contents; PDF/DOCX parsing is a future backend
// integration.
export default function ResumeUpload({ fileName, setResume }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleChange(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file after an error
    if (!file) return;

    const problem = validateResumeFile(file);
    setError(problem);
    setMessage("");
    if (problem) return;

    if (isTextFile(file)) {
      const reader = new FileReader();
      reader.onload = () => {
        setResume((c) => ({ ...c, fileName: file.name, rawText: String(reader.result || "") }));
        setMessage(`Loaded text from ${file.name}`);
      };
      reader.readAsText(file);
    } else {
      setResume((c) => ({ ...c, fileName: file.name }));
      setMessage(`${file.name} attached. PDF/DOCX parsing would be a later backend integration.`);
    }
  }

  return (
    <>
      <div className="upload-row">
        <label className="file-upload">
          Upload existing resume
          <input type="file" accept={RESUME_ACCEPT} onChange={handleChange} />
        </label>
        <div className="upload-status">
          {fileName ? `Attached: ${fileName}` : "No resume attached"}
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
    </>
  );
}
