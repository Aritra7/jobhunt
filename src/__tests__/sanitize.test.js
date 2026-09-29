import { describe, it, expect } from 'vitest';
import { sanitizeHtml, htmlToText, safeUrl, sanitizeSearchInput, cleanText, pickAllowed } from '../utils/sanitize';

describe('sanitizeHtml (SEC-3)', () => {
  it('strips scripts, event handlers and javascript: links', () => {
    const dirty = '<p onclick="steal()">Hi<script>alert(1)</script><img src=x onerror=alert(1)><a href="javascript:alert(1)">x</a></p>';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toMatch(/script|onclick|onerror|javascript:|<img/i);
    expect(clean).toContain('Hi');
  });

  it('keeps formatting and makes links open safely in a new tab', () => {
    const clean = sanitizeHtml('<ul><li><strong>React</strong></li></ul><a href="https://example.com">apply</a>');
    expect(clean).toContain('<strong>React</strong>');
    expect(clean).toContain('target="_blank"');
    expect(clean).toContain('rel="noopener noreferrer nofollow"');
  });

  it('drops iframes, styles and forms', () => {
    const clean = sanitizeHtml('<iframe src="https://evil"></iframe><style>*{}</style><form><input></form>ok');
    expect(clean).toBe('ok');
  });
});

describe('htmlToText', () => {
  it('converts HTML to readable text with line breaks and decoded entities', () => {
    expect(htmlToText('<p>One &amp; two</p><p>Three</p>')).toBe('One & two\nThree');
  });
});

describe('safeUrl', () => {
  it('allows http(s) only', () => {
    expect(safeUrl('https://remotive.com/job/1')).toBe('https://remotive.com/job/1');
    expect(safeUrl('javascript:alert(1)')).toBeNull();
    expect(safeUrl('data:text/html,<script>')).toBeNull();
    expect(safeUrl('not a url')).toBeNull();
    expect(safeUrl('')).toBeNull();
  });
});

describe('search input (SEC-4)', () => {
  it('removes angle brackets and control characters, collapses whitespace, caps length', () => {
    expect(sanitizeSearchInput("react<script>  dev\u0000\n'; DROP TABLE jobs;--")).toBe("reactscript dev '; DROP TABLE jobs;--");
    expect(sanitizeSearchInput('a'.repeat(500))).toHaveLength(100);
  });

  it('cleanText keeps newlines but strips control characters', () => {
    expect(cleanText('line1\nline2\u0007', 100)).toBe('line1\nline2');
  });

  it('pickAllowed whitelists filter values', () => {
    expect(pickAllowed('Full time', ['Full time', 'Contract'], '')).toBe('Full time');
    expect(pickAllowed("' OR 1=1 --", ['Full time', 'Contract'], '')).toBe('');
  });
});
