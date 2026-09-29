export default function ScreeningStep({ form, updateField }) {
  return (
    <>
      <h4>Screening questions</h4>
      <label>
        Why are you interested in this role?
        <textarea
          value={form.whyInterested}
          onChange={(e) => updateField("whyInterested", e.target.value)}
        />
      </label>
      <label>
        Authorized to work in the United States?
        <select
          value={form.workAuthorization}
          onChange={(e) => updateField("workAuthorization", e.target.value)}
        >
          <option>Yes</option>
          <option>No</option>
        </select>
      </label>
    </>
  );
}
