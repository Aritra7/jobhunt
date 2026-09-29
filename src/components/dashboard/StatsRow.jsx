// `stats` is a list of [label, value] pairs.
export default function StatsRow({ stats }) {
  return (
    <section className="stats">
      {stats.map(([label, value]) => (
        <div className="stat" key={label}>
          <div className="value">{value}</div>
          <div className="label">{label}</div>
        </div>
      ))}
    </section>
  );
}
