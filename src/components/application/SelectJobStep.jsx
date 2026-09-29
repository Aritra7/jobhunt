import JobSelect from "../common/JobSelect";

export default function SelectJobStep({ jobs, jobId, onSelect }) {
  return (
    <>
      <h4>Select a job</h4>
      <label>
        Job
        <JobSelect jobs={jobs} value={jobId} onChange={onSelect} />
      </label>
      <div className="info-box">
        <strong>Resume:</strong> Get a Job Resume · profile autofill ready
      </div>
    </>
  );
}
