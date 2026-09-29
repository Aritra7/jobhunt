import React from 'react';

/**
 * @param {{ locationFilter: string, setLocationFilter: (value: string) => void, options: string[] }} props
 */
export default function LocationFilter({ locationFilter, setLocationFilter, options }) {
  return (
    <div className="location-filter-container">
      <select
        className="location-select"
        aria-label="Filter by location"
        value={locationFilter}
        onChange={(e) => setLocationFilter(e.target.value)}
      >
        <option value="">All locations</option>
        {options.map(location => (
          <option key={location} value={location}>{location}</option>
        ))}
      </select>
    </div>
  );
}
