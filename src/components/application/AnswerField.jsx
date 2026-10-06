// One screening answer: a Yes/No select, a one-line input or a textarea.
export default function AnswerField({ question, value, onChange, label }) {
  const props = { value, "aria-label": label, onChange: (e) => onChange(e.target.value) };
  if (question.kind === "yesno") {
    return (
      <select {...props}>
        <option>Yes</option>
        <option>No</option>
      </select>
    );
  }
  if (question.kind === "short") return <input {...props} />;
  return <textarea rows={3} {...props} />;
}
