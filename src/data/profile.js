export const defaultProfile = {
  name: "Alex Chen",
  email: "alex.chen@email.com",
  phone: "(412) 555-0188",
  location: "Pittsburgh, PA",
  targetRoles: ["Software Engineer Intern", "Technology Intern"],
  // Free-text search terms matched against job title, company and description.
  keywords: [],
  preferredLocations: ["Pittsburgh, PA", "Remote"],
  preferredModes: ["Hybrid", "Remote"],
  jobTypes: [], // e.g. ["Internship"]; empty = any
  minSalary: 30,
  skills: ["React", "TypeScript", "JavaScript", "Python", "SQL", "AWS"],
  workAuthorization: "Authorized to work in the United States",
  linkedIn: "linkedin.com/in/alexchen",
  github: "github.com/alexchen",
};

// Starting resume content (Prithvi's structured shape). Contact details come
// from the profile above.
export const defaultResume = {
  summary:
    "Computer science graduate student focused on software engineering, product development, and practical AI-enabled systems.",
  skillsText: "React, TypeScript, JavaScript, Python, SQL, AWS, Docker, REST APIs",
  experience: [
    {
      id: "default-experience",
      title: "Software Engineering Projects",
      company: "",
      start: "",
      end: "",
      bulletsText:
        "Built React and TypeScript interfaces, Python services, SQL-backed applications, AWS deployments, Docker workflows, and software engineering projects.",
    },
  ],
  education: [],
};

export const defaultAnswers = {
  whyInterested:
    "I’m interested in this role because it combines hands-on software engineering with a product environment where I can contribute quickly and keep learning.",
  workAuthorization: "Yes",
};
