import { useMemo, useState } from "react";
import { useApp } from "../../context/AppContext";
import { useJobChoice } from "../../hooks/useJobOptions";
import { buildQuestions, scorePracticeAnswer } from "../../utils/interviewUtils";
import { aiReview } from "../../api/ai";
import { useAiStatus } from "../../hooks/useAiStatus";
import JobSelect from "../common/JobSelect";
import QuestionCard from "./QuestionCard";
import MockInterview from "./MockInterview";

// Kai's job-specific practice: questions generated from the chosen job, a
// mock-interview mode and answer scoring (saved to the practice history).
export default function JobQuestions({ mockMode }) {
  const { setInterviewHistory } = useApp();
  const [jobId, setJobId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [mockIndex, setMockIndex] = useState(0);
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

  const ai = useAiStatus();

  // AI feedback when api.key enables it, otherwise the rule-based score. If the
  // AI call fails, the rule-based result is shown with a note.
  async function getFeedback(i) {
    const answer = answers[i] || "";
    if (!ai.ready || !answer.trim()) return scorePracticeAnswer(answer);
    setFeedback((c) => ({
      ...c,
      [i]: { score: 0, feedback: ["Getting AI feedback…"], pending: true },
    }));
    try {
      const r = await aiReview("interview", {
        question: questions[i].question,
        answer,
        jobTitle: job.title,
        company: job.company,
      });
      return {
        score: r.score,
        source: "ai",
        feedback: [...r.strengths.map((s) => `✓ ${s}`), ...r.improvements],
      };
    } catch (err) {
      const fallback = scorePracticeAnswer(answer);
      return { ...fallback, feedback: [...fallback.feedback, `(AI unavailable: ${err.message})`] };
    }
  }

  async function score(i) {
    const result = await getFeedback(i);
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
    </>
  );
}
