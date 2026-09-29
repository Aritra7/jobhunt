// Resume preview styles (ported from main's TemplatePicker). "modern" is the
// original preview look.
export const resumeTemplates = [
  { id: "modern", name: "Modern Minimal", color: "#3b82f6" },
  { id: "classic", name: "Classic Professional", color: "#475569" },
  { id: "creative", name: "Creative Bold", color: "#8b5cf6" },
];

export const DEFAULT_TEMPLATE = "modern";

export function templateById(id) {
  return resumeTemplates.find((t) => t.id === id) || resumeTemplates[0];
}
