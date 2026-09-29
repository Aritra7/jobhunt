import TrackerCard from "./TrackerCard";

export default function TrackerBoard({ columns, onUpdate, onRemove }) {
  return (
    <div className="tracker-board tracker-five">
      {columns.map(({ status, label, applications }) => (
        <div className="tracker-col" key={status}>
          <h4>
            {label}
            <span>{applications.length}</span>
          </h4>
          {applications.map((app) => (
            <TrackerCard key={app.id} application={app} onUpdate={onUpdate} onRemove={onRemove} />
          ))}
        </div>
      ))}
    </div>
  );
}
