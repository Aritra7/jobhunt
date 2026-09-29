import FeedbackBox from "./FeedbackBox";

export default function QuestionCard({ number, item, answer, onAnswer, onScore, feedback }) {
  return (
    <article className="question-card">
      <div className="question-category">{item.category}</div>
      <strong>
        {number}. {item.question}
      </strong>
      <textarea
        placeholder="Write notes for your answer..."
        value={answer}
        onChange={(e) => onAnswer(e.target.value)}
      />
      <div className="inline-actions">
        <button className="btn btn-primary" onClick={onScore}>
          Get feedback
        </button>
        <details>
          <summary>Show answer guidance</summary>
          <div className="guidance">{item.guidance}</div>
        </details>
      </div>
      <FeedbackBox result={feedback} />
    </article>
  );
}
