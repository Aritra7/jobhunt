import { templateById } from "../../data/resumeTemplates";
import { bulletLines, resumeSkills } from "../../hooks/useResume";

const range = (start, end) => [start, end].filter(Boolean).join(" – ");

// Live, printable preview of the structured resume in the chosen template.
// Everything is rendered as React text, so resume content can't inject markup.
export default function ResumePreview({ resume, template: templateId }) {
  const template = templateById(templateId);
  const { contact } = resume;
  const contactLine = [contact.email, contact.phone, contact.location, contact.linkedin].filter(
    Boolean,
  );
  const skills = resumeSkills(resume);

  return (
    <div
      id="resume-print-area"
      className={`resume-preview template-${template.id}`}
      style={/** @type {import("react").CSSProperties} */ ({ "--template-color": template.color })}
    >
      <h2>{contact.name || "Your name"}</h2>
      <div className="muted">{contactLine.join(" · ")}</div>
      {resume.summary && (
        <>
          <h4>Summary</h4>
          <p>{resume.summary}</p>
        </>
      )}
      {skills.length > 0 && (
        <>
          <h4>Skills</h4>
          <p>{skills.join(" · ")}</p>
        </>
      )}
      {resume.experience.length > 0 && (
        <>
          <h4>Experience</h4>
          {resume.experience.map((exp) => (
            <div className="preview-entry" key={exp.id}>
              <div className="preview-entry-head">
                <strong>
                  {exp.title}
                  {exp.company && `, ${exp.company}`}
                </strong>
                <span>{range(exp.start, exp.end)}</span>
              </div>
              <ul>
                {bulletLines(exp.bulletsText).map((bullet, i) => (
                  <li key={i}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}
      {resume.education.length > 0 && (
        <>
          <h4>Education</h4>
          {resume.education.map((edu) => (
            <div className="preview-entry-head" key={edu.id}>
              <span>
                <strong>{edu.school}</strong>
                {edu.degree && ` — ${edu.degree}`}
              </span>
              <span>{range(edu.start, edu.end)}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
