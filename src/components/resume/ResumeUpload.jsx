import React, { useState } from 'react';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function ResumeUpload() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setError('');
    const file = e.target.files[0];
    
    if (!file) return;

    // Check extension
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const validExtensions = ['.pdf', '.docx'];
    
    const isValidType = validTypes.includes(file.type) || 
      validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!isValidType) {
      setError('Invalid file type. Please upload a .pdf or .docx file.');
      setUploadedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB} MB.`);
      setUploadedFile(null);
      return;
    }

    setUploadedFile(file);
  };

  return (
    <div className="resume-upload-section">
      <h3>Upload Existing Resume</h3>
      <div className="upload-container">
        <input 
          type="file" 
          id="resume-upload" 
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
          onChange={handleFileChange} 
          className="file-input"
        />
        <label htmlFor="resume-upload" className="upload-button">
          Choose File
        </label>
        <p className="upload-hint">.pdf or .docx, up to {MAX_FILE_SIZE_MB} MB</p>
      </div>

      {error && <div className="error-message">❌ {error}</div>}
      
      {uploadedFile && (
        <div className="success-message">
          ✅ Resume uploaded: {uploadedFile.name}
        </div>
      )}
    </div>
  );
}
