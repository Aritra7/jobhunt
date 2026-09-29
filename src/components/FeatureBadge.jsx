export default function FeatureBadge({release="V1"}){return <span className={`feature-badge ${release.toLowerCase()}`}>{release}</span>}
