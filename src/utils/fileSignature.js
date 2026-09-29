/**
 * Identifies a file by its first bytes ("magic number") instead of trusting
 * its name or the browser-reported MIME type, which are easy to fake.
 * @param {Uint8Array} bytes
 * @returns {'pdf' | 'docx' | 'unknown'}
 */
export function detectFileKind(bytes) {
  const starts = (/** @type {number[]} */ sig) => sig.every((b, i) => bytes[i] === b);
  if (starts([0x25, 0x50, 0x44, 0x46, 0x2d])) return 'pdf'; // "%PDF-"
  // .docx is a ZIP ("PK\x03\x04") containing word/document.xml.
  if (starts([0x50, 0x4b, 0x03, 0x04])) {
    const head = new TextDecoder('latin1').decode(bytes.subarray(0, Math.min(bytes.length, 64 * 1024)));
    if (head.includes('word/')) return 'docx';
  }
  return 'unknown';
}
