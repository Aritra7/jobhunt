export const decomposition = [
  {
    feature: "Job Discovery",
    v1: [
      "Keyword Search",
      "Location Filter",
      "Remote / Onsite Filter",
      "View Job Details",
      "Company Overview",
      "Save / Hide Jobs",
    ],
    v2: [
      "Salary Filter",
      "Set Job Preferences",
      "Skill-Based Matching",
      "Recommended Jobs",
      "Personalized Recommendations",
    ],
  },
  {
    feature: "Resume & Profile",
    v1: ["Create / Edit Profile", "Upload Resume", "Resume Builder", "Basic Job Match"],
    v2: [
      "ATS-Style Score",
      "Skill Gap Detection",
      "Job-Specific Resume Suggestions",
      "Resume Optimization",
      "Project Library",
      "Role-Styled Project Bullets (SDE / FDE / AI / MLE)",
      "Tailored Resume Generator",
    ],
  },
  {
    feature: "Job Application",
    v1: ["Select Job", "Autofill Profile Data", "Screening Questions", "Review & Submit"],
    v2: ["Save Draft", "Reusable Answers", "Autofill Across Applications", "Application Templates"],
  },
  {
    feature: "Application Tracker",
    v1: ["Saved", "Applied", "Interview", "Offer", "Rejected"],
    v2: ["Deadlines", "Reminders", "Follow-Up Notes", "Status Analytics"],
  },
  {
    feature: "Interview Preparation",
    v1: ["Common Questions", "Job-Specific Questions", "Behavioral Practice", "Technical Practice"],
    v2: ["Mock Interview", "Answer Scoring", "AI Feedback", "Improvement History"],
  },
  {
    feature: "Career Insights",
    v1: ["Company Overview", "Salary Range", "Required Skills", "Job / Profile Match"],
    v2: ["Skill Gap Analysis", "Role Comparison", "Career Trends", "Personalized Career Insights"],
  },
];
export const releaseGoals = {
  v1: "Smallest usable end-to-end release: discover a job, prepare materials, apply, track progress, and prepare for an interview.",
  v2: "Smarter and more personalized release: reduce manual work through recommendations, automation, deeper matching, and feedback.",
};

export const strategy = [
  [
    "V1 proves the workflow",
    "A user can discover a role, prepare materials, apply, track it, and prepare for an interview.",
  ],
  [
    "V2 removes friction",
    "Recommendations, reusable answers, reminders, scoring, and deeper insights make the workflow faster and smarter.",
  ],
  [
    "Technical debt stays visible",
    "The prototype intentionally uses mock job data, browser storage, and simplified scoring so debt can be added transparently to the backlog.",
  ],
];
