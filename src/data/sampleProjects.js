// Dummy projects for the demo persona (Alex Chen), shown until the user adds
// their own. Every field mirrors one section of a project write-up. Role fit
// is never stored: it's calculated from what each write-up says.
export const sampleProjects = [
  {
    id: "campus-eats",
    title: "CampusEats",
    context: "Course project, Web Applications · team of 4 · tech lead",
    dates: "Jan 2025 – May 2025",
    users: "1,200 students across 6 campus dining halls",
    oneLiner: "a mobile-first food pre-ordering app for campus dining halls",
    problem:
      "Lunch lines at campus dining halls averaged over 20 minutes at peak hours, and kitchens had no warning before rushes. Students skipped meals between back-to-back classes, and dining staff wanted a way to spread orders across the lunch window.",
    approach:
      "React front end and a Node.js and Express API backed by PostgreSQL. Orders move through a state machine (placed, cooking, ready, picked up), and status is pushed to phones over WebSockets. Menus and stock levels are cached in Redis, so the menu still loads in under 200 ms during the noon rush. Pickup windows are capped per 10-minute slot so kitchens are never overloaded. The API is covered by integration tests that run in CI on every pull request.",
    contribution:
      "Designed the database schema and the ordering API, built the real-time order status service, and ran weekly demos with dining-hall managers to adjust pickup slots.",
    impact:
      "Adopted by all 6 dining halls during the pilot semester, and dining services asked to keep it running after the course ended.",
    tech: ["React", "Node.js", "Express.js", "PostgreSQL", "Redis", "WebSockets", "GitHub Actions"],
    domains: ["web", "real-time", "full-stack"],
    metrics: [
      "cut average wait time from 22 to 9 minutes",
      "served 1,200 weekly active students",
      "handled a peak of 450 orders per hour",
    ],
    links: { repo: "https://github.com/alexchen/campus-eats", demo: "" },
    bullets: {
      sde: [
        "Built CampusEats, a food pre-ordering platform using React, Node.js and PostgreSQL, cutting average dining-hall wait time from 22 to 9 minutes",
        "Implemented real-time order status over WebSockets with Redis-cached menus, handling a peak of 450 orders per hour",
      ],
      fde: [],
      ai: [],
      mle: [],
    },
  },
  {
    id: "docchat",
    title: "DocChat",
    context: "Independent project · solo · built with the course's teaching staff",
    dates: "Aug 2025 – Oct 2025",
    users: "students and teaching staff of a 300-student course",
    oneLiner: "a retrieval-augmented Q&A assistant over course notes and lecture transcripts",
    problem:
      "Students waited hours on the course forum for answers to questions already covered in lecture notes or recordings. Teaching staff spent most office-hour time repeating the same explanations.",
    approach:
      "Chunks PDFs and lecture transcripts by section, embeds them, and stores the vectors in PostgreSQL with pgvector. Each question runs hybrid retrieval (keyword plus embedding search), and the top passages go to an LLM through the OpenAI API with a prompt that requires a citation for every claim. Answers without a supporting passage fall back to 'ask the staff'. An eval set of 150 real forum questions, graded by teaching assistants, runs on every prompt or retrieval change.",
    contribution:
      "Designed the retrieval pipeline, the prompts and the evaluation harness, and deployed the FastAPI service and React chat widget for the course.",
    impact:
      "The teaching staff used it for a full semester and moved repeated questions from office hours to the assistant.",
    tech: ["Python", "FastAPI", "OpenAI API", "PostgreSQL", "pgvector", "React", "Docker"],
    domains: ["llm", "rag", "evaluation", "education"],
    metrics: [
      "raised answer accuracy from 61% to 84% on a 150-question eval set",
      "answered 2,000+ student questions in one semester",
      "cut median response time from 6 hours to under 10 seconds",
    ],
    links: { repo: "https://github.com/alexchen/docchat", demo: "" },
    bullets: {
      sde: [],
      fde: [],
      ai: [
        "Built DocChat, a retrieval-augmented assistant over course notes using FastAPI, pgvector and the OpenAI API, raising answer accuracy from 61% to 84% on a 150-question eval set",
      ],
      mle: [],
    },
  },
  {
    id: "raft-kv",
    title: "RaftKV",
    context: "Distributed Systems course · solo",
    dates: "Sep 2024 – Dec 2024",
    users: "",
    oneLiner: "a fault-tolerant key-value store replicated with the Raft consensus protocol",
    problem:
      "Keep a key-value store consistent and available while nodes crash, restart and lose network connections, without ever returning stale data.",
    approach:
      "Go implementation of Raft leader election, log replication and snapshotting, with nodes talking over gRPC. Reads go through the leader with a lease so they stay linearizable. Snapshots compact the log so restarts stay fast. A chaos test harness in Docker randomly partitions the network, kills nodes and restarts them while a checker verifies every read against the history of writes.",
    contribution:
      "Wrote the consensus layer, the snapshotting and the chaos test harness on my own, and profiled the replication path to batch log entries.",
    impact:
      "Passed every course test, including the randomized partition suite, and was shared by the instructor as a reference solution.",
    tech: ["Go", "gRPC", "Docker"],
    domains: ["distributed-systems", "storage", "consensus"],
    metrics: [
      "sustained 12,000 writes/sec across 5 nodes",
      "survived 500 randomized partition and crash tests",
      "cut replication latency by 40% by batching log entries",
    ],
    links: { repo: "", demo: "" },
    bullets: { sde: [], fde: [], ai: [], mle: [] },
  },
  {
    id: "churn-predictor",
    title: "Churn Predictor",
    context: "ML course project with a local SaaS startup · team of 3",
    dates: "Feb 2025 – Apr 2025",
    users: "the startup's customer success team",
    oneLiner: "a customer churn prediction model with a weekly risk report",
    problem:
      "The startup only noticed churning customers after they cancelled, and the customer success team had no way to decide which accounts to call first.",
    approach:
      "Feature pipeline over 2 years of product usage events in Pandas (logins, seats used, support tickets, billing changes), with time-based train and test splits to avoid leakage. Compared logistic regression, random forests and gradient-boosted trees (XGBoost), tuned with cross-validation. SHAP values explain each prediction, and a Streamlit dashboard lists the riskiest accounts with the main reasons.",
    contribution:
      "Built the feature pipeline and the model training code, ran the model comparison, and presented the weekly risk report to the customer success team.",
    impact:
      "The customer success team now reviews the risk report every week and calls the top accounts first.",
    tech: ["Python", "Pandas", "scikit-learn", "XGBoost", "SHAP", "Streamlit"],
    domains: ["machine-learning", "analytics", "tabular-data"],
    metrics: [
      "reached 0.87 AUC, up from 0.71 for the rules baseline",
      "flagged at-risk accounts 3 weeks earlier on average",
      "trained on 2 years of usage events from 4,000 accounts",
    ],
    links: { repo: "", demo: "" },
    bullets: { sde: [], fde: [], ai: [], mle: [] },
  },
  {
    id: "clinic-sync",
    title: "ClinicSync",
    context: "Summer internship, HealthBridge (fictional) · solutions engineering team",
    dates: "Jun 2025 – Aug 2025",
    users: "3 partner clinics moving off spreadsheets",
    oneLiner: "an integration that syncs clinic appointment spreadsheets into a scheduling API",
    problem:
      "Each new clinic customer took about 3 weeks to onboard because staff re-typed appointments from their own spreadsheets into the scheduling product, and every clinic used different columns.",
    approach:
      "Python ETL that reads each clinic's export, maps its columns to the scheduling API's format, and validates every row (dates, phone numbers, duplicate patients). Rows that fail go to a review queue instead of being dropped. The sync runs on AWS Lambda on a schedule and posts a summary to the clinic's admin. Column mappings were worked out in on-site sessions with each clinic's front-desk staff.",
    contribution:
      "Ran the on-site sessions with clinic staff, wrote the ETL and validation rules, and owned the rollout and support for all 3 clinics.",
    impact:
      "All 3 clinics went live within the internship, and the integration became the team's standard onboarding path for new customers.",
    tech: ["Python", "AWS", "REST APIs", "SQL"],
    domains: ["integration", "healthcare", "customer-onboarding"],
    metrics: [
      "cut each clinic's onboarding from 3 weeks to 4 days",
      "removed about 10 hours of manual data entry per week",
      "caught 1,100+ bad rows before they reached production",
    ],
    links: { repo: "", demo: "" },
    bullets: { sde: [], fde: [], ai: [], mle: [] },
  },
];
