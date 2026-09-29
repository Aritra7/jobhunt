import { fullTimeJobs } from "./fullTimeJobs";

// Internship roles from the original Get a Job prototype.
const internshipJobs = [
  {
    id: 1,
    title: "Software Engineer Intern",
    company: "Duolingo",
    location: "Pittsburgh, PA",
    mode: "Hybrid",
    type: "Internship",
    salaryMin: 40,
    salaryMax: 44,
    posted: "2 days ago",
    skills: ["React", "JavaScript", "Python", "Product"],
    description:
      "Build user-facing product features, run experiments, and improve learning experiences used at scale.",
    requirements: [
      "Currently pursuing a technical degree",
      "Programming experience in JavaScript, Python, or a similar language",
      "Strong problem-solving and communication skills",
    ],
    companyInsights: {
      industry: "Education Technology",
      size: "Large technology company",
      culture: "Product-focused, experimental, collaborative",
      note: "Strong fit for engineers who enjoy consumer products and rapid experimentation.",
    },
  },
  {
    id: 2,
    title: "Technology Summer Analyst",
    company: "BNY",
    location: "Pittsburgh, PA",
    mode: "Hybrid",
    type: "Internship",
    salaryMin: 36,
    salaryMax: 40,
    posted: "1 day ago",
    skills: ["Python", "SQL", "APIs", "Data"],
    description:
      "Support engineering teams building platforms, data services, and enterprise technology used across financial products.",
    requirements: [
      "Pursuing Computer Science, Information Systems, or related field",
      "Programming experience in Python, Java, or similar",
      "Interest in financial technology and enterprise systems",
    ],
    companyInsights: {
      industry: "Financial Services",
      size: "Global enterprise",
      culture: "Structured, enterprise-scale, team-oriented",
      note: "Good exposure to large systems, enterprise data, and financial technology.",
    },
  },
  {
    id: 3,
    title: "Software Engineering Intern",
    company: "Mastercard",
    location: "O'Fallon, MO",
    mode: "On-site",
    type: "Internship",
    salaryMin: 35,
    salaryMax: 46,
    posted: "4 days ago",
    skills: ["Java", "Cloud", "Backend", "APIs"],
    description:
      "Build and test software supporting payment products and globally distributed transaction platforms.",
    requirements: [
      "Pursuing a Computer Science or related degree",
      "Experience with object-oriented programming",
      "Understanding of software development fundamentals",
    ],
    companyInsights: {
      industry: "Payments / FinTech",
      size: "Global enterprise",
      culture: "Security-minded, scalable systems, cross-functional",
      note: "Strong focus on reliability, security, and distributed backend systems.",
    },
  },
  {
    id: 4,
    title: "Software Engineer Intern",
    company: "Innovative Systems",
    location: "Pittsburgh, PA",
    mode: "On-site",
    type: "Internship",
    salaryMin: 32,
    salaryMax: 38,
    posted: "Today",
    skills: ["SQL", "C#", "Software Design", "APIs"],
    description:
      "Contribute to enterprise software products for data management, compliance, and workflow automation.",
    requirements: [
      "Computer Science or related technical major",
      "Strong programming fundamentals",
      "Interest in software design and development",
    ],
    companyInsights: {
      industry: "Enterprise Software",
      size: "Mid-size company",
      culture: "Hands-on, engineering-focused, customer-oriented",
      note: "Good environment for owning meaningful product work early.",
    },
  },
  {
    id: 5,
    title: "Frontend Engineer Intern",
    company: "Northstar Labs",
    location: "New York, NY",
    mode: "Remote",
    type: "Internship",
    salaryMin: 36,
    salaryMax: 42,
    posted: "3 days ago",
    skills: ["React", "TypeScript", "JavaScript", "UI"],
    description:
      "Build responsive interfaces and collaborate with design and product to improve usability and accessibility.",
    requirements: [
      "Experience building modern web applications",
      "Familiarity with React and TypeScript",
      "Understanding of HTML, CSS, and accessibility",
    ],
    companyInsights: {
      industry: "Software",
      size: "Startup",
      culture: "Fast-moving, design-heavy, high ownership",
      note: "Strong fit for frontend engineers who like product design and broad ownership.",
    },
  },
  {
    id: 6,
    title: "Cloud Engineering Intern",
    company: "Apex Systems",
    location: "Chicago, IL",
    mode: "Hybrid",
    type: "Internship",
    salaryMin: 34,
    salaryMax: 39,
    posted: "5 days ago",
    skills: ["AWS", "Python", "Docker", "Cloud"],
    description:
      "Help automate deployment workflows, improve cloud infrastructure, and support developer tooling.",
    requirements: [
      "Exposure to AWS or another cloud platform",
      "Programming or scripting experience",
      "Interest in infrastructure and developer productivity",
    ],
    companyInsights: {
      industry: "Cloud Infrastructure",
      size: "Mid-size company",
      culture: "Infrastructure-minded, practical, automation-driven",
      note: "Good fit for engineers interested in DevOps, cloud, and developer tooling.",
    },
  },
  {
    id: 7,
    title: "AI / ML Engineering Intern",
    company: "Traice Labs",
    location: "Pittsburgh, PA",
    mode: "Hybrid",
    type: "Internship",
    salaryMin: 37,
    salaryMax: 37,
    posted: "Today",
    skills: ["Python", "Machine Learning", "APIs", "Data"],
    description:
      "Prototype machine learning features, build evaluation workflows, and integrate model outputs into product experiences.",
    requirements: [
      "Strong Python fundamentals",
      "Comfort working with data and APIs",
      "Interest in applied machine learning systems",
    ],
    companyInsights: {
      industry: "AI / Software",
      size: "Startup",
      culture: "Fast-moving, research-informed, product-driven",
      note: "Direct exposure to applied AI product development and fast iteration.",
    },
  },
  {
    id: 8,
    title: "Software Developer Intern",
    company: "Glencliff Labs",
    location: "Pittsburgh, PA",
    mode: "Hybrid",
    type: "Internship",
    salaryMin: 30,
    salaryMax: 40,
    posted: "6 days ago",
    skills: ["React", "Node.js", "SQL", "Docker"],
    description:
      "Build full-stack product features, improve internal tooling, and collaborate closely with a small engineering team.",
    requirements: [
      "Strong software engineering fundamentals",
      "Experience with modern web development",
      "Comfort working across frontend and backend code",
    ],
    companyInsights: {
      industry: "Software",
      size: "Startup",
      culture: "Small team, high ownership, pragmatic",
      note: "Broad full-stack exposure and direct collaboration with product stakeholders.",
    },
  },
];

// Raw sample data. The app uses these (normalized in api/sources/sample.js)
// only when no live job source responds.
export const sampleJobData = [...internshipJobs, ...fullTimeJobs];

export const WORK_MODES = ["On-site", "Hybrid", "Remote"];
