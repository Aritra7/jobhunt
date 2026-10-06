import { SPONSORSHIP_LABELS } from "../../utils/jobPerks";

// Green when the posting offers sponsorship, amber when it rules it out.
// Nothing is shown when the posting doesn't say, unless `showUnknown`.
export default function SponsorshipChip({ sponsorship, showUnknown = false }) {
  const status = sponsorship?.status || "unknown";
  if (status === "unknown" && !showUnknown) return null;
  const variant = { offered: " success", "not-offered": " warning", unknown: "" }[status];
  return <span className={`chip${variant}`}>{SPONSORSHIP_LABELS[status]}</span>;
}
