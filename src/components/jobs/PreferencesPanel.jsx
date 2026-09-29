import ListInput from "../common/ListInput";

export default function PreferencesPanel({ profile, setProfile }) {
  return (
    <div className="preference-panel">
      <label>
        Minimum hourly pay
        <input
          type="number"
          value={profile.minSalary}
          onChange={(e) => setProfile((p) => ({ ...p, minSalary: Number(e.target.value || 0) }))}
        />
      </label>
      <label>
        Preferred work modes
        <ListInput
          value={profile.preferredModes}
          onChange={(list) => setProfile((p) => ({ ...p, preferredModes: list }))}
        />
      </label>
    </div>
  );
}
