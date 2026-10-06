import { STORAGE_KEYS } from "../constants/storageKeys";
import { sampleProjects } from "../data/sampleProjects";
import { normalizeProject, slugify } from "../utils/projectMarkdown";
import { useLocalStorage } from "./useLocalStorage";

/** A unique id for a project, based on its title. */
function uniqueId(title, projects, exceptId) {
  const base = slugify(title);
  const taken = new Set(projects.filter((p) => p.id !== exceptId).map((p) => p.id));
  let id = base;
  for (let n = 2; taken.has(id); n++) id = `${base}-${n}`;
  return id;
}

/**
 * The project library and saved resume variants. Starts with the sample
 * projects until the user saves their own.
 */
export function useProjects() {
  const [projects, setProjects] = useLocalStorage(STORAGE_KEYS.projects, null, (raw) =>
    (Array.isArray(raw) ? raw : sampleProjects).map(normalizeProject),
  );
  const [variants, setVariants] = useLocalStorage(STORAGE_KEYS.resumeVariants, []);

  /** Adds a project (new or imported) and returns its id. */
  function addProject(project) {
    const id = uniqueId(project.title, projects);
    setProjects((list) => [...list, normalizeProject({ ...project, id })]);
    return id;
  }

  function updateProject(id, patch) {
    setProjects((list) =>
      list.map((p) => (p.id === id ? normalizeProject({ ...p, ...patch }) : p)),
    );
  }

  function removeProject(id) {
    setProjects((list) => list.filter((p) => p.id !== id));
  }

  function saveVariant(variant) {
    const saved = { ...variant, id: `${Date.now()}`, createdAt: new Date().toISOString() };
    setVariants((list) => [saved, ...list]);
  }

  function removeVariant(id) {
    setVariants((list) => list.filter((v) => v.id !== id));
  }

  return {
    projects,
    addProject,
    updateProject,
    removeProject,
    variants,
    saveVariant,
    removeVariant,
  };
}
