import { Link } from "react-router-dom";

export default function Hero({ focus }) {
  return (
    <section className="hero">
      <div>
        <div className="eyebrow hero-eyebrow">YOUR JOB SEARCH WORKSPACE</div>
        <h2>One place to find, apply, track, and prepare.</h2>
        <p>
          Get a Job turns the internship search into one connected workflow instead of separate
          tabs, spreadsheets, resume files, and interview notes.
        </p>
        <div className="inline-actions">
          <Link className="btn hero-primary" to="/jobs">
            Find jobs
          </Link>
          <Link className="btn hero-secondary" to="/tracker">
            Open tracker
          </Link>
        </div>
      </div>
      <div className="hero-side">
        <div className="eyebrow hero-eyebrow">CURRENT FOCUS</div>
        {focus.map(([label, value]) => (
          <div className="mini-row" key={label}>
            <strong>{label}</strong>
            <span>{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
