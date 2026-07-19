import { defaultTheme } from './tokens';

export type TeamExperienceTheme = {
  surfaceBase: string;
  surfaceCard: string;
  textPrimary: string;
  textMuted: string;
  accentPrimary: string;
  accentOnPrimary: string;
  borderDefault: string;
};

export type TeamExperienceThemeOverrides = Partial<TeamExperienceTheme>;
export type ExperienceThemeMode = 'dark' | 'light';
export type UserThemePreferenceKey = 'theme-dark' | 'theme-light' | 'team-default' | string;
export type TeamExperienceThemePriority =
  | 'app-only'
  | 'team-overrides-app'
  | 'app-overrides-team';
export type ExperienceThemeContext = 'app' | 'team';
export type ResolvedExperienceTheme = {
  mode: ExperienceThemeMode;
  theme: TeamExperienceTheme;
};

export const systemTeamExperienceTheme: TeamExperienceTheme = {
  surfaceBase: defaultTheme.background.canvas,
  surfaceCard: defaultTheme.surface.card,
  textPrimary: defaultTheme.text.body,
  textMuted: defaultTheme.text.muted,
  accentPrimary: defaultTheme.color.primary,
  accentOnPrimary: defaultTheme.text.onPrimary,
  borderDefault: defaultTheme.border.default,
};

export const lightTeamExperienceTheme: TeamExperienceTheme = {
  surfaceBase: defaultTheme.background.canvasMuted,
  surfaceCard: '#FFFFFF',
  textPrimary: '#171717',
  textMuted: defaultTheme.gray[500],
  accentPrimary: defaultTheme.color.primary,
  accentOnPrimary: defaultTheme.text.onPrimary,
  borderDefault: defaultTheme.gray[300],
};

export function resolveAppExperienceTheme(preferredThemeKey?: UserThemePreferenceKey | null): ResolvedExperienceTheme {
  if (preferredThemeKey === 'theme-light') {
    return {
      mode: 'light',
      theme: lightTeamExperienceTheme,
    };
  }

  return {
    mode: 'dark',
    theme: systemTeamExperienceTheme,
  };
}

export function resolveExperienceTheme(options?: {
  preferredThemeKey?: UserThemePreferenceKey | null;
  teamOverrides?: TeamExperienceThemeOverrides | null;
  context?: ExperienceThemeContext;
} | null): ResolvedExperienceTheme {
  const context = options?.context ?? 'app';
  const baseAppearance = resolveAppExperienceTheme(options?.preferredThemeKey);

  if (context !== 'team' || !options?.teamOverrides) {
    return baseAppearance;
  }

  return {
    mode: baseAppearance.mode,
    theme: {
      ...baseAppearance.theme,
      ...options.teamOverrides,
    },
  };
}

export function resolveTeamExperienceTheme(
  options?: {
    overrides?: TeamExperienceThemeOverrides | null;
    priority?: TeamExperienceThemePriority;
  } | null,
): TeamExperienceTheme {
  const overrides = options?.overrides ?? null;
  const priority = options?.priority ?? 'team-overrides-app';
  const baseTheme = resolveAppExperienceTheme().theme;

  if (priority === 'app-only' || !overrides) {
    return {
      ...baseTheme,
    };
  }

  if (priority === 'app-overrides-team') {
    return {
      ...overrides,
      ...baseTheme,
    };
  }

  return {
    ...baseTheme,
    ...overrides,
  };
}
