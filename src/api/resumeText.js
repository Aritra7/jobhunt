import { detectFileKind } from '../utils/fileSignature';

// Text extraction for uploaded resumes. Everything runs in the browser; the
// file is never uploaded anywhere. The PDF and Word libraries are loaded only
// when needed so they don't slow down the rest of the app.

const MAX_PAGES = 6;

/**
 * @param {Uint8Array} bytes
 * @returns {Promise<string>}
 */
async function pdfText(bytes) {
  const pdfjs = await import('pdfjs-dist');
  const { default: workerUrl } = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  // pdfjs-dist >= 4.2.67 is patched for CVE-2024-4367 (malicious-PDF code execution).
  const loadingTask = pdfjs.getDocument({ data: bytes });
  const pdf = await loadingTask.promise;

  /** @type {string[]} */
  const lines = [];
  for (let p = 1; p <= Math.min(pdf.numPages, MAX_PAGES); p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    let line = '';
    let lastY = null;
    let lastEnd = null;
    for (const item of content.items) {
      if (!('str' in item)) continue;
      const [, , , , x, y] = item.transform;
      const size = item.height || 10;
      if (lastY !== null && Math.abs(y - lastY) > size * 0.5) {
        if (line.trim()) lines.push(line);
        line = '';
        lastEnd = null;
      }
      if (lastEnd !== null && item.str) {
        const gap = x - lastEnd;
        // Big horizontal gaps separate columns (e.g. right-aligned dates).
        if (gap > size * 2) line += '   ';
        else if (gap > size * 0.15 && !line.endsWith(' ') && !item.str.startsWith(' ')) line += ' ';
      }
      line += item.str;
      lastY = y;
      lastEnd = x + (item.width || 0);
      if (item.hasEOL) {
        if (line.trim()) lines.push(line);
        line = '';
        lastEnd = null;
      }
    }
    if (line.trim()) lines.push(line);
  }
  await loadingTask.destroy();
  return lines.join('\n');
}

/**
 * Word -> HTML (keeps bullet lists) -> lines. The HTML is only parsed in an
 * inert DOMParser document, never rendered.
 * @param {ArrayBuffer} buffer
 * @returns {Promise<string>}
 */
async function docxText(buffer) {
  const mammoth = (await import('mammoth/mammoth.browser.js')).default;
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer: buffer });
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return [...doc.body.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6, td')]
    .filter(el => !el.querySelector('p, li'))
    .map(el => (el.tagName === 'LI' ? '• ' : '') + (el.textContent || '').trim())
    .filter(Boolean)
    .join('\n');
}

/**
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function extractResumeText(file) {
  // Plain-text resumes (supported by the getajob branch) are read as-is.
  if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) return file.text();
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const kind = detectFileKind(bytes);
  if (kind === 'pdf') return pdfText(bytes);
  if (kind === 'docx') return docxText(buffer);
  throw new Error("This file's contents aren't a real PDF or Word (.docx) document.");
}
