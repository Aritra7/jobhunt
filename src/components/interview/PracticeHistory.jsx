import SectionCard from "../common/SectionCard";
import EmptyState from "../common/EmptyState";

const RECENT_COUNT = 5;

export default function PracticeHistory({ history }) {
  const recent = history.slice(-RECENT_COUNT).reverse();
  return (
    <SectionCard compact title="Practice history" description="Your most recent scored answers.">
      <div className="history-list">
        {recent.map((entry) => (
          <div className="history-row" key={entry.id}>
            <span>{entry.score}/100</span>
            <strong>{entry.question}</strong>
          </div>
        ))}
        {history.length === 0 && <EmptyState>No scored practice answers yet.</EmptyState>}
      </div>
    </SectionCard>
  );
}
