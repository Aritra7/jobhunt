import TrackerCard from "./TrackerCard";

export default function TrackerBoard({ columns, applications, ...cardHandlers }) {
  return (
    <div className="tracker-board tracker-five">
      {columns.map(({ status, jobs }) => (
        <div className="tracker-col" key={status}>
          <h4>
            {status}
            <span>{jobs.length}</span>
          </h4>
          {jobs.map((job) => (
            <TrackerCard
              key={`${status}-${job.id}`}
              job={job}
              application={applications[job.id]}
              {...cardHandlers}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
