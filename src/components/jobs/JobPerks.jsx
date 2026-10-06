import SponsorshipChip from "./SponsorshipChip";

// Job details: visa sponsorship (with the sentence it came from) and benefits
// detected in the posting.
export default function JobPerks({ job }) {
  const benefits = job.benefits || [];
  return (
    <div>
      <div className="chips">
        <SponsorshipChip sponsorship={job.sponsorship} showUnknown />
        {benefits.map((b) => (
          <span className="chip accent" key={b}>
            {b}
          </span>
        ))}
        {benefits.length === 0 && <span className="chip">No benefits listed</span>}
      </div>
      {job.sponsorship?.evidence && <p className="perks-evidence">“{job.sponsorship.evidence}”</p>}
    </div>
  );
}
