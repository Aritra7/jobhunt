import { JOB_TYPES } from "../../api/jobModel";
import { WORK_MODES } from "../../data/jobs";
import { REGIONS, SPONSORSHIP_FILTERS } from "../../hooks/useJobFilters";
import { MAX_SEARCH_LENGTH } from "../../utils/sanitize";

export default function JobFilters({ filters, setFilter, locations }) {
  return (
    <>
      <div className="filters filters-five">
        <input
          value={filters.query}
          maxLength={MAX_SEARCH_LENGTH}
          onChange={(e) => setFilter("query", e.target.value)}
          placeholder="Search title, company, or skill..."
          aria-label="Search jobs"
        />
        <select
          aria-label="Location"
          value={filters.location}
          onChange={(e) => setFilter("location", e.target.value)}
        >
          <option value="all">All locations</option>
          {locations.map((location) => (
            <option key={location}>{location}</option>
          ))}
        </select>
        <select
          aria-label="Work mode"
          value={filters.mode}
          onChange={(e) => setFilter("mode", e.target.value)}
        >
          <option value="all">All work modes</option>
          {WORK_MODES.map((mode) => (
            <option key={mode}>{mode}</option>
          ))}
        </select>
        <input
          type="number"
          min="0"
          aria-label="Minimum hourly pay"
          value={filters.minSalary}
          onChange={(e) => setFilter("minSalary", e.target.value)}
          placeholder="Min $/hr"
        />
        <select
          aria-label="Sort by"
          value={filters.sort}
          onChange={(e) => setFilter("sort", e.target.value)}
        >
          <option value="recommended">Recommended</option>
          <option value="salary">Highest pay</option>
          <option value="company">Company A–Z</option>
        </select>
      </div>
      <div className="filters filters-secondary">
        <select
          aria-label="Region"
          value={filters.region}
          onChange={(e) => {
            setFilter("region", e.target.value);
            setFilter("location", "all");
          }}
        >
          {REGIONS.map((region) => (
            <option key={region.id} value={region.id}>
              {region.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Job type"
          value={filters.jobType}
          onChange={(e) => setFilter("jobType", e.target.value)}
        >
          <option value="">All job types</option>
          {JOB_TYPES.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
        <select
          aria-label="Visa sponsorship"
          value={filters.sponsorship}
          onChange={(e) => setFilter("sponsorship", e.target.value)}
        >
          {SPONSORSHIP_FILTERS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
