import { Project, ThemePresetName, ThemeTokens } from '../types/editor';

export const THEME_PRESETS: Record<Exclude<ThemePresetName, 'custom'>, ThemeTokens> = {
  'midnight-saas': {
    presetName: 'midnight-saas',
    primaryColor: '#2563EB',
    secondaryColor: '#06B6D4',
    backgroundColor: '#09090B',
    surfaceColor: '#18181B',
    textColor: '#F4F4F5',
    mutedTextColor: '#A1A1AA',
    borderColor: '#27272A',
    fontFamily: 'Plus Jakarta Sans',
    borderRadius: '12px',
  },
  'minimal-light': {
    presetName: 'minimal-light',
    primaryColor: '#1D4ED8',
    secondaryColor: '#0F766E',
    backgroundColor: '#F8FAFC',
    surfaceColor: '#FFFFFF',
    textColor: '#0F172A',
    mutedTextColor: '#475569',
    borderColor: '#CBD5E1',
    fontFamily: 'Inter',
    borderRadius: '8px',
  },
  'cyberpunk-neon': {
    presetName: 'cyberpunk-neon',
    primaryColor: '#D946EF',
    secondaryColor: '#22D3EE',
    backgroundColor: '#070410',
    surfaceColor: '#130A24',
    textColor: '#FDF4FF',
    mutedTextColor: '#C4B5FD',
    borderColor: '#4C1D95',
    fontFamily: 'Space Grotesk',
    borderRadius: '4px',
  },
  'warm-editorial': {
    presetName: 'warm-editorial',
    primaryColor: '#B45309',
    secondaryColor: '#0F766E',
    backgroundColor: '#FAF7F2',
    surfaceColor: '#FFFDF9',
    textColor: '#1C1917',
    mutedTextColor: '#57534E',
    borderColor: '#E7E5E4',
    fontFamily: 'Georgia',
    borderRadius: '8px',
  },
};

export function ensureThemeTokens(project?: Partial<Project> | null): ThemeTokens {
  const base = THEME_PRESETS['midnight-saas'];
  const existing = project?.themeTokens;
  if (!existing) {
    return {
      ...base,
      backgroundColor: project?.canvasBg || base.backgroundColor,
    };
  }
  return {
    ...base,
    ...existing,
  };
}

export function applyThemePreset(project: Project, presetName: Exclude<ThemePresetName, 'custom'>): Project {
  const preset = THEME_PRESETS[presetName];
  return {
    ...project,
    canvasBg: preset.backgroundColor,
    themeTokens: { ...preset },
    pages: (project.pages || []).map((p) => ({
      ...p,
      canvasBg: preset.backgroundColor,
    })),
    updatedAt: new Date().toISOString(),
  };
}

export function updateThemeTokens(project: Project, patch: Partial<ThemeTokens>): Project {
  const current = ensureThemeTokens(project);
  const next: ThemeTokens = {
    ...current,
    ...patch,
    presetName: patch.presetName || 'custom',
  };
  return {
    ...project,
    canvasBg: next.backgroundColor,
    themeTokens: next,
    pages: (project.pages || []).map((p) =>
      p.id === project.activePageId ? { ...p, canvasBg: next.backgroundColor } : p
    ),
    updatedAt: new Date().toISOString(),
  };
}

export function themeTokensToCss(tokens: ThemeTokens): string {
  const fontCss =
    tokens.fontFamily === 'Georgia'
      ? "Georgia, 'Times New Roman', serif"
      : `'${tokens.fontFamily}', system-ui, -apple-system, sans-serif`;

  return `:root {
  --af-primary: ${tokens.primaryColor};
  --af-secondary: ${tokens.secondaryColor};
  --af-bg: ${tokens.backgroundColor};
  --af-surface: ${tokens.surfaceColor};
  --af-text: ${tokens.textColor};
  --af-muted: ${tokens.mutedTextColor};
  --af-border: ${tokens.borderColor};
  --af-radius: ${tokens.borderRadius};
  --af-font: ${fontCss};
}`;
}
