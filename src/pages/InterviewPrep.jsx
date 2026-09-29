import { useMemo, useState } from "react";
import { jobs } from "../data/jobs";
import { useApp } from "../context/AppContext";
import { buildQuestions, scorePracticeAnswer } from "../utils/interviewUtils";
import FeatureBadge from "../components/FeatureBadge";
export default function InterviewPrep() {
  const { interviewHistory, setInterviewHistory } = useApp();
  const [jobId, setJobId] = useState(jobs[0].id);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [mockIndex, setMockIndex] = useState(0);
  const [mockMode, setMockMode] = useState(false);
  const job = jobs.find((x) => x.id === Number(jobId));
  const questions = useMemo(() => buildQuestions(job), [job]);
  function score(i) {
    const r = scorePracticeAnswer(answers[i] || "");
    setFeedback((c) => ({ ...c, [i]: r }));
    setInterviewHistory((c) => [
      ...c,
      {
        id: Date.now(),
        jobId,
        question: questions[i].question,
        score: r.score,
        createdAt: new Date().toISOString(),
      },
    ]);
  }
  return (
    <>
      <section className="card">
        <div className="card-header">
          <div>
            <div className="title-with-badge">
              <h3>Interview Practice</h3>
              <FeatureBadge release="V1" />
              <FeatureBadge release="V2" />
            </div>
            <p>
              Practice common, behavioral, technical, and job-specific questions. V2 adds mock
              interview and answer feedback.
            </p>
          </div>
          <button
            className={`btn ${mockMode ? "btn-success" : "btn-soft"}`}
            onClick={() => setMockMode((v) => !v)}
          >
            {mockMode ? "Exit mock interview" : "Start mock interview"}
          </button>
        </div>
        <label>
          Target job
          <select
            value={jobId}
            onChange={(e) => {
              setJobId(Number(e.target.value));
              setAnswers({});
              setFeedback({});
              setMockIndex(0);
            }}
          >
            {jobs.map((x) => (
              <option key={x.id} value={x.id}>
                {x.title} — {x.company}
              </option>
            ))}
          </select>
        </label>
        {mockMode ? (
          <div className="mock-card">
            <div className="mock-progress">
              Question {mockIndex + 1} of {questions.length}
            </div>
            <div className="question-category">{questions[mockIndex].category}</div>
            <h3>{questions[mockIndex].question}</h3>
            <textarea
              placeholder="Type your practice answer..."
              value={answers[mockIndex] || ""}
              onChange={(e) => setAnswers((c) => ({ ...c, [mockIndex]: e.target.value }))}
            />
            <div className="inline-actions">
              <button className="btn btn-primary" onClick={() => score(mockIndex)}>
                Get feedback
              </button>
              <button
                className="btn btn-secondary"
                disabled={mockIndex === 0}
                onClick={() => setMockIndex((i) => i - 1)}
              >
                Previous
              </button>
              <button
                className="btn btn-secondary"
                disabled={mockIndex === questions.length - 1}
                onClick={() => setMockIndex((i) => i + 1)}
              >
                Next
              </button>
            </div>
            {feedback[mockIndex] && (
              <div className="feedback-box">
                <div className="feedback-score">{feedback[mockIndex].score}/100</div>
                <div>
                  {feedback[mockIndex].feedback.map((x) => (
                    <div key={x}>• {x}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="question-list">
            {questions.map((item, i) => (
              <article className="question-card" key={item.question}>
                <div className="question-category">{item.category}</div>
                <strong>
                  {i + 1}. {item.question}
                </strong>
                <textarea
                  placeholder="Write notes for your answer..."
                  value={answers[i] || ""}
                  onChange={(e) => setAnswers((c) => ({ ...c, [i]: e.target.value }))}
                />
                <div className="inline-actions">
                  <button className="btn btn-primary" onClick={() => score(i)}>
                    Get feedback
                  </button>
                  <details>
                    <summary>Show answer guidance</summary>
                    <div className="guidance">{item.guidance}</div>
                  </details>
                </div>
                {feedback[i] && (
                  <div className="feedback-box">
                    <div className="feedback-score">{feedback[i].score}/100</div>
                    <div>
                      {feedback[i].feedback.map((x) => (
                        <div key={x}>• {x}</div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="card compact-card">
        <div className="card-header">
          <div>
            <h3>Practice history</h3>
            <p>Your most recent scored answers.</p>
          </div>
        </div>
        <div className="history-list">
          {interviewHistory
            .slice(-5)
            .reverse()
            .map((x) => (
              <div className="history-row" key={x.id}>
                <span>{x.score}/100</span>
                <strong>{x.question}</strong>
              </div>
            ))}
          {interviewHistory.length === 0 && (
            <div className="empty">No scored practice answers yet.</div>
          )}
        </div>
      </section>
    </>
  );
}
