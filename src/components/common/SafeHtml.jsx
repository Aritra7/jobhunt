import React, { useMemo } from 'react';
import { sanitizeHtml } from '../../utils/sanitize';

/**
 * The ONLY place the app renders third-party HTML. Always sanitized first (SEC-3).
 * @param {{ html: string, className?: string }} props
 */
export default function SafeHtml({ html, className }) {
  const clean = useMemo(() => sanitizeHtml(html), [html]);
  return <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}
