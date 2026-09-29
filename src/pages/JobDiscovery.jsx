import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { fetchJobs } from "../services/jobService";
import { filterJobs, recommendationScore } from "../utils/jobUtils";
import JobCard from "../components/JobCard";
import JobDetailsDrawer from "../components/JobDetailsDrawer";
import FeatureBadge from "../components/FeatureBadge";
export default function JobDiscovery() {
  const nav = useNavigate();
  const { profile, setProfile, savedSet, hiddenSet, toggleSaved, toggleHidden } = useApp();
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [filters, setFilters] = useState({
    query: "",
    location: "all",
    mode: "all",
    minSalary: 0,
    sort: "recommended",
  });
  useEffect(() => {
    fetchJobs().then((d) => {
      setAllJobs(d);
      setLoading(false);
    });
  }, []);
  const visible = useMemo(() => allJobs.filter((j) => !hiddenSet.has(j.id)), [allJobs, hiddenSet]);
  const locations = useMemo(() => [...new Set(allJobs.map((j) => j.location))].sort(), [allJobs]);
  const filtered = useMemo(() => {
    const r = filterJobs(visible, filters);
    return [...r].sort((a, b) =>
      filters.sort === "company"
        ? a.company.localeCompare(b.company)
        : filters.sort === "salary"
          ? b.salaryMax - a.salaryMax
          : recommendationScore(b, profile) - recommendationScore(a, profile),
    );
  }, [visible, filters, profile]);
  function u(k, v) {
    setFilters((c) => ({ ...c, [k]: v }));
  }
  function apply(id) {
    sessionStorage.setItem("getajob.selectedJob", String(id));
    nav("/apply");
  }
  return (
    <>
      <section className="card">
        <div className="card-header">
          <div>
            <div className="title-with-badge">
              <h3>Find opportunities</h3>
              <FeatureBadge release="V1" />
            </div>
            <p>
              Search, filter, compare fit, inspect company context, save jobs, or hide irrelevant
              ones.
            </p>
          </div>
          <button className="btn btn-soft" onClick={() => setShowPreferences((v) => !v)}>
            Job preferences <FeatureBadge release="V2" />
          </button>
        </div>
        {showPreferences && (
          <div className="preference-panel">
            <label>
              Minimum hourly pay
              <input
                type="number"
                value={profile.minSalary}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, minSalary: Number(e.target.value || 0) }))
                }
              />
            </label>
            <label>
              Preferred work modes
              <input
                value={profile.preferredModes.join(", ")}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    preferredModes: e.target.value
                      .split(",")
                      .map((x) => x.trim())
                      .filter(Boolean),
                  }))
                }
              />
            </label>
          </div>
        )}
        <div className="filters filters-five">
          <input
            value={filters.query}
            onChange={(e) => u("query", e.target.value)}
            placeholder="Search title, company, or skill..."
          />
          <select value={filters.location} onChange={(e) => u("location", e.target.value)}>
            <option value="all">All locations</option>
            {locations.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <select value={filters.mode} onChange={(e) => u("mode", e.target.value)}>
            <option value="all">All work modes</option>
            <option>On-site</option>
            <option>Hybrid</option>
            <option>Remote</option>
          </select>
          <input
            type="number"
            min="0"
            value={filters.minSalary}
            onChange={(e) => u("minSalary", e.target.value)}
            placeholder="Min $/hr"
          />
          <select value={filters.sort} onChange={(e) => u("sort", e.target.value)}>
            <option value="recommended">Recommended</option>
            <option value="salary">Highest pay</option>
            <option value="company">Company A–Z</option>
          </select>
        </div>
        <div className="results-meta">
          <span>{loading ? "Loading jobs..." : `${filtered.length} jobs found`}</span>
          <span>{hiddenSet.size} hidden</span>
        </div>
        <div className="job-list">
          {!loading &&
            filtered.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                profile={profile}
                saved={savedSet.has(job.id)}
                onSave={toggleSaved}
                onHide={toggleHidden}
                onDetails={setSelectedJob}
                onApply={apply}
              />
            ))}
        </div>
        {!loading && filtered.length === 0 && (
          <div className="empty">No jobs match your current filters.</div>
        )}
      </section>
      {hiddenSet.size > 0 && (
        <section className="card compact-card">
          <div className="card-header">
            <div>
              <h3>Hidden jobs</h3>
              <p>Restore an opportunity if you hid it by mistake.</p>
            </div>
          </div>
          <div className="chips">
            {allJobs
              .filter((j) => hiddenSet.has(j.id))
              .map((j) => (
                <button className="chip button-chip" key={j.id} onClick={() => toggleHidden(j.id)}>
                  Restore {j.company}
                </button>
              ))}
          </div>
        </section>
      )}
      <JobDetailsDrawer
        job={selectedJob}
        profile={profile}
        saved={selectedJob ? savedSet.has(selectedJob.id) : false}
        onClose={() => setSelectedJob(null)}
        onSave={toggleSaved}
        onApply={apply}
      />
    </>
  );
}
