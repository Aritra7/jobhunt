import FeedbackBox from "./FeedbackBox";

// One question at a time, with Previous / Next.
export default function MockInterview({
  questions,
  index,
  setIndex,
  answers,
  onAnswer,
  onScore,
  feedback,
}) {
  const item = questions[index];
  return (
    <div className="mock-card">
      <div className="mock-progress">
        Question {index + 1} of {questions.length}
      </div>
      <div className="question-category">{item.category}</div>
      <h3>{item.question}</h3>
      <textarea
        placeholder="Type your practice answer..."
        value={answers[index] || ""}
        onChange={(e) => onAnswer(index, e.target.value)}
      />
      <div className="inline-actions">
        <button className="btn btn-primary" onClick={() => onScore(index)}>
          Get feedback
        </button>
        <button
          className="btn btn-secondary"
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
        >
          Previous
        </button>
        <button
          className="btn btn-secondary"
          disabled={index === questions.length - 1}
          onClick={() => setIndex((i) => i + 1)}
        >
          Next
        </button>
      </div>
      <FeedbackBox result={feedback[index]} />
    </div>
  );
}
