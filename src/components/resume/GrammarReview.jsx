import { useState } from "react";
import { aiReview } from "../../api/ai";
import { useAiStatus } from "../../hooks/useAiStatus";
import { bulletLines } from "../../hooks/useResume";
import { autoFix, checkDateFormats, checkGrammar } from "../../utils/grammarCheck";

/** Every experience bullet with where it lives, so fixes can be written back. */
function collectBullets(resume) {
  return resume.experience.flatMap((exp) =>
    bulletLines(exp.bulletsText).map((text, index) => ({ expId: exp.id, index, text })),
  );
}

// Grammar and formatting checks for the resume's bullets (always on), plus an
// optional AI review when api.key enables it.
export default function GrammarReview({ resumeState }) {
  const { resume, updateResume } = resumeState;
  const ai = useAiStatus();
  const [aiResult, setAiResult] = useState(null);
  const [aiState, setAiState] = useState("");
  const bullets = collectBullets(resume);
  const dateNote = checkDateFormats(
    [...resume.experience, ...resume.education].flatMap((e) => [e.start, e.end]),
  );

  function replace({ expId, index }, text) {
    updateResume((r) => ({
      ...r,
      experience: r.experience.map((exp) => {
        if (exp.id !== expId) return exp;
        const lines = bulletLines(exp.bulletsText);
        lines[index] = text;
        return { ...exp, bulletsText: lines.join("\n") };
      }),
    }));
  }

  async function reviewWithAi() {
    setAiState("Reviewing…");
    try {
      setAiResult(await aiReview("bullets", { bullets: bullets.map((b) => b.text) }));
      setAiState("");
    } catch (err) {
      setAiState(`AI review failed: ${err.message}`);
    }
  }

  const withIssues = bullets
    .map((bullet) => ({ bullet, issues: checkGrammar(bullet.text), fixed: autoFix(bullet.text) }))
    .filter((b) => b.issues.length > 0);

  return (
    <div className="stack">
      <h4>Grammar and formatting</h4>
      {dateNote && <div className="notice-box">{dateNote}</div>}
      {withIssues.length === 0 && bullets.length > 0 && !dateNote && (
        <p className="bullet-ok">No grammar or formatting problems found.</p>
      )}
      {withIssues.map(({ bullet, issues, fixed }) => (
        <div className="grammar-item" key={`${bullet.expId}-${bullet.index}`}>
          <p>{bullet.text}</p>
          <ul className="phrasing-checks">
            {issues.map((issue) => (
              <li className="bullet-issues" key={issue}>
                {issue}
              </li>
            ))}
          </ul>
          {fixed !== bullet.text && (
            <button className="btn btn-soft" onClick={() => replace(bullet, fixed)}>
              Fix automatically
            </button>
          )}
        </div>
      ))}

      {ai.ready && bullets.length > 0 && (
        <div className="inline-actions">
          <button
            className="btn btn-secondary"
            onClick={reviewWithAi}
            disabled={aiState === "Reviewing…"}
          >
            Review with AI
          </button>
          {aiState && <span className="muted">{aiState}</span>}
        </div>
      )}
      {aiResult?.reviews.map((review, i) =>
        bullets[i] && review.rewrite && review.rewrite !== bullets[i].text ? (
          <div className="grammar-item" key={i}>
            <p>
              <span className="ai-tag">AI</span> {review.rewrite}
            </p>
            {review.issues.length > 0 && <p className="muted">{review.issues.join(" ")}</p>}
            <button className="btn btn-soft" onClick={() => replace(bullets[i], review.rewrite)}>
              Use this rewrite
            </button>
          </div>
        ) : null,
      )}
    </div>
  );
}
