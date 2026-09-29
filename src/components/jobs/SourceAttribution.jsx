const SOURCES = [
  ["Greenhouse", "https://www.greenhouse.com"],
  ["Jobicy", "https://jobicy.com"],
  ["The Muse", "https://www.themuse.com"],
  ["Remotive", "https://remotive.com"],
  ["Arbeitnow", "https://www.arbeitnow.com"],
];

// The job sources' terms require crediting them.
export default function SourceAttribution() {
  return (
    <p className="attribution">
      Live jobs from{" "}
      {SOURCES.map(([name, url], i) => (
        <span key={name}>
          {i > 0 && (i === SOURCES.length - 1 ? " and " : ", ")}
          <a href={url} target="_blank" rel="noopener noreferrer">
            {name}
          </a>
        </span>
      ))}
      .
    </p>
  );
}
