import { Project } from '../types/editor';
import { createInitialProject } from './project-engine';

const STORAGE_KEY = 'appforge_projects_v1';
const ACTIVE_PROJECT_KEY = 'appforge_active_project_id';

const SEED_PROJECTS: Project[] = [
  createInitialProject('Nexus Cloud Dashboard', 'saas'),
  createInitialProject('Enterprise Contact Portal', 'contact'),
  createInitialProject('Mobile SaaS Card', 'card'),
];

export function getStoredProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PROJECTS));
      return SEED_PROJECTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_PROJECTS;
  } catch (err) {
    console.error('Failed to parse stored projects, returning seeds', err);
    return SEED_PROJECTS;
  }
}

export function saveStoredProjects(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to persist projects to storage', err);
  }
}

export function saveProject(project: Project): void {
  const current = getStoredProjects();
  const existingIdx = current.findIndex((p) => p.id === project.id);
  if (existingIdx >= 0) {
    current[existingIdx] = { ...project, updatedAt: new Date().toISOString() };
  } else {
    current.unshift({ ...project, updatedAt: new Date().toISOString() });
  }
  saveStoredProjects(current);
}

export function deleteStoredProject(projectId: string): Project[] {
  const current = getStoredProjects().filter((p) => p.id !== projectId);
  saveStoredProjects(current);
  return current;
}

export function getActiveProjectId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_PROJECT_KEY);
  } catch {
    return null;
  }
}

export function setActiveProjectId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_PROJECT_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_PROJECT_KEY);
    }
  } catch (err) {
    console.error('Failed to set active project ID', err);
  }
}
