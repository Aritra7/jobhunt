import { useNavigate } from "react-router-dom";
import { jobs } from "../data/jobs";
import { useApp } from "../context/AppContext";
import { clearSelectedJob, readSelectedJobId } from "../hooks/useSelectedJob";
import { formFromProfile, useApplicationWizard, WIZARD_STEPS } from "../hooks/useApplicationWizard";
import SectionCard from "../components/common/SectionCard";
import WizardSteps from "../components/application/WizardSteps";
import SelectJobStep from "../components/application/SelectJobStep";
import AutofillStep from "../components/application/AutofillStep";
import ScreeningStep from "../components/application/ScreeningStep";
import ReviewStep from "../components/application/ReviewStep";

// The job handed over from Job Discovery, if it still exists; else the first job.
function initialJobId() {
  const selected = readSelectedJobId();
  return jobs.some((job) => job.id === selected) ? selected : jobs[0].id;
}

export default function JobApplication() {
  const navigate = useNavigate();
  const {
    profile,
    applicationDrafts,
    saveDraft,
    clearDraft,
    reusableAnswers,
    setReusableAnswers,
    upsertApplication,
  } = useApp();
  const wizard = useApplicationWizard({
    initialJobId: initialJobId(),
    initialForm: formFromProfile(profile, reusableAnswers),
    drafts: applicationDrafts,
  });
  const { jobId, form, step, draftLoaded, updateField } = wizard;
  const job = jobs.find((x) => x.id === jobId);
  const isLastStep = step === WIZARD_STEPS.length;

  function submit() {
    setReusableAnswers({
      whyInterested: form.whyInterested,
      workAuthorization: form.workAuthorization,
    });
    upsertApplication(jobId, "Applied", {
      submittedAt: new Date().toISOString(),
      deadline: "",
      reminder: "",
      notes: "",
    });
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
          {step === 1 && <SelectJobStep jobs={jobs} jobId={jobId} onSelect={wizard.selectJob} />}
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
