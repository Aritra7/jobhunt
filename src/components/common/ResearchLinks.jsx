import React from 'react';
import { researchLinks } from '../../utils/researchLinks';

/**
 * Quick links for researching a company before applying or interviewing.
 * @param {{ company: string }} props
 */
export default function ResearchLinks({ company }) {
  return (
    <div className="research-links">
      {researchLinks(company).map(link => (
        <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="chip-link">
          {link.label} ↗
        </a>
      ))}
    </div>
  );
}
