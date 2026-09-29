import SectionCard from "../common/SectionCard";

const STEPS = [
  ["1", "Discover", "Search, filter, inspect, save"],
  ["2", "Prepare", "Profile + resume + match"],
  ["3", "Apply", "Autofill + questions + review"],
  ["4", "Track", "Status, deadlines, reminders"],
  ["5", "Interview", "Practice + feedback"],
];

export default function WorkflowSteps() {
  return (
    <SectionCard
      as="div"
      title="End-to-end V1 flow"
      description="The smallest useful release still completes the whole user journey."
    >
      <div className="workflow">
        {STEPS.map(([number, title, text]) => (
          <div className="workflow-item" key={title}>
            <span>{number}</span>
            <div>
              <strong>{title}</strong>
              <p>{text}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
