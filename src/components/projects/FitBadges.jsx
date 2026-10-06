import { ROLES } from "../../data/roleStyles";
import { fitSummary } from "../../utils/projectPhrasing";

// "SDE 3 · FDE 1 · AI Eng 0 · MLE 0": how well a project fits each role (0–3).
export default function FitBadges({ project }) {
  const fit = fitSummary(project);
  return (
    <div className="chips">
      {ROLES.map((role) => (
        <span
          key={role.id}
          className={`chip${fit[role.id] >= 2 ? " success" : ""}`}
          title={`${role.name} fit (0–3)`}
        >
          {role.label} {fit[role.id]}
        </span>
      ))}
    </div>
  );
}
