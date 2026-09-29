import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { AppProvider } from "./context/AppContext";

function renderAt(path) {
  return renderToString(
    <MemoryRouter initialEntries={[path]}>
      <AppProvider>
        <App />
      </AppProvider>
    </MemoryRouter>,
  );
}

// Every route must render without throwing and show its own heading.
const routes = [
  ["/", "One place to find, apply, track, and prepare."],
  ["/jobs", "Find opportunities"],
  ["/resume-profile", "Resume Builder &amp; Optimization"],
  ["/apply", "Guided Job Application"],
  ["/tracker", "Application Pipeline"],
  ["/interview", "Interview Practice"],
  ["/insights", "Role &amp; Company Insights"],
  ["/releases", "Feature Decomposition"],
];

describe("app smoke test", () => {
  it.each(routes)("renders %s", (path, text) => {
    expect(renderAt(path)).toContain(text);
  });

  it("renders the dashboard for an unknown path", () => {
    expect(() => renderAt("/does-not-exist")).not.toThrow();
  });

  it("renders with data saved by an earlier session", () => {
    localStorage.setItem("getajob.saved", JSON.stringify([1, 2]));
    localStorage.setItem(
      "getajob.applications",
      JSON.stringify({ 1: { status: "Interview", deadline: "2026-10-01", reminder: "Follow up" } }),
    );
    expect(renderAt("/tracker")).toContain("Follow up");
    expect(renderAt("/")).toContain("Interview stage");
  });
});
