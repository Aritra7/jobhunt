import { WIZARD_STEPS } from "../../hooks/useApplicationWizard";

export default function WizardSteps({ step }) {
  return (
    <aside className="steps">
      {WIZARD_STEPS.map((label, i) => {
        const n = i + 1;
        return (
          <div
            key={label}
            className={`step ${step === n ? "active" : ""} ${step > n ? "done" : ""}`}
          >
            <span>{n}</span>
            {label}
          </div>
        );
      })}
    </aside>
  );
}
