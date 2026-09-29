import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { useJobChoice } from "../hooks/useJobOptions";
import { buildQuestions, scorePracticeAnswer } from "../utils/interviewUtils";
import SectionCard from "../components/common/SectionCard";
import JobSelect from "../components/common/JobSelect";
import QuestionCard from "../components/interview/QuestionCard";
import MockInterview from "../components/interview/MockInterview";
import PracticeHistory from "../components/interview/PracticeHistory";

export default function InterviewPrep() {
  const { interviewHistory, setInterviewHistory } = useApp();
  const [jobId, setJobId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [mockIndex, setMockIndex] = useState(0);
  const [mockMode, setMockMode] = useState(false);
  const { job, choices } = useJobChoice(jobId);
  const questions = useMemo(() => (job ? buildQuestions(job) : []), [job]);

  // Switching jobs starts a fresh practice session.
  function selectJob(id) {
    setJobId(id);
    setAnswers({});
    setFeedback({});
    setMockIndex(0);
  }

  const setAnswer = (i, text) => setAnswers((c) => ({ ...c, [i]: text }));

  function score(i) {
    const result = scorePracticeAnswer(answers[i] || "");
    setFeedback((c) => ({ ...c, [i]: result }));
    setInterviewHistory((c) => [
      ...c,
      {
        id: Date.now(),
        jobId: job.id,
        question: questions[i].question,
        score: result.score,
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  return (
    <>
      <SectionCard
        title="Interview Practice"
        badges={["V1", "V2"]}
        description="Practice common, behavioral, technical, and job-specific questions. V2 adds mock interview and answer feedback."
        actions={
          <button
            className={`btn ${mockMode ? "btn-success" : "btn-soft"}`}
            onClick={() => setMockMode((v) => !v)}
          >
            {mockMode ? "Exit mock interview" : "Start mock interview"}
          </button>
        }
      >
        <label>
          Target job
          <JobSelect jobs={choices} value={job?.id ?? ""} onChange={selectJob} />
        </label>
        {!job ? (
          <p className="muted">Loading jobs…</p>
        ) : mockMode ? (
          <MockInterview
            questions={questions}
            index={mockIndex}
            setIndex={setMockIndex}
            answers={answers}
            onAnswer={setAnswer}
            onScore={score}
            feedback={feedback}
          />
        ) : (
          <div className="question-list">
            {questions.map((item, i) => (
              <QuestionCard
                key={item.question}
                number={i + 1}
                item={item}
                answer={answers[i] || ""}
                onAnswer={(text) => setAnswer(i, text)}
                onScore={() => score(i)}
                feedback={feedback[i]}
              />
            ))}
          </div>
        )}
      </SectionCard>
      <PracticeHistory history={interviewHistory} />
    </>
  );
}
