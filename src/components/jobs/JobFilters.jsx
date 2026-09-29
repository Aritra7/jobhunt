import React from 'react';
import SearchBar from './SearchBar';
import LocationFilter from './LocationFilter';
import { JOB_TYPES } from '../../api/jobModel';
import { REGIONS } from '../../hooks/useJobFilters';

/**
 * @param {{ filters: ReturnType<typeof import('../../hooks/useJobFilters').default>, hiddenCount: number }} props
 */
export default function JobFilters({ filters, hiddenCount }) {
  return (
    <div className="filters-panel">
      <div className="filters-section">
        <SearchBar searchTerm={filters.searchTerm} setSearchTerm={filters.setSearchTerm} />
        <select
          className="location-select"
          aria-label="Region"
          value={filters.region}
          onChange={(e) => filters.setRegion(e.target.value)}
        >
          {REGIONS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
        <LocationFilter
          locationFilter={filters.locationFilter}
          setLocationFilter={filters.setLocationFilter}
          options={filters.locations}
        />
        <select
          className="location-select"
          aria-label="Filter by job type"
          value={filters.jobType}
          onChange={(e) => filters.setJobType(e.target.value)}
        >
          <option value="">All job types</option>
          {JOB_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>
      <div className="filters-toggles">
        <label className="checkbox-label">
          <input type="checkbox" checked={filters.remoteOnly} onChange={(e) => filters.setRemoteOnly(e.target.checked)} />
          Remote only
        </label>
        {hiddenCount > 0 && (
          <label className="checkbox-label">
            <input type="checkbox" checked={filters.showHidden} onChange={(e) => filters.setShowHidden(e.target.checked)} />
            Show {hiddenCount} hidden
          </label>
        )}
        <button type="button" className="link-button" onClick={filters.resetFilters}>Clear filters</button>
      </div>
    </div>
  );
}
