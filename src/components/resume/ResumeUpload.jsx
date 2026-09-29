import { useState } from "react";

function isTextFile(file) {
  return file.type.startsWith("text/") || file.name.endsWith(".txt");
}

// Attaches a resume file. Text files are read so matching can use their
// contents; PDF/DOCX parsing is a future backend integration.
export default function ResumeUpload({ fileName, setResume }) {
  const [message, setMessage] = useState("");

  function handleChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

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
          <input type="file" accept=".txt,.pdf,.doc,.docx" onChange={handleChange} />
        </label>
        <div className="upload-status">
          {fileName ? `Attached: ${fileName}` : "No resume attached"}
        </div>
      </div>
      {message && <div className="info-box">{message}</div>}
    </>
  );
}
