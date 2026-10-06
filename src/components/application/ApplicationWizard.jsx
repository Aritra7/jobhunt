import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useJobChoice } from "../../hooks/useJobOptions";
import { clearSelectedJob, readSelectedJobId } from "../../hooks/useSelectedJob";
import {
  formFromProfile,
  useApplicationWizard,
  WIZARD_STEPS,
} from "../../hooks/useApplicationWizard";
import { rankProjects } from "../../utils/resumeGenerator";
import { answerContext } from "../../utils/screening";
import WizardSteps from "./WizardSteps";
import SelectJobStep from "./SelectJobStep";
import AutofillStep from "./AutofillStep";
import ScreeningStep from "./ScreeningStep";
import ReviewStep from "./ReviewStep";

// The guided four-step application: choose a job, check autofilled details,
// answer screening questions from the answer bank, review and submit.
export default function ApplicationWizard({ projects }) {
  const navigate = useNavigate();
  const app = useApp();
  const { profile, applicationDrafts, saveDraft, clearDraft } = app;
  const bank = app.reusableAnswers;
  const wizard = useApplicationWizard({
    // The job handed over from Job Discovery or the auto-apply queue, if any.
    initialJobId: readSelectedJobId(),
    initialForm: formFromProfile(profile),
    drafts: applicationDrafts,
  });
  const { form, step, draftLoaded, updateField } = wizard;
  const { job, choices } = useJobChoice(wizard.jobId);

  if (!job) return <p className="muted">Loading jobs…</p>;

  const jobId = job.id;
  const bestProject = rankProjects(projects, "sde", job.descriptionText)[0]?.project;
  const context = answerContext(job, bestProject);
  const isLastStep = step === WIZARD_STEPS.length;
  const saveDefault = (id, template) => app.setReusableAnswers((b) => ({ ...b, [id]: template }));

  function submit() {
    const tracked = app.findByJobId(jobId);
    if (tracked) app.updateApplication(tracked.id, { status: "applied" });
    else app.trackJob(job, "applied");
    clearDraft(jobId);
    clearSelectedJob();
    navigate("/tracker");
  }

  return (
    <>
      <div className="inline-actions wizard-toolbar">
        <button className="btn btn-secondary" onClick={() => saveDraft(jobId, { form, step })}>
          Save draft
        </button>
      </div>
      {draftLoaded && <div className="info-box">Saved draft restored for {job.company}.</div>}
      <div className="wizard">
        <WizardSteps step={step} />
        <div className="wizard-pane">
          {step === 1 && <SelectJobStep jobs={choices} jobId={jobId} onSelect={wizard.selectJob} />}
          {step === 2 && <AutofillStep form={form} updateField={updateField} />}
          {step === 3 && (
            <ScreeningStep
              form={form}
              updateField={updateField}
              bank={bank}
              context={context}
              onSaveDefault={saveDefault}
            />
          )}
          {step === 4 && <ReviewStep job={job} form={form} bank={bank} context={context} />}
          <div className="inline-actions">
            <button className="btn btn-secondary" disabled={step === 1} onClick={wizard.back}>
              Back
            </button>
            {isLastStep ? (
              <button className="btn btn-primary" onClick={submit}>
                Submit application
              </button>
            ) : (
              <button className="btn btn-primary" onClick={wizard.next}>
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
