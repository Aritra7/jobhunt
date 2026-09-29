import FeatureBadge from "./FeatureBadge";

/**
 * The card + header layout used by every page section.
 * `badges` lists release tags ("V1", "V2") shown next to the title.
 * @param {{
 *   title: string,
 *   description?: string,
 *   badges?: string[],
 *   actions?: import('react').ReactNode,
 *   compact?: boolean,
 *   as?: 'section' | 'div',
 *   children?: import('react').ReactNode,
 * }} props
 */
export default function SectionCard({
  title,
  description,
  badges = [],
  actions,
  compact = false,
  as: Tag = "section",
  children,
}) {
  return (
    <Tag className={compact ? "card compact-card" : "card"}>
      <div className="card-header">
        <div>
          {badges.length > 0 ? (
            <div className="title-with-badge">
              <h3>{title}</h3>
              {badges.map((release) => (
                <FeatureBadge key={release} release={release} />
              ))}
            </div>
          ) : (
            <h3>{title}</h3>
          )}
          {description && <p>{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </Tag>
  );
}
