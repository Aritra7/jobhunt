import { roleById } from "../../data/roleStyles";
import { formatDateTime } from "../../utils/format";

// Saved tailored-resume versions (role, job text and chosen projects). They
// are rebuilt from the project library, so later bullet edits show up.
export default function SavedVariants({ variants, onLoad, onRemove }) {
  if (variants.length === 0) return null;
  return (
    <div>
      <h4>Saved versions</h4>
      <div className="reminder-list">
        {variants.map((variant) => (
          <div className="reminder-row" key={variant.id}>
            <div>
              <strong>{variant.name}</strong>
              <span>
                {roleById(variant.roleId).name} · {variant.projectIds.length} projects ·{" "}
                {formatDateTime(variant.createdAt)}
              </span>
            </div>
            <div className="inline-actions">
              <button className="link-btn" onClick={() => onLoad(variant)}>
                Open
              </button>
              <button className="link-btn danger" onClick={() => onRemove(variant.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
