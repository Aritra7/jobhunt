import { SCREENING_QUESTIONS } from "../../data/screeningQuestions";
import AnswerField from "./AnswerField";

// Default answers to common screening questions, reused on every application.
export default function AnswerBank({ bank, setBank }) {
  return (
    <div className="stack">
      <p className="muted">
        Write each answer once. Use {"{company}"}, {"{role}"}, {"{project}"} (your best-matching
        project) and {"{source}"} where the job's details should go; they're filled in on every
        application.
      </p>
      {SCREENING_QUESTIONS.map((question) => (
        <label key={question.id}>
          {question.question}
          <AnswerField
            question={question}
            label={question.question}
            value={bank[question.id] ?? ""}
            onChange={(text) => setBank((b) => ({ ...b, [question.id]: text }))}
          />
        </label>
      ))}
    </div>
  );
}
