import { decomposition, releaseGoals, strategy } from "../data/releases";
import SectionCard from "../components/common/SectionCard";

function ReleaseItems({ items, release }) {
  return (
    <div>
      {items.map((item) => (
        <div className={`release-item ${release}-item`} key={item}>
          {item}
        </div>
      ))}
    </div>
  );
}

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
      <SectionCard
        title="Feature Decomposition → V1 → V2"
        description="This page mirrors the product structure established on the Mural board."
      >
        <div className="decomposition-table">
          <div className="decomp-header">
            <strong>Feature</strong>
            <strong>Version 1</strong>
            <strong>Version 2</strong>
          </div>
          {decomposition.map((group) => (
            <div className="decomp-row" key={group.feature}>
              <div className="decomp-feature">{group.feature}</div>
              <ReleaseItems items={group.v1} release="v1" />
              <ReleaseItems items={group.v2} release="v2" />
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard
        title="Why two releases?"
        description="Ship a complete user outcome first, then improve intelligence and efficiency without making V1 enormous."
      >
        <div className="strategy-grid">
          {strategy.map(([title, text]) => (
            <div key={title}>
              <strong>{title}</strong>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
}
