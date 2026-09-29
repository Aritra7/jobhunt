export default function SaveButton({ saved, onClick, label = "Save" }) {
  return (
    <button className={`btn ${saved ? "btn-success" : "btn-secondary"}`} onClick={onClick}>
      {saved ? "Saved ✓" : label}
    </button>
  );
}
