import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useJobChoice } from "../hooks/useJobOptions";
import { clearSelectedJob, readSelectedJobId } from "../hooks/useSelectedJob";
import { formFromProfile, useApplicationWizard, WIZARD_STEPS } from "../hooks/useApplicationWizard";
import SectionCard from "../components/common/SectionCard";
import WizardSteps from "../components/application/WizardSteps";
import SelectJobStep from "../components/application/SelectJobStep";
import AutofillStep from "../components/application/AutofillStep";
import ScreeningStep from "../components/application/ScreeningStep";
import ReviewStep from "../components/application/ReviewStep";

export default function JobApplication() {
  const navigate = useNavigate();
  const {
    profile,
    applicationDrafts,
    saveDraft,
    clearDraft,
    reusableAnswers,
    setReusableAnswers,
    trackJob,
    findByJobId,
    updateApplication,
  } = useApp();
  const wizard = useApplicationWizard({
    // The job handed over from Job Discovery, if any.
    initialJobId: readSelectedJobId(),
    initialForm: formFromProfile(profile, reusableAnswers),
    drafts: applicationDrafts,
  });
  const { form, step, draftLoaded, updateField } = wizard;
  const { job, choices } = useJobChoice(wizard.jobId);
  const jobId = job?.id;
  const isLastStep = step === WIZARD_STEPS.length;

  if (!job) {
    return (
      <SectionCard title="Guided Job Application" badges={["V1", "V2"]}>
        <p className="muted">Loading jobs…</p>
      </SectionCard>
    );
  }

  function submit() {
    setReusableAnswers({
      whyInterested: form.whyInterested,
      workAuthorization: form.workAuthorization,
    });
    const tracked = findByJobId(jobId);
    if (tracked) updateApplication(tracked.id, { status: "applied" });
    else trackJob(job, "applied");
    clearDraft(jobId);
    clearSelectedJob();
    navigate("/tracker");
  }

  return (
    <SectionCard
      title="Guided Job Application"
      badges={["V1", "V2"]}
      description="V1 handles the submission flow. V2 adds saved drafts and reusable answers."
      actions={
        <button className="btn btn-secondary" onClick={() => saveDraft(jobId, { form, step })}>
          Save draft
        </button>
      }
    >
      {draftLoaded && <div className="info-box">Saved draft restored for {job.company}.</div>}
      <div className="wizard">
        <WizardSteps step={step} />
        <div className="wizard-pane">
          {step === 1 && <SelectJobStep jobs={choices} jobId={jobId} onSelect={wizard.selectJob} />}
          {step === 2 && <AutofillStep form={form} updateField={updateField} />}
          {step === 3 && <ScreeningStep form={form} updateField={updateField} />}
          {step === 4 && <ReviewStep job={job} form={form} />}
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
    </SectionCard>
  );
}
