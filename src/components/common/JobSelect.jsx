import { titleFirstLabel } from "../../utils/labels";

// Dropdown of jobs. `format` picks the option text.
export default function JobSelect({ jobs, value, onChange, format = titleFirstLabel }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {jobs.map((job) => (
        <option key={job.id} value={job.id}>
          {format(job)}
        </option>
      ))}
    </select>
  );
}
