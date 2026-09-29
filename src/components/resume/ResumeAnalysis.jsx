// ATS-style match of the resume against one job.
export default function ResumeAnalysis({ job, analysis }) {
  return (
    <div className="analysis-box">
      <div className="analysis-heading">
        <div>
          <div className="eyebrow">ATS-STYLE MATCH</div>
          <strong>
            {job.title} · {job.company}
          </strong>
        </div>
        <div className="analysis-score">{analysis.atsScore}%</div>
      </div>
      <div className="chips">
        {analysis.matched.map((skill) => (
          <span className="chip success" key={skill}>
            {skill}
          </span>
        ))}
        {analysis.missing.map((skill) => (
          <span className="chip warning" key={skill}>
            Gap: {skill}
          </span>
        ))}
      </div>
      <div className="suggestion-list">
        {analysis.suggestions.map((suggestion) => (
          <div key={suggestion}>• {suggestion}</div>
        ))}
      </div>
    </div>
  );
}
