const FIELDS = [
  ["firstName", "First name"],
  ["lastName", "Last name"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["location", "Location"],
  ["portfolio", "Portfolio"],
];

export default function AutofillStep({ form, updateField }) {
  return (
    <>
      <h4>Autofilled profile</h4>
      <div className="form-grid">
        {FIELDS.map(([key, label]) => (
          <label key={key}>
            {label}
            <input value={form[key]} onChange={(e) => updateField(key, e.target.value)} />
          </label>
        ))}
      </div>
    </>
  );
}
