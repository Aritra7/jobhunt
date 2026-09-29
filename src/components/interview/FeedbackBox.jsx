export default function FeedbackBox({ result }) {
  if (!result) return null;
  return (
    <div className="feedback-box">
      <div className="feedback-score">{result.score}/100</div>
      <div>
        {result.feedback.map((line) => (
          <div key={line}>• {line}</div>
        ))}
      </div>
    </div>
  );
}
