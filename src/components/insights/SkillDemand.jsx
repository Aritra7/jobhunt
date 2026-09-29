// Horizontal bars: how many jobs ask for each skill.
export default function SkillDemand({ skills, totalJobs }) {
  return (
    <div className="skill-bars">
      {skills.map(([skill, count]) => (
        <div className="skill-bar-row" key={skill}>
          <span>{skill}</span>
          <div className="skill-bar">
            <div style={{ width: `${(count / totalJobs) * 100}%` }} />
          </div>
          <strong>{count}</strong>
        </div>
      ))}
    </div>
  );
}
