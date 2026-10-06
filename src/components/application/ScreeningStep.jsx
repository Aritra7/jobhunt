import { SCREENING_QUESTIONS, questionById } from "../../data/screeningQuestions";
import { fillAnswer, toTemplate } from "../../utils/screening";
import AnswerField from "./AnswerField";

/**
 * Screening questions for this application. Answers start from the answer
 * bank, filled in for the job; edits stay with this application unless saved
 * as the new default.
 */
export default function ScreeningStep({ form, updateField, bank, context, onSaveDefault }) {
  const answerFor = (id) => form.answers[id] ?? fillAnswer(bank[id], context);
  const setAnswer = (id, text) => updateField("answers", { ...form.answers, [id]: text });
  const remaining = SCREENING_QUESTIONS.filter((q) => !form.questionIds.includes(q.id));

  return (
    <>
      <h4>Screening questions</h4>
      {form.questionIds.map((id) => {
        const question = questionById(id);
        if (!question) return null;
        const label = fillAnswer(question.question, context);
        const edited = form.answers[id] !== undefined;
        return (
          <div className="screening-question" key={id}>
            <label>
              {label}
              <AnswerField
                question={question}
                label={label}
                value={answerFor(id)}
                onChange={(text) => setAnswer(id, text)}
              />
            </label>
            <div className="inline-actions">
              {edited && (
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => onSaveDefault(id, toTemplate(form.answers[id], context))}
                >
                  Save as my default answer
                </button>
              )}
              <button
                type="button"
                className="link-btn danger"
                onClick={() =>
                  updateField(
                    "questionIds",
                    form.questionIds.filter((q) => q !== id),
                  )
                }
              >
                Remove question
              </button>
            </div>
          </div>
        );
      })}
      {remaining.length > 0 && (
        <label>
          Add a question from the bank
          <select
            value=""
            onChange={(e) =>
              e.target.value && updateField("questionIds", [...form.questionIds, e.target.value])
            }
          >
            <option value="">Choose a question…</option>
            {remaining.map((q) => (
              <option key={q.id} value={q.id}>
                {fillAnswer(q.question, context)}
              </option>
            ))}
          </select>
        </label>
      )}
    </>
  );
}
