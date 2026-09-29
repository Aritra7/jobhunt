import { decomposition, releaseGoals } from "../data/releases";
export default function ReleasePlan() {
  return (
    <>
      <section className="release-hero">
        <div className="release-summary v1-summary">
          <span>VERSION 1</span>
          <h2>Smallest usable end-to-end release</h2>
          <p>{releaseGoals.v1}</p>
        </div>
        <div className="release-summary v2-summary">
          <span>VERSION 2</span>
          <h2>Smarter, more personalized release</h2>
          <p>{releaseGoals.v2}</p>
        </div>
      </section>
      <section className="card">
        <div className="card-header">
          <div>
            <h3>Feature Decomposition → V1 → V2</h3>
            <p>This page mirrors the product structure established on the Mural board.</p>
          </div>
        </div>
        <div className="decomposition-table">
          <div className="decomp-header">
            <strong>Feature</strong>
            <strong>Version 1</strong>
            <strong>Version 2</strong>
          </div>
          {decomposition.map((g) => (
            <div className="decomp-row" key={g.feature}>
              <div className="decomp-feature">{g.feature}</div>
              <div>
                {g.v1.map((x) => (
                  <div className="release-item v1-item" key={x}>
                    {x}
                  </div>
                ))}
              </div>
              <div>
                {g.v2.map((x) => (
                  <div className="release-item v2-item" key={x}>
                    {x}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="card">
        <div className="card-header">
          <div>
            <h3>Why two releases?</h3>
            <p>
              Ship a complete user outcome first, then improve intelligence and efficiency without
              making V1 enormous.
            </p>
          </div>
        </div>
        <div className="strategy-grid">
          <div>
            <strong>V1 proves the workflow</strong>
            <p>
              A user can discover a role, prepare materials, apply, track it, and prepare for an
              interview.
            </p>
          </div>
          <div>
            <strong>V2 removes friction</strong>
            <p>
              Recommendations, reusable answers, reminders, scoring, and deeper insights make the
              workflow faster and smarter.
            </p>
          </div>
          <div>
            <strong>Technical debt stays visible</strong>
            <p>
              The prototype intentionally uses mock job data, browser storage, and simplified
              scoring so debt can be added transparently to the backlog.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
