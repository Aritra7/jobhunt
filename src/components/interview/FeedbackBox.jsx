export default function FeedbackBox({ result }) {
  if (!result) return null;
  return (
    <div className="feedback-box">
      <div className="feedback-score">
        {result.pending ? "…" : `${result.score}/100`}
        {result.source === "ai" && <span className="ai-tag">AI</span>}
      </div>
      <div>
        {result.feedback.map((line) => (
          <div key={line}>• {line}</div>
        ))}
      </div>
    </div>
  );
}
