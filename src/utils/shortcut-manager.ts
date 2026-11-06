import { Project } from '../types/editor';

export type ShortcutActionId = 
  | 'deleteElement'
  | 'previewApp'
  | 'saveProject'
  | 'exportApp'
  | 'quickAdd'
  | 'commandPalette'
  | 'duplicateElement'
  | 'undo'
  | 'redo'
  | 'modeDesign'
  | 'modeLogic'
  | 'modeData';

export interface ShortcutItem {
  id: ShortcutActionId;
  name: string;
  category: 'Canvas & Editing' | 'Application' | 'Modes';
  description: string;
  defaultKey: string;
}

export const STANDARD_SHORTCUTS: ShortcutItem[] = [
  {
    id: 'deleteElement',
    name: 'Delete Element',
    category: 'Canvas & Editing',
    description: 'Delete currently selected canvas element',
    defaultKey: 'Delete',
  },
  {
    id: 'previewApp',
    name: 'Preview Application',
    category: 'Application',
    description: 'Launch interactive prototype preview',
    defaultKey: 'Ctrl+P',
  },
  {
    id: 'saveProject',
    name: 'Save Project',
    category: 'Application',
    description: 'Persist all canvas and page changes',
    defaultKey: 'Ctrl+S',
  },
  {
    id: 'exportApp',
    name: 'Export Application',
    category: 'Application',
    description: 'Open source code and specs export dialog',
    defaultKey: 'Ctrl+E',
  },
  {
    id: 'quickAdd',
    name: 'Quick Add Element',
    category: 'Canvas & Editing',
    description: 'Open circular Quick Add radial menu',
    defaultKey: 'Ctrl+A',
  },
  {
    id: 'commandPalette',
    name: 'Command Palette',
    category: 'Application',
    description: 'Search tools, pages, and quick actions',
    defaultKey: 'Ctrl+K',
  },
  {
    id: 'duplicateElement',
    name: 'Duplicate Element',
    category: 'Canvas & Editing',
    description: 'Duplicate selected canvas element',
    defaultKey: 'Ctrl+D',
  },
  {
    id: 'undo',
    name: 'Undo Action',
    category: 'Canvas & Editing',
    description: 'Undo previous canvas mutation',
    defaultKey: 'Ctrl+Z',
  },
  {
    id: 'redo',
    name: 'Redo Action',
    category: 'Canvas & Editing',
    description: 'Redo previously undone mutation',
    defaultKey: 'Ctrl+Y',
  },
  {
    id: 'modeDesign',
    name: 'Switch to Design Mode',
    category: 'Modes',
    description: 'Visual layout and styling workspace',
    defaultKey: 'Alt+1',
  },
  {
    id: 'modeLogic',
    name: 'Switch to Logic Mode',
    category: 'Modes',
    description: 'Interactive flowchart workflows',
    defaultKey: 'Alt+2',
  },
  {
    id: 'modeData',
    name: 'Switch to Data Mode',
    category: 'Modes',
    description: 'Collections and reactive variables',
    defaultKey: 'Alt+3',
  },
];

const LOCAL_STORAGE_KEY = 'appforge_custom_shortcuts';

/**
 * Returns a dictionary of all default shortcut key combinations.
 */
export function getDefaultShortcuts(): Record<ShortcutActionId, string> {
  const map: Partial<Record<ShortcutActionId, string>> = {};
  for (const item of STANDARD_SHORTCUTS) {
    map[item.id] = item.defaultKey;
  }
  return map as Record<ShortcutActionId, string>;
}

/**
 * Resolves current shortcut mapping from Project customShortcuts, localStorage, or defaults.
 */
export function getActiveShortcuts(project?: Project | null): Record<ShortcutActionId, string> {
  const defaults = getDefaultShortcuts();

  // 1. Check Project-level overrides
  if (project?.customShortcuts && Object.keys(project.customShortcuts).length > 0) {
    return { ...defaults, ...project.customShortcuts };
  }

  // 2. Check LocalStorage
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed === 'object' && parsed !== null) {
          return { ...defaults, ...parsed };
        }
      }
    } catch {}
  }

  return defaults;
}

/**
 * Persists custom shortcut mapping to localStorage.
 */
export function persistShortcutsToStorage(shortcuts: Record<string, string>): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(shortcuts));
    } catch {}
  }
}

/**
 * Clears custom shortcuts from localStorage.
 */
export function clearStoredShortcuts(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {}
  }
}

/**
 * Converts a KeyboardEvent into a normalized key combo string (e.g. "Ctrl+P", "Delete", "Alt+1").
 */
export function eventToKeyCombo(e: KeyboardEvent): string {
  const parts: string[] = [];

  // Modifiers
  if (e.ctrlKey || e.metaKey) {
    parts.push('Ctrl');
  }
  if (e.altKey) {
    parts.push('Alt');
  }
  if (e.shiftKey) {
    // Only include Shift if key isn't already a shifted character like !@#
    if (e.key.length > 1 || (e.ctrlKey || e.altKey || e.metaKey)) {
      parts.push('Shift');
    }
  }

  const key = e.key;

  // Ignore standalone modifier presses
  if (['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
    return '';
  }

  // Standardize key names
  let normalizedKey = key;
  if (key === ' ') normalizedKey = 'Space';
  else if (key === 'Escape') normalizedKey = 'Esc';
  else if (key === 'Delete') normalizedKey = 'Delete';
  else if (key === 'Backspace') normalizedKey = 'Backspace';
  else if (key.length === 1) normalizedKey = key.toUpperCase();

  parts.push(normalizedKey);
  return parts.join('+');
}

/**
 * Checks if a KeyboardEvent matches a configured key combo.
 */
export function matchesShortcut(e: KeyboardEvent, targetCombo: string): boolean {
  if (!targetCombo) return false;

  const currentCombo = eventToKeyCombo(e);
  if (!currentCombo) return false;

  // Direct case-insensitive match
  if (currentCombo.toLowerCase() === targetCombo.toLowerCase()) {
    return true;
  }

  // Handle special case for Delete / Backspace alias if desired
  if (targetCombo.toLowerCase() === 'delete' && (e.key === 'Delete' || e.key === 'Backspace')) {
    // Only if not typing in text field
    const target = e.target as HTMLElement;
    const isTyping = target && (
      target.tagName === 'INPUT' || 
      target.tagName === 'TEXTAREA' || 
      target.isContentEditable
    );
    if (!isTyping && e.key === 'Delete') {
      return true;
    }
  }

  return false;
}

/**
 * Checks if a new key combo conflicts with an existing assignment.
 */
export function findShortcutConflict(
  actionId: ShortcutActionId,
  newCombo: string,
  currentShortcuts: Record<string, string>
): { conflictingActionId: string; conflictingName: string } | null {
  const normalizedNew = newCombo.toLowerCase();

  for (const item of STANDARD_SHORTCUTS) {
    if (item.id === actionId) continue;
    const existing = (currentShortcuts[item.id] || item.defaultKey).toLowerCase();
    if (existing === normalizedNew) {
      return {
        conflictingActionId: item.id,
        conflictingName: item.name,
      };
    }
  }

  return null;
}
