// Live-data status for Job Discovery: sample fallback, or some sources down.
export default function JobsStatusBanner({ jobsData }) {
  const { status, errors, retry } = jobsData;
  if (status === "sample") {
    return (
      <div className="notice-box" role="status">
        Live job sources aren't responding, so these are <strong>sample jobs</strong>.{" "}
        <button className="link-btn" onClick={retry}>
          Try live jobs again
        </button>
      </div>
    );
  }
  if (status === "ready" && errors.length > 0) {
    return (
      <div className="notice-box" role="status">
        Some sources didn't respond ({errors.map((e) => e.source).join(", ")}). Showing results from
        the rest.{" "}
        <button className="link-btn" onClick={retry}>
          Retry
        </button>
      </div>
    );
  }
  return null;
}
