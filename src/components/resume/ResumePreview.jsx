import { templateById } from "../../data/resumeTemplates";

export default function ResumePreview({ profile, resume }) {
  const template = templateById(resume.template);
  return (
    <div
      className={`resume-preview template-${template.id}`}
      style={{ "--template-color": template.color }}
    >
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
  );
}
