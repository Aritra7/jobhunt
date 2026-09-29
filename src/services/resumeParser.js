// Extracts plain text from uploaded resumes in the browser so the ATS match and
// suggestions can use it. PDF (pdf.js) and DOCX (mammoth) libraries are loaded
// on demand, so they don't add to the initial bundle.

// Keeps localStorage well under its quota; far longer than any real resume.
export const MAX_RESUME_TEXT_LENGTH = 20000;
export const MAX_PDF_PAGES = 20;

export function normalizeText(text) {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, MAX_RESUME_TEXT_LENGTH);
}

export function resumeKind(file) {
  const name = file.name.toLowerCase();
  if (file.type.startsWith("text/") || name.endsWith(".txt")) return "txt";
  if (file.type === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (name.endsWith(".docx") || file.type.includes("wordprocessingml")) return "docx";
  if (name.endsWith(".doc") || file.type === "application/msword") return "doc";
  return "unknown";
}

let pdfjsPromise;
function loadPdfjs() {
  pdfjsPromise ??= Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]).then(([pdfjs, worker]) => {
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    return pdfjs;
  });
  return pdfjsPromise;
}

export async function extractPdfText(data, pdfjs) {
  const lib = pdfjs || (await loadPdfjs());
  // Only text is needed, so font-loading warnings are silenced.
  const task = lib.getDocument({
    data: new Uint8Array(data),
    verbosity: lib.VerbosityLevel.ERRORS,
  });
  try {
    const pdf = await task.promise;
    const pages = [];
    for (let n = 1; n <= Math.min(pdf.numPages, MAX_PDF_PAGES); n++) {
      const content = await (await pdf.getPage(n)).getTextContent();
      // hasEOL marks the end of a visual line.
      pages.push(content.items.map((item) => item.str + (item.hasEOL ? "\n" : "")).join(""));
    }
    return normalizeText(pages.join("\n\n"));
  } finally {
    task.destroy();
  }
}

export async function extractDocxText(data) {
  const mammoth = await import("mammoth");
  // The browser build of mammoth reads `arrayBuffer`; the Node build (used by
  // the tests) only reads `buffer`.
  const input = globalThis.Buffer
    ? { arrayBuffer: data, buffer: globalThis.Buffer.from(data) }
    : { arrayBuffer: data };
  const { value } = await (mammoth.default || mammoth).extractRawText(input);
  return normalizeText(value);
}

// Returns { kind, text }. `text` is "" for formats that can't be read here
// (legacy .doc). Throws if a PDF/DOCX is corrupt or can't be parsed.
export async function readResumeFile(file) {
  const kind = resumeKind(file);
  if (kind === "txt") return { kind, text: normalizeText(await file.text()) };
  if (kind === "pdf") return { kind, text: await extractPdfText(await file.arrayBuffer()) };
  if (kind === "docx") return { kind, text: await extractDocxText(await file.arrayBuffer()) };
  return { kind, text: "" };
}
