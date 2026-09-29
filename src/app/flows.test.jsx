// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { AppProvider } from "../context/AppProvider";

afterEach(cleanup);

function renderApp(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppProvider>
        <App />
      </AppProvider>
    </MemoryRouter>,
  );
}

const stored = (key) => JSON.parse(localStorage.getItem(key));

async function jobCard(company) {
  const cards = await screen.findAllByRole("article");
  const card = cards.find((c) => within(c).queryByText(company, { selector: ".company" }));
  if (!card) throw new Error(`No job card for ${company}`);
  return card;
}

describe("Job Discovery", () => {
  it("searches job descriptions, saves, hides and restores jobs", async () => {
    renderApp("/jobs");
    await screen.findByText("23 jobs found");

    fireEvent.change(screen.getByPlaceholderText("Search title, company, or skill..."), {
      target: { value: "greenfield" },
    });
    expect(screen.getByText("1 jobs found")).toBeTruthy();
    const card = await jobCard("Startup Hub");

    fireEvent.click(within(card).getByRole("button", { name: "Save" }));
    expect(within(card).getByRole("button", { name: "Saved ✓" })).toBeTruthy();
    expect(stored("getajob.saved")).toEqual([11]);

    fireEvent.click(within(card).getByRole("button", { name: "Hide" }));
    expect(screen.getByText("0 jobs found")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Restore Startup Hub" }));
    expect(screen.getByText("1 jobs found")).toBeTruthy();
  });

  it("opens the details drawer", async () => {
    renderApp("/jobs");
    const card = await jobCard("Duolingo");
    fireEvent.click(within(card).getByRole("button", { name: "View details" }));
    expect(screen.getByText("JOB DETAILS")).toBeTruthy();
    expect(screen.getByText("Company overview")).toBeTruthy();
  });

  it("saves preferences, shows matches and applies the saved profile", async () => {
    renderApp("/jobs");
    await screen.findByText("23 jobs found");
    fireEvent.click(screen.getByRole("button", { name: /Job preferences/ }));

    fireEvent.change(screen.getByLabelText(/Keywords/), { target: { value: "frontend" } });
    fireEvent.click(screen.getByRole("button", { name: "Save preferences" }));
    expect(screen.getByRole("status").textContent).toContain("Preferences saved.");
    expect(stored("getajob.profile").keywords).toEqual(["frontend"]);

    expect(screen.getByText("Matched for you")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Use saved profile" }));
    expect(screen.getByPlaceholderText("Search title, company, or skill...").value).toBe(
      "frontend",
    );

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(stored("getajob.profile").keywords).toEqual([]);
    expect(screen.queryByText("Matched for you")).toBeNull();
  });

  it("toggles preferred work modes", async () => {
    renderApp("/jobs");
    await screen.findByText("23 jobs found");
    fireEvent.click(screen.getByRole("button", { name: /Job preferences/ }));
    fireEvent.click(screen.getByRole("button", { name: "On-site", pressed: false }));
    fireEvent.click(screen.getByRole("button", { name: "Save preferences" }));
    expect(stored("getajob.profile").preferredModes).toEqual(["Hybrid", "Remote", "On-site"]);
  });
});

describe("Job Application", () => {
  it("applies from Job Discovery and lands in the tracker as Applied", async () => {
    renderApp("/jobs");
    fireEvent.click(within(await jobCard("BNY")).getByRole("button", { name: "Apply" }));

    expect(await screen.findByText("Guided Job Application")).toBeTruthy();
    expect(screen.getByLabelText("Job").value).toBe("2");

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByLabelText("First name").value).toBe("Alex");
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit application" }));

    expect(await screen.findByText("Application Pipeline")).toBeTruthy();
    expect(stored("getajob.applications")[2].status).toBe("Applied");
    const applied = screen.getByText("Applied", { selector: "h4" }).closest(".tracker-col");
    expect(within(applied).getByText("BNY")).toBeTruthy();
  });

  it("restores a saved draft", () => {
    localStorage.setItem(
      "getajob.drafts",
      JSON.stringify({ 1: { form: { firstName: "Drafty" }, step: 2 } }),
    );
    renderApp("/apply");
    expect(screen.getByText("Saved draft restored for Duolingo.")).toBeTruthy();
    expect(screen.getByLabelText("First name").value).toBe("Drafty");
  });
});

describe("Resume & Profile", () => {
  function upload(file) {
    fireEvent.change(screen.getByLabelText(/Upload existing resume/), {
      target: { files: [file] },
    });
  }

  it("rejects wrong file types and files over 5 MB (SEC-2)", () => {
    renderApp("/resume-profile");
    upload(new File(["x"], "photo.png", { type: "image/png" }));
    expect(screen.getByRole("alert").textContent).toMatch(/Invalid file type/);

    const big = new File(["x"], "resume.pdf", { type: "application/pdf" });
    Object.defineProperty(big, "size", { value: 5 * 1024 * 1024 + 1 });
    upload(big);
    expect(screen.getByRole("alert").textContent).toMatch(/Maximum size is 5 MB/);
    expect(screen.getByText("No resume attached")).toBeTruthy();
  });

  it("reads .txt resumes and attaches PDFs", async () => {
    renderApp("/resume-profile");
    upload(new File(["Built Go services"], "resume.txt", { type: "text/plain" }));
    expect(await screen.findByText("Loaded text from resume.txt")).toBeTruthy();
    expect(stored("getajob.resume").rawText).toBe("Built Go services");

    upload(new File(["%PDF"], "resume.pdf", { type: "application/pdf" }));
    expect(screen.getByText("Attached: resume.pdf")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("lets a comma be typed in list fields", () => {
    renderApp("/resume-profile");
    const skills = screen.getByLabelText("Skills");
    fireEvent.change(skills, { target: { value: "React, " } });
    expect(skills.value).toBe("React, ");
    fireEvent.change(skills, { target: { value: "React, Go" } });
    expect(stored("getajob.profile").skills).toEqual(["React", "Go"]);
  });

  it("switches resume templates", () => {
    const { container } = renderApp("/resume-profile");
    expect(container.querySelector(".resume-preview.template-modern")).toBeTruthy();
    fireEvent.click(screen.getByRole("radio", { name: "Classic Professional" }));
    expect(container.querySelector(".resume-preview.template-classic")).toBeTruthy();
    expect(stored("getajob.resume").template).toBe("classic");
  });
});

describe("Tracker, interview and saved data", () => {
  it("moves a tracked job between columns and keeps notes", () => {
    localStorage.setItem("getajob.applications", JSON.stringify({ 1: { status: "Applied" } }));
    renderApp("/tracker");
    const card = screen.getByText("Duolingo").closest(".tracker-card");
    fireEvent.change(within(card).getByRole("combobox"), { target: { value: "Interview" } });
    expect(stored("getajob.applications")[1].status).toBe("Interview");

    const moved = screen.getByText("Duolingo").closest(".tracker-card");
    fireEvent.change(within(moved).getByPlaceholderText("Reminder"), {
      target: { value: "Email recruiter" },
    });
    expect(screen.getAllByText("Email recruiter").length).toBeGreaterThan(0);
  });

  it("scores a practice answer and records history", () => {
    renderApp("/interview");
    fireEvent.click(screen.getAllByRole("button", { name: "Get feedback" })[0]);
    expect(screen.getByText("0/100", { selector: ".feedback-score" })).toBeTruthy();
    expect(stored("getajob.interviewHistory")).toHaveLength(1);
  });

  it("migrates preferences saved by the old JobFind app", async () => {
    localStorage.setItem(
      "jobfind.profile",
      JSON.stringify({ keywords: ["designer"], preferredLocation: "Seattle, WA" }),
    );
    renderApp("/jobs");
    expect(await screen.findByText("Matched for you")).toBeTruthy();
    expect(stored("getajob.profile").keywords).toEqual(["designer"]);
    expect(stored("getajob.profile").preferredLocations).toContain("Seattle, WA");
    expect(localStorage.getItem("jobfind.profile")).toBeNull();
  });

  it("loads a profile saved before keywords existed", async () => {
    const { keywords: _unused, ...oldProfile } = {
      ...JSON.parse(JSON.stringify((await import("../data/profile")).defaultProfile)),
    };
    localStorage.setItem("getajob.profile", JSON.stringify(oldProfile));
    renderApp("/jobs");
    await screen.findByText("23 jobs found");
    fireEvent.click(screen.getByRole("button", { name: /Job preferences/ }));
    expect(screen.getByLabelText(/Keywords/).value).toBe("");
  });
});
