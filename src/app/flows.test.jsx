// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { AppProvider } from "../context/AppProvider";

// PDF/DOCX parsing itself is tested in services/resumeParser.test.js; here the
// parser is stubbed per file name so every UI outcome can be exercised.
vi.mock("../services/resumeParser", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    readResumeFile: async (file) => {
      if (file.name === "resume.pdf") return { kind: "pdf", text: "Skills: Go, Kubernetes" };
      if (file.name === "scanned.pdf") return { kind: "pdf", text: "" };
      if (file.name === "damaged.docx") throw new Error("bad zip");
      return actual.readResumeFile(file);
    },
  };
});

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
const tracked = (jobId) => stored("getajob.tracker").find((a) => a.jobId === jobId);

// Live sources fail in tests, so the 23 sample jobs load; the default
// "United States" region hides the one in London.
const ALL_JOBS = "22 jobs found (23 loaded)";

async function jobCard(company) {
  const cards = await screen.findAllByRole("article");
  const card = cards.find((c) => within(c).queryByText(company, { selector: ".company" }));
  if (!card) throw new Error(`No job card for ${company}`);
  return card;
}

describe("Job Discovery", () => {
  it("searches job descriptions, saves, hides and restores jobs", async () => {
    renderApp("/jobs");
    await screen.findByText(ALL_JOBS);
    expect(screen.getByText(/these are/).textContent).toContain("sample jobs");

    fireEvent.change(screen.getByPlaceholderText("Search title, company, or skill..."), {
      target: { value: "greenfield" },
    });
    expect(screen.getByText("1 jobs found (23 loaded)")).toBeTruthy();
    const card = await jobCard("Startup Hub");

    fireEvent.click(within(card).getByRole("button", { name: "Save" }));
    expect(within(card).getByRole("button", { name: "Saved ✓" })).toBeTruthy();
    expect(tracked("sample:11")).toMatchObject({ status: "saved", company: "Startup Hub" });

    fireEvent.click(within(card).getByRole("button", { name: "Hide" }));
    expect(screen.getByText("0 jobs found (23 loaded)")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Restore Startup Hub" }));
    expect(screen.getByText("1 jobs found (23 loaded)")).toBeTruthy();
  });

  it("filters by region and job type", async () => {
    renderApp("/jobs");
    await screen.findByText(ALL_JOBS);
    fireEvent.change(screen.getByLabelText("Region"), { target: { value: "all" } });
    expect(screen.getByText("23 jobs found (23 loaded)")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Job type"), { target: { value: "Internship" } });
    expect(screen.getByText("8 jobs found (23 loaded)")).toBeTruthy();
  });

  it("opens the details drawer with the sanitized description", async () => {
    renderApp("/jobs");
    const card = await jobCard("Duolingo");
    fireEvent.click(within(card).getByRole("button", { name: "View details" }));
    expect(screen.getByText("JOB DETAILS")).toBeTruthy();
    expect(screen.getByText("Company overview")).toBeTruthy();
    expect(document.querySelector(".job-description li").textContent).toContain(
      "Currently pursuing a technical degree",
    );
    fireEvent.click(screen.getByRole("button", { name: "Save job" }));
    expect(screen.getByLabelText("Application status").value).toBe("saved");
  });

  it("opens a job from its URL", async () => {
    renderApp("/jobs/sample%3A2");
    expect(await screen.findByText("Technology Summer Analyst", { selector: "h2" })).toBeTruthy();
  });

  it("saves preferences, shows matches and applies the saved profile", async () => {
    renderApp("/jobs");
    await screen.findByText(ALL_JOBS);
    fireEvent.click(screen.getByRole("button", { name: /Job preferences/ }));

    fireEvent.change(screen.getByLabelText(/Keywords/), { target: { value: "frontend" } });
    fireEvent.click(screen.getByRole("button", { name: "Save preferences" }));
    expect(screen.getByText(/Preferences saved\./)).toBeTruthy();
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
    await screen.findByText(ALL_JOBS);
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
    expect(screen.getByLabelText("Job").value).toBe("sample:2");

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByLabelText("First name").value).toBe("Alex");
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit application" }));

    expect(await screen.findByText("Application Pipeline")).toBeTruthy();
    expect(tracked("sample:2").status).toBe("applied");
    const applied = screen.getByText("Applied", { selector: "h4" }).closest(".tracker-col");
    expect(within(applied).getByText(/BNY/)).toBeTruthy();
  });

  it("restores a saved draft (saved under an old numeric id)", async () => {
    localStorage.setItem(
      "getajob.drafts",
      JSON.stringify({ 1: { form: { firstName: "Drafty" }, step: 2 } }),
    );
    sessionStorage.setItem("getajob.selectedJob", "sample:1");
    renderApp("/apply");
    expect(await screen.findByText("Saved draft restored for Duolingo.")).toBeTruthy();
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

  it("reads text from .txt and .pdf resumes and shows it", async () => {
    renderApp("/resume-profile");
    upload(new File(["Built  Go services"], "resume.txt", { type: "text/plain" }));
    expect(await screen.findByText(/Loaded text from resume.txt \(3 words\)/)).toBeTruthy();
    expect(stored("getajob.resume").rawText).toBe("Built Go services");

    upload(new File(["%PDF"], "resume.pdf", { type: "application/pdf" }));
    expect(await screen.findByText(/Loaded text from resume.pdf \(3 words\)/)).toBeTruthy();
    expect(screen.getByText("Attached: resume.pdf")).toBeTruthy();
    expect(stored("getajob.resume").rawText).toBe("Skills: Go, Kubernetes");
    expect(screen.getByText("View extracted resume text")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("uses extracted text in the ATS match", async () => {
    renderApp("/resume-profile");
    // BNY asks for Data, which the default resume doesn't mention.
    await screen.findByText(/ATS-STYLE MATCH/);
    fireEvent.change(screen.getByLabelText("Target job"), { target: { value: "sample:2" } });
    expect(screen.getByText("Gap: Data")).toBeTruthy();
    upload(new File(["Built data pipelines"], "resume.txt", { type: "text/plain" }));
    await screen.findByText(/Loaded text from resume.txt/);
    expect(screen.queryByText("Gap: Data")).toBeNull();
  });

  it("explains scanned PDFs, legacy .doc files and unreadable files", async () => {
    renderApp("/resume-profile");
    upload(new File(["x"], "scanned.pdf", { type: "application/pdf" }));
    expect(await screen.findByText(/no selectable text was found/)).toBeTruthy();

    upload(new File(["x"], "old.doc", { type: "application/msword" }));
    expect(await screen.findByText(/Older .doc files can't be read/)).toBeTruthy();
    expect(screen.getByText("Attached: old.doc")).toBeTruthy();

    upload(new File(["x"], "damaged.docx"));
    expect((await screen.findByRole("alert")).textContent).toMatch(/Couldn't read text/);
    expect(stored("getajob.resume")).toMatchObject({ fileName: "damaged.docx", rawText: "" });
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
  it("migrates old applications, moves them between columns and keeps history", () => {
    localStorage.setItem("getajob.applications", JSON.stringify({ 1: { status: "Applied" } }));
    renderApp("/tracker");
    const card = () => document.querySelector(".tracker-card");
    fireEvent.change(within(card()).getByLabelText("Application status"), {
      target: { value: "interviewing" },
    });
    expect(tracked("sample:1").status).toBe("interviewing");
    expect(tracked("sample:1").history.map((h) => h.status)).toEqual(["applied", "interviewing"]);

    fireEvent.change(within(card()).getByPlaceholderText("Reminder"), {
      target: { value: "Email recruiter" },
    });
    expect(screen.getAllByText("Email recruiter").length).toBeGreaterThan(0);
    expect(within(card()).getByLabelText("Interview date and time")).toBeTruthy();
  });

  it("adds an application found elsewhere and warns about deadlines", () => {
    const soon = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    renderApp("/tracker");
    fireEvent.click(screen.getByRole("button", { name: "+ Add application" }));
    fireEvent.change(screen.getByLabelText("Job title *"), { target: { value: "QA Engineer" } });
    fireEvent.change(screen.getByLabelText("Company *"), { target: { value: "Acme" } });
    fireEvent.change(screen.getByLabelText("Deadline"), { target: { value: soon } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    const applied = screen.getByText("Applied", { selector: "h4" }).closest(".tracker-col");
    expect(within(applied).getByText("QA Engineer")).toBeTruthy();
    expect(screen.getByRole("status").textContent).toMatch(/1 deadline in the next 3 days/);
  });

  it("scores a practice answer and records history", async () => {
    renderApp("/interview");
    fireEvent.click((await screen.findAllByRole("button", { name: "Get feedback" }))[0]);
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
    await screen.findByText(ALL_JOBS);
    fireEvent.click(screen.getByRole("button", { name: /Job preferences/ }));
    expect(screen.getByLabelText(/Keywords/).value).toBe("");
  });
});
