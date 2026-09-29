// A row of skill chips. With `emptyText`, an empty list shows a green chip
// instead (used for "no skill gaps").
export default function SkillChips({ skills, variant = "", prefix = "", emptyText }) {
  const className = variant ? `chip ${variant}` : "chip";
  return (
    <div className="chips">
      {skills.map((skill) => (
        <span className={className} key={skill}>
          {prefix}
          {skill}
        </span>
      ))}
      {skills.length === 0 && emptyText && <span className="chip success">{emptyText}</span>}
    </div>
  );
}
