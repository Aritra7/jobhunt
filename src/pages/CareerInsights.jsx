import { useMemo, useState } from "react";
import { jobs } from "../data/jobs";
import { useApp } from "../context/AppContext";
import { formatSalary, getMatchScore, getSkillGaps, recommendationScore } from "../utils/jobUtils";
import FeatureBadge from "../components/FeatureBadge";
export default function CareerInsights() {
  const { profile } = useApp();
  const [aId, setAId] = useState(jobs[0].id);
  const [bId, setBId] = useState(jobs[1].id);
  const a = jobs.find((j) => j.id === Number(aId)),
    b = jobs.find((j) => j.id === Number(bId));
  const common = useMemo(() => {
    const c = {};
    jobs.forEach((j) => j.skills.forEach((s) => (c[s] = (c[s] || 0) + 1)));
    return Object.entries(c)
      .sort((x, y) => y[1] - x[1])
      .slice(0, 6);
  }, []);
  function Panel({ job }) {
    const gaps = getSkillGaps(job, profile.skills);
    return (
      <div className="insight-panel">
        <div className="insight-head">
          <div>
            <h3>{job.title}</h3>
            <span>{job.company}</span>
          </div>
          <div className="insight-score">{recommendationScore(job, profile)}%</div>
        </div>
        <div className="insight-grid">
          <div>
            <span>Salary</span>
            <strong>{formatSalary(job)}</strong>
          </div>
          <div>
            <span>Skill match</span>
            <strong>{getMatchScore(job, profile.skills)}%</strong>
          </div>
          <div>
            <span>Industry</span>
            <strong>{job.companyInsights.industry}</strong>
          </div>
          <div>
            <span>Work mode</span>
            <strong>{job.mode}</strong>
          </div>
        </div>
        <h4>Required skills</h4>
        <div className="chips">
          {job.skills.map((s) => (
            <span className="chip" key={s}>
              {s}
            </span>
          ))}
        </div>
        <h4>Your gaps</h4>
        <div className="chips">
          {gaps.length ? (
            gaps.map((s) => (
              <span className="chip warning" key={s}>
                {s}
              </span>
            ))
          ) : (
            <span className="chip success">No major gaps</span>
          )}
        </div>
        <h4>Company context</h4>
        <p>{job.companyInsights.note}</p>
      </div>
    );
  }
  return (
    <>
      <section className="card">
        <div className="card-header">
          <div>
            <div className="title-with-badge">
              <h3>Role & Company Insights</h3>
              <FeatureBadge release="V1" />
            </div>
            <p>
              Bring salary, company context, required skills, and profile match into one decision
              view.
            </p>
          </div>
        </div>
        <label>
          Role to inspect
          <select value={aId} onChange={(e) => setAId(Number(e.target.value))}>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} — {j.company}
              </option>
            ))}
          </select>
        </label>
        <Panel job={a} />
      </section>
      <section className="card">
        <div className="card-header">
          <div>
            <div className="title-with-badge">
              <h3>Compare Roles</h3>
              <FeatureBadge release="V2" />
            </div>
            <p>
              Compare two opportunities side by side before deciding where to spend application
              time.
            </p>
          </div>
        </div>
        <div className="compare-selects">
          <select value={aId} onChange={(e) => setAId(Number(e.target.value))}>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.company} — {j.title}
              </option>
            ))}
          </select>
          <select value={bId} onChange={(e) => setBId(Number(e.target.value))}>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.company} — {j.title}
              </option>
            ))}
          </select>
        </div>
        <div className="compare-grid">
          <Panel job={a} />
          <Panel job={b} />
        </div>
      </section>
      <section className="card">
        <div className="card-header">
          <div>
            <div className="title-with-badge">
              <h3>Skill Demand Snapshot</h3>
              <FeatureBadge release="V2" />
            </div>
            <p>A lightweight trend view based on the prototype job dataset.</p>
          </div>
        </div>
        <div className="skill-bars">
          {common.map(([skill, count]) => (
            <div className="skill-bar-row" key={skill}>
              <span>{skill}</span>
              <div className="skill-bar">
                <div style={{ width: `${(count / jobs.length) * 100}%` }} />
              </div>
              <strong>{count}</strong>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
