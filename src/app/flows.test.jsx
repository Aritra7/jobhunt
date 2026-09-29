// @vitest-environment jsdom
// @ts-nocheck -- DOM queries here return generic elements; the app code itself is type-checked.
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { AppProvider } from "../context/AppProvider";

// Turning resume text into fields is tested in __tests__/parseResume.test.js;
// here PDF/Word text extraction is stubbed per file name.
const RESUME_TEXT = `Jordan Rivera
jordan@example.com | (412) 555-0100 | Pittsburgh, PA
SUMMARY
Engineer who ships reliable web apps and data tools used by students every week.
SKILLS
React, Go, Kubernetes, SQL
EXPERIENCE
Software Engineer Intern, Acme Corp   Jun 2025 – Aug 2025
• Built a React dashboard used by 200 students weekly
EDUCATION
Carnegie Mellon University — MS Computer Science   2024 – 2026`;

vi.mock("../api/resumeText", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    extractResumeText: async (file) => {
      if (file.name === "resume.pdf") return RESUME_TEXT;
      if (file.name === "scanned.pdf") return "";
      if (file.name === "damaged.docx") throw new Error("This file's contents aren't a real PDF");
      return actual.extractResumeText(file);
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
    fireEvent.change(document.querySelector("#resume-upload"), { target: { files: [file] } });
  }

  it("rejects wrong file types, old .doc files and files over 5 MB (SEC-2)", () => {
    renderApp("/resume-profile/upload");
    upload(new File(["x"], "photo.png", { type: "image/png" }));
    expect(screen.getByRole("alert").textContent).toMatch(/Please upload a .pdf, .docx or .txt/);
    upload(new File(["x"], "old.doc", { type: "application/msword" }));
    expect(screen.getByRole("alert").textContent).toMatch(/Save it as .docx or PDF/);
    const big = new File(["x"], "resume.pdf", { type: "application/pdf" });
    Object.defineProperty(big, "size", { value: 5 * 1024 * 1024 + 1 });
    upload(big);
    expect(screen.getByRole("alert").textContent).toMatch(/Maximum size is 5 MB/);
  });

  it("imports a resume into the builder and the profile", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    renderApp("/resume-profile/upload");
    upload(new File(["%PDF"], "resume.pdf", { type: "application/pdf" }));
    expect(await screen.findByText("Found in resume.pdf")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Replace builder with this" }));
    expect(screen.getByText(/Builder filled from resume.pdf/)).toBeTruthy();

    expect(stored("getajob.profile")).toMatchObject({
      name: "Jordan Rivera",
      email: "jordan@example.com",
    });
    const resume = stored("getajob.resume");
    expect(resume.skillsText).toContain("Kubernetes");
    expect(resume.experience[0]).toMatchObject({ company: "Acme Corp" });
    expect(resume.education[0].school).toContain("Carnegie Mellon");

    fireEvent.click(screen.getByRole("button", { name: /Review it in the Builder/ }));
    expect(document.querySelector("#resume-print-area").textContent).toContain("Acme Corp");
  });

  it("explains scanned PDFs and unreadable files", async () => {
    renderApp("/resume-profile/upload");
    upload(new File(["x"], "scanned.pdf", { type: "application/pdf" }));
    expect((await screen.findByRole("alert")).textContent).toMatch(/No text found/);
    upload(new File(["x"], "damaged.docx"));
    expect((await screen.findByRole("alert")).textContent).toMatch(/aren't a real PDF/);
  });

  it("scores the resume against a tracked job and adds a missing skill", async () => {
    localStorage.setItem("getajob.saved", JSON.stringify([15])); // Data Scientist, migrated
    renderApp("/resume-profile/ats");
    expect(screen.getByLabelText("Target job").value).not.toBe("paste");
    expect(screen.getByLabelText(/ATS score/)).toBeTruthy();
    const missing = screen.getByRole("button", { name: "+ TensorFlow" });
    fireEvent.click(missing);
    expect(stored("getajob.resume").skillsText).toContain("TensorFlow");
  });

  it("lets a comma be typed in list fields", () => {
    renderApp("/resume-profile");
    const skills = screen.getByLabelText("Skills");
    fireEvent.change(skills, { target: { value: "React, " } });
    expect(skills.value).toBe("React, ");
    fireEvent.change(skills, { target: { value: "React, Go" } });
    expect(stored("getajob.profile").skills).toEqual(["React", "Go"]);
  });

  it("switches resume templates and keeps the tab in the URL", () => {
    renderApp("/resume-profile");
    expect(document.querySelector(".resume-preview.template-modern")).toBeTruthy();
    fireEvent.click(screen.getByRole("radio", { name: "Classic Professional" }));
    expect(document.querySelector(".resume-preview.template-classic")).toBeTruthy();
    expect(stored("getajob.template")).toBe("classic");
    fireEvent.click(screen.getByRole("tab", { name: "Bullet check" }));
    expect(screen.getByText(/bullets? look strong/)).toBeTruthy();
    fireEvent.click(screen.getByRole("tab", { name: "Autofill kit" }));
    expect(screen.getByText("Alex")).toBeTruthy();
  });

  it("migrates a resume saved by the first version", () => {
    localStorage.setItem(
      "getajob.resume",
      JSON.stringify({
        summary: "Old",
        skills: ["Go"],
        experience: "Did things",
        template: "creative",
      }),
    );
    renderApp("/resume-profile");
    expect(stored("getajob.resume")).toMatchObject({ summary: "Old", skillsText: "Go" });
    expect(stored("getajob.resume").experience[0].bulletsText).toBe("Did things");
    expect(document.querySelector(".resume-preview.template-creative")).toBeTruthy();
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
    renderApp("/interview/job");
    fireEvent.click((await screen.findAllByRole("button", { name: "Get feedback" }))[0]);
    expect(screen.getByText("0/100", { selector: ".feedback-score" })).toBeTruthy();
    expect(stored("getajob.interviewHistory")).toHaveLength(1);
  });

  it("has a question bank with saved answers and an interview planner", () => {
    localStorage.setItem("getajob.saved", JSON.stringify([1]));
    renderApp("/interview/practice");
    fireEvent.change(screen.getByPlaceholderText(/Draft your answer here/), {
      target: { value: "I led a project." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save answer" }));
    expect(Object.values(stored("getajob.practiceAnswers"))[0][0].text).toBe("I led a project.");

    fireEvent.click(screen.getByRole("tab", { name: "Interview planner" }));
    fireEvent.change(screen.getByLabelText("Interview date & time"), {
      target: { value: "2026-12-01T10:00" },
    });
    expect(tracked("sample:1").status).toBe("interviewing");
    expect(screen.getByText(/Write and rehearse 3 STAR stories/)).toBeTruthy();
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
