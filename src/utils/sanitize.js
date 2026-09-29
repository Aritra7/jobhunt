import DOMPurify from 'dompurify';

// Every piece of third-party HTML in the app goes through sanitizeHtml, and the
// only place it is rendered is <SafeHtml>. Everything else is rendered as React
// text, which React escapes automatically.

const ALLOWED_TAGS = [
  'p', 'br', 'b', 'strong', 'i', 'em', 'u', 'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'span', 'div', 'blockquote',
];
const ALLOWED_ATTR = ['href'];

// Links inside job descriptions open in a new tab and can't reach window.opener.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer nofollow');
  }
});

/** @param {string | null | undefined} html */
export function sanitizeHtml(html) {
  return DOMPurify.sanitize(html || '', { ALLOWED_TAGS, ALLOWED_ATTR });
}

/**
 * Converts HTML to plain text without executing or loading anything
 * (DOMParser documents are inert).
 * @param {string | null | undefined} html
 */
export function htmlToText(html) {
  if (!html) return '';
  const withBreaks = html.replace(/<\/(p|li|h[1-6]|div)>|<br\s*\/?>/gi, '$&\n');
  const doc = new DOMParser().parseFromString(withBreaks, 'text/html');
  return (doc.body.textContent || '')
    .replace(/[ \t ]+/g, ' ')
    .replace(/\n\s*\n\s*(\n\s*)+/g, '\n\n')
    .trim();
}

/**
 * Returns the URL only if it is http(s); blocks javascript:, data: and friends.
 * @param {string | null | undefined} url
 * @returns {string | null}
 */
export function safeUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(String(url).trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : null;
  } catch {
    return null;
  }
}

// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/**
 * Normalizes free-text user input: strips control characters and caps length.
 * Keeps newlines so it is safe for textareas too.
 * @param {unknown} value
 * @param {number} maxLength
 */
export function cleanText(value, maxLength = 500) {
  return String(value ?? '').replace(CONTROL_CHARS, '').slice(0, maxLength);
}

export const MAX_SEARCH_LENGTH = 100;

/**
 * Search box input: single line, no angle brackets, collapsed whitespace, capped.
 * Search terms are only ever compared in memory or URL-encoded - never
 * concatenated into a query string - so this is defense in depth (SEC-4).
 * @param {unknown} value
 */
export function sanitizeSearchInput(value) {
  return cleanText(value, MAX_SEARCH_LENGTH)
    .replace(/[\r\n]+/g, ' ')
    .replace(/[<>]/g, '')
    .replace(/\s{2,}/g, ' ');
}

/**
 * Whitelists a filter value against the allowed options.
 * @template T
 * @param {unknown} value
 * @param {readonly T[]} allowed
 * @param {T} fallback
 * @returns {T}
 */
export function pickAllowed(value, allowed, fallback) {
  return allowed.includes(/** @type {T} */ (value)) ? /** @type {T} */ (value) : fallback;
}
