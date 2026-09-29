import { useMemo, useState } from "react";
import { jobs } from "../data/jobs";
import { useApp } from "../context/AppContext";
import { analyzeResumeForJob } from "../utils/resumeUtils";
import FeatureBadge from "../components/FeatureBadge";
export default function ResumeProfile() {
  const { profile, setProfile, resume, setResume } = useApp();
  const [jobId, setJobId] = useState(jobs[0].id);
  const [msg, setMsg] = useState("");
  const job = jobs.find((x) => x.id === Number(jobId));
  const analysis = useMemo(() => analyzeResumeForJob(resume, job), [resume, job]);
  const up = (k, v) => setProfile((c) => ({ ...c, [k]: v }));
  const ur = (k, v) => setResume((c) => ({ ...c, [k]: v }));
  function upload(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type.startsWith("text/") || f.name.endsWith(".txt")) {
      const r = new FileReader();
      r.onload = () => {
        setResume((c) => ({ ...c, fileName: f.name, rawText: String(r.result || "") }));
        setMsg(`Loaded text from ${f.name}`);
      };
      r.readAsText(f);
    } else {
      setResume((c) => ({ ...c, fileName: f.name }));
      setMsg(`${f.name} attached. PDF/DOCX parsing would be a later backend integration.`);
    }
  }
  return (
    <>
      <section className="card">
        <div className="card-header">
          <div>
            <div className="title-with-badge">
              <h3>Profile</h3>
              <FeatureBadge release="V1" />
            </div>
            <p>Your profile powers autofill, matching, and recommendations.</p>
          </div>
        </div>
        <div className="form-grid">
          <label>
            Full name
            <input value={profile.name} onChange={(e) => up("name", e.target.value)} />
          </label>
          <label>
            Location
            <input value={profile.location} onChange={(e) => up("location", e.target.value)} />
          </label>
          <label>
            Email
            <input value={profile.email} onChange={(e) => up("email", e.target.value)} />
          </label>
          <label>
            Phone
            <input value={profile.phone} onChange={(e) => up("phone", e.target.value)} />
          </label>
        </div>
        <label>
          Skills
          <input
            value={profile.skills.join(", ")}
            onChange={(e) =>
              up(
                "skills",
                e.target.value
                  .split(",")
                  .map((x) => x.trim())
                  .filter(Boolean),
              )
            }
          />
        </label>
        <label>
          Target roles
          <input
            value={profile.targetRoles.join(", ")}
            onChange={(e) =>
              up(
                "targetRoles",
                e.target.value
                  .split(",")
                  .map((x) => x.trim())
                  .filter(Boolean),
              )
            }
          />
        </label>
      </section>
      <section className="card">
        <div className="card-header">
          <div>
            <div className="title-with-badge">
              <h3>Resume Builder & Optimization</h3>
              <FeatureBadge release="V1" />
              <FeatureBadge release="V2" />
            </div>
            <p>
              Build the base resume in V1, then use match analysis and optimization suggestions as
              V2 intelligence.
            </p>
          </div>
        </div>
        <div className="upload-row">
          <label className="file-upload">
            Upload existing resume
            <input type="file" accept=".txt,.pdf,.doc,.docx" onChange={upload} />
          </label>
          <div className="upload-status">
            {resume.fileName ? `Attached: ${resume.fileName}` : "No resume attached"}
          </div>
        </div>
        {msg && <div className="info-box">{msg}</div>}
        <div className="resume-layout">
          <div className="stack">
            <label>
              Target job
              <select value={jobId} onChange={(e) => setJobId(Number(e.target.value))}>
                {jobs.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.title} — {x.company}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Professional summary
              <textarea value={resume.summary} onChange={(e) => ur("summary", e.target.value)} />
            </label>
            <label>
              Resume skills
              <input
                value={resume.skills.join(", ")}
                onChange={(e) =>
                  ur(
                    "skills",
                    e.target.value
                      .split(",")
                      .map((x) => x.trim())
                      .filter(Boolean),
                  )
                }
              />
            </label>
            <label>
              Experience highlights
              <textarea
                value={resume.experience}
                onChange={(e) => ur("experience", e.target.value)}
              />
            </label>
            <div className="analysis-box">
              <div className="analysis-heading">
                <div>
                  <div className="eyebrow">ATS-STYLE MATCH</div>
                  <strong>
                    {job.title} · {job.company}
                  </strong>
                </div>
                <div className="analysis-score">{analysis.atsScore}%</div>
              </div>
              <div className="chips">
                {analysis.matched.map((s) => (
                  <span className="chip success" key={s}>
                    {s}
                  </span>
                ))}
                {analysis.missing.map((s) => (
                  <span className="chip warning" key={s}>
                    Gap: {s}
                  </span>
                ))}
              </div>
              <div className="suggestion-list">
                {analysis.suggestions.map((s) => (
                  <div key={s}>• {s}</div>
                ))}
              </div>
            </div>
          </div>
          <div className="resume-preview">
            <h2>{profile.name}</h2>
            <div className="muted">
              {profile.email} · {profile.phone} · {profile.location}
            </div>
            <h4>Summary</h4>
            <p>{resume.summary}</p>
            <h4>Skills</h4>
            <p>{resume.skills.join(" · ")}</p>
            <h4>Experience</h4>
            <p>{resume.experience}</p>
            <h4>Links</h4>
            <p>
              {profile.linkedIn} · {profile.github}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
