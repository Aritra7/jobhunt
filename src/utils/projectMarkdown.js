import { ROLE_IDS } from "../data/roleStyles";

// One markdown file per project: a YAML-style frontmatter block for the facts
// and "## Section" headings for the write-up, with a bullet bank per role.
// Only this app's own format is parsed, so no YAML library is needed.

const SECTIONS = [
  ["oneLiner", "One-liner"],
  ["problem", "Problem / context"],
  ["approach", "How it works"],
  ["contribution", "My contribution"],
  ["impact", "Impact"],
];

export function slugify(text) {
  return (
    String(text)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "project"
  );
}

export function emptyProject(title = "New project") {
  return {
    id: slugify(title),
    title,
    context: "",
    dates: "",
    users: "",
    oneLiner: "",
    problem: "",
    approach: "",
    contribution: "",
    impact: "",
    tech: [],
    domains: [],
    metrics: [],
    links: { repo: "", demo: "" },
    roleFit: {},
    bullets: Object.fromEntries(ROLE_IDS.map((id) => [id, []])),
  };
}

/** Fills missing fields and drops values of the wrong type. */
export function normalizeProject(raw) {
  const base = emptyProject(raw?.title || "Untitled project");
  const strings = (list) => (Array.isArray(list) ? list.map(String).filter(Boolean) : []);
  const project = { ...base };
  for (const key of ["id", "title", "context", "dates", "users", ...SECTIONS.map(([k]) => k)]) {
    if (typeof raw?.[key] === "string") project[key] = raw[key];
  }
  project.tech = strings(raw?.tech);
  project.domains = strings(raw?.domains);
  project.metrics = strings(raw?.metrics);
  project.links = { ...base.links, ...(raw?.links || {}) };
  project.roleFit = Object.fromEntries(
    ROLE_IDS.filter((id) => Number.isInteger(raw?.roleFit?.[id])).map((id) => [
      id,
      raw.roleFit[id],
    ]),
  );
  project.bullets = Object.fromEntries(ROLE_IDS.map((id) => [id, strings(raw?.bullets?.[id])]));
  return project;
}

const inlineList = (items) => `[${items.join(", ")}]`;
const inlineMap = (entries) => `{${entries.map(([k, v]) => `${k}: ${v}`).join(", ")}}`;

export function toMarkdown(project) {
  const fit = ROLE_IDS.map((id) => [
    id,
    Number.isInteger(project.roleFit[id]) ? project.roleFit[id] : "auto",
  ]);
  const lines = [
    "---",
    `id: ${project.id}`,
    `title: ${project.title}`,
    `context: ${project.context}`,
    `dates: ${project.dates}`,
    `users: ${project.users}`,
    `tech: ${inlineList(project.tech)}`,
    `domains: ${inlineList(project.domains)}`,
    `links: ${inlineMap(Object.entries(project.links))}`,
    `role_fit: ${inlineMap(fit)}`,
    "metrics:",
    ...project.metrics.map((m) => `  - ${m}`),
    "---",
    "",
  ];
  for (const [key, heading] of SECTIONS) lines.push(`## ${heading}`, project[key], "");
  lines.push("## Bullet bank");
  for (const id of ROLE_IDS) {
    lines.push(`### ${id}`, ...project.bullets[id].map((b) => `- ${b}`), "");
  }
  return lines.join("\n").trimEnd() + "\n";
}

function parseValue(value) {
  const v = value.trim();
  if (v.startsWith("[") && v.endsWith("]")) {
    return v
      .slice(1, -1)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (v.startsWith("{") && v.endsWith("}")) {
    return Object.fromEntries(
      v
        .slice(1, -1)
        .split(",")
        .map((pair) => pair.split(/:(.*)/s).map((s) => s.trim()))
        .filter(([k]) => k),
    );
  }
  return v;
}

function parseFrontmatter(block) {
  const data = {};
  let listKey = null;
  for (const line of block.split("\n")) {
    const item = /^\s+-\s+(.*)$/.exec(line);
    if (item && listKey) {
      data[listKey].push(item[1].trim());
      continue;
    }
    const pair = /^([\w-]+):\s?(.*)$/.exec(line);
    if (!pair) continue;
    const [, key, value] = pair;
    if (value.trim() === "") {
      data[key] = [];
      listKey = key;
    } else {
      data[key] = parseValue(value);
      listKey = null;
    }
  }
  return data;
}

/** Parses a project markdown file written by toMarkdown (or by hand). */
export function fromMarkdown(text) {
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text.replace(/\r\n/g, "\n").trim());
  if (!match) throw new Error("Missing the --- frontmatter block at the top of the file.");
  const meta = parseFrontmatter(match[1]);
  const raw = {
    id: meta.id,
    title: meta.title,
    context: meta.context,
    dates: meta.dates,
    users: meta.users,
    tech: meta.tech,
    domains: meta.domains,
    metrics: meta.metrics,
    links: typeof meta.links === "object" ? meta.links : undefined,
    roleFit: Object.fromEntries(
      Object.entries(meta.role_fit || {})
        .filter(([, v]) => /^\d$/.test(String(v)))
        .map(([k, v]) => [k, Number(v)]),
    ),
    bullets: {},
  };

  let section = null;
  let role = null;
  const body = {};
  for (const line of match[2].split("\n")) {
    const h2 = /^##\s+(.*)$/.exec(line);
    const h3 = /^###\s+(.*)$/.exec(line);
    if (h3 && section === "Bullet bank") {
      role = h3[1].trim().toLowerCase();
      raw.bullets[role] = [];
    } else if (h2) {
      section = h2[1].trim();
      role = null;
      body[section] = [];
    } else if (role && /^\s*-\s+/.test(line)) {
      raw.bullets[role].push(line.replace(/^\s*-\s+/, "").trim());
    } else if (section && section !== "Bullet bank") {
      body[section].push(line);
    }
  }
  for (const [key, heading] of SECTIONS) {
    if (body[heading]) raw[key] = body[heading].join("\n").trim();
  }
  if (!raw.title) throw new Error("The frontmatter needs a title.");
  return normalizeProject({ ...raw, id: raw.id || slugify(raw.title) });
}
