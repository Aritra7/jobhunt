import { questionById } from "../../data/screeningQuestions";
import { fillAnswer } from "../../utils/screening";

export default function ReviewStep({ job, form, bank, context }) {
  const rows = [
    ["Role", `${job.title} · ${job.company}`],
    ["Applicant", `${form.firstName} ${form.lastName}`],
    ["Email", form.email],
    ["Resume", "Get a Job Resume"],
    ...form.questionIds
      .map(questionById)
      .filter(Boolean)
      .map((q) => [
        fillAnswer(q.question, context),
        form.answers[q.id] ?? fillAnswer(bank[q.id], context),
      ]),
  ];

  return (
    <>
      <h4>Review & submit</h4>
      <div className="info-box review-grid">
        {rows.map(([label, value]) => (
          <div key={label}>
            <strong>{label}</strong>
            <span>{value}</span>
          </div>
        ))}
      </div>
    </>
  );
}
