export default function ReviewStep({ job, form }) {
  const rows = [
    ["Role", `${job.title} · ${job.company}`],
    ["Applicant", `${form.firstName} ${form.lastName}`],
    ["Email", form.email],
    ["Work authorization", form.workAuthorization],
    ["Resume", "Get a Job Resume"],
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
