import { Link } from "react-router-dom";
import SectionCard from "../common/SectionCard";
import { recommendationScore } from "../../utils/jobUtils";

export default function RecommendedList({ jobs, profile }) {
  return (
    <SectionCard
      as="div"
      title="Recommended for you"
      description="Recommendations combine skills, location, work mode, and salary preferences."
      actions={
        <Link className="text-link" to="/jobs">
          See all jobs →
        </Link>
      }
    >
      <div className="recommendation-list">
        {jobs.map((job) => (
          <div className="recommendation-row" key={job.id}>
            <div>
              <strong>{job.title}</strong>
              <span>
                {job.company} · {job.location}
              </span>
            </div>
            <div className="recommendation-score">{recommendationScore(job, profile)}%</div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
