import ListInput from "../common/ListInput";

export default function ResumeEditor({ resume, setResume }) {
  const update = (key, value) => setResume((current) => ({ ...current, [key]: value }));

  return (
    <>
      <label>
        Professional summary
        <textarea value={resume.summary} onChange={(e) => update("summary", e.target.value)} />
      </label>
      <label>
        Resume skills
        <ListInput value={resume.skills} onChange={(list) => update("skills", list)} />
      </label>
      <label>
        Experience highlights
        <textarea
          value={resume.experience}
          onChange={(e) => update("experience", e.target.value)}
        />
      </label>
    </>
  );
}
