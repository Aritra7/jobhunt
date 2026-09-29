import ListInput from "../common/ListInput";
import SectionCard from "../common/SectionCard";

const CONTACT_FIELDS = [
  ["name", "Full name"],
  ["location", "Location"],
  ["email", "Email"],
  ["phone", "Phone"],
];

export default function ProfileForm({ profile, setProfile }) {
  const update = (key, value) => setProfile((current) => ({ ...current, [key]: value }));

  return (
    <SectionCard
      title="Profile"
      badges={["V1"]}
      description="Your profile powers autofill, matching, and recommendations."
    >
      <div className="form-grid">
        {CONTACT_FIELDS.map(([key, label]) => (
          <label key={key}>
            {label}
            <input value={profile[key]} onChange={(e) => update(key, e.target.value)} />
          </label>
        ))}
      </div>
      <label>
        Skills
        <ListInput value={profile.skills} onChange={(list) => update("skills", list)} />
      </label>
      <label>
        Target roles
        <ListInput value={profile.targetRoles} onChange={(list) => update("targetRoles", list)} />
      </label>
    </SectionCard>
  );
}
