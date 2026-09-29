import { WORK_MODES } from "../../data/jobs";

export default function JobFilters({ filters, setFilter, locations }) {
  return (
    <div className="filters filters-five">
      <input
        value={filters.query}
        onChange={(e) => setFilter("query", e.target.value)}
        placeholder="Search title, company, or skill..."
      />
      <select value={filters.location} onChange={(e) => setFilter("location", e.target.value)}>
        <option value="all">All locations</option>
        {locations.map((location) => (
          <option key={location}>{location}</option>
        ))}
      </select>
      <select value={filters.mode} onChange={(e) => setFilter("mode", e.target.value)}>
        <option value="all">All work modes</option>
        {WORK_MODES.map((mode) => (
          <option key={mode}>{mode}</option>
        ))}
      </select>
      <input
        type="number"
        min="0"
        value={filters.minSalary}
        onChange={(e) => setFilter("minSalary", e.target.value)}
        placeholder="Min $/hr"
      />
      <select value={filters.sort} onChange={(e) => setFilter("sort", e.target.value)}>
        <option value="recommended">Recommended</option>
        <option value="salary">Highest pay</option>
        <option value="company">Company A–Z</option>
      </select>
    </div>
  );
}
