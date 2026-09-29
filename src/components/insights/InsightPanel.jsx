import SkillChips from "../common/SkillChips";
import {
  formatSalary,
  getMatchScore,
  getSkillGaps,
  recommendationScore,
} from "../../utils/jobUtils";

export default function InsightPanel({ job, profile }) {
  const facts = [
    ["Salary", formatSalary(job)],
    ["Skill match", `${getMatchScore(job, profile.skills)}%`],
    ["Industry", job.companyInsights?.industry || job.tags[0] || "—"],
    ["Work mode", job.mode],
  ];

  return (
    <div className="insight-panel">
      <div className="insight-head">
        <div>
          <h3>{job.title}</h3>
          <span>{job.company}</span>
        </div>
        <div className="insight-score">{recommendationScore(job, profile)}%</div>
      </div>
      <div className="insight-grid">
        {facts.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <h4>Required skills</h4>
      <SkillChips skills={job.skills} />
      <h4>Your gaps</h4>
      <SkillChips
        skills={getSkillGaps(job, profile.skills)}
        variant="warning"
        emptyText="No major gaps"
      />
      <h4>Company context</h4>
      <p>
        {job.companyInsights?.note ||
          `Listed on ${job.sourceName}. Open the job for its company profile.`}
      </p>
    </div>
  );
}
