// SEC-2: resume uploads are limited by type and size before we read them.
export const MAX_RESUME_SIZE_MB = 5;
export const MAX_RESUME_SIZE_BYTES = MAX_RESUME_SIZE_MB * 1024 * 1024;
export const RESUME_EXTENSIONS = [".txt", ".pdf", ".doc", ".docx"];
export const RESUME_MIME_TYPES = [
  "text/plain",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
export const RESUME_ACCEPT = [...RESUME_EXTENSIONS, ...RESUME_MIME_TYPES].join(",");

// Returns an error message, or "" when the file is acceptable.
export function validateResumeFile(file) {
  const name = file.name.toLowerCase();
  const validType =
    RESUME_MIME_TYPES.includes(file.type) || RESUME_EXTENSIONS.some((ext) => name.endsWith(ext));
  if (!validType) {
    return `Invalid file type. Please upload a ${RESUME_EXTENSIONS.join(", ")} file.`;
  }
  if (file.size > MAX_RESUME_SIZE_BYTES) {
    return `File is too large. Maximum size is ${MAX_RESUME_SIZE_MB} MB.`;
  }
  return "";
}
