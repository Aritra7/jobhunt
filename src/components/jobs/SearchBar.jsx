import React from 'react';
import { MAX_SEARCH_LENGTH } from '../../utils/sanitize';

/**
 * @param {{ searchTerm: string, setSearchTerm: (value: string) => void }} props
 */
export default function SearchBar({ searchTerm, setSearchTerm }) {
  return (
    <div className="search-bar-container">
      <input
        type="search"
        className="search-input"
        placeholder="Search by title, company, skill or keyword..."
        aria-label="Search jobs"
        maxLength={MAX_SEARCH_LENGTH}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
}
