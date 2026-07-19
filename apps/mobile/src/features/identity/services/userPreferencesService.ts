import { supabase } from '../../../lib/supabase';
import type { UserThemePreferenceKey } from '../../../theme/teamExperienceTheme';

export type UserThemePreference = {
  preferredThemeId: string | null;
  preferredThemeKey: UserThemePreferenceKey | null;
};

export async function fetchCurrentUserThemePreference(): Promise<UserThemePreference> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const userId = session?.user?.id ?? null;

  if (!userId) {
    return {
      preferredThemeId: null,
      preferredThemeKey: null,
    };
  }

  const { data: preferences, error: preferencesError } = await supabase
    .from('user_preferences')
    .select('preferred_theme_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (preferencesError) {
    throw preferencesError;
  }

  const preferredThemeId = preferences?.preferred_theme_id ?? null;

  if (!preferredThemeId) {
    return {
      preferredThemeId: null,
      preferredThemeKey: null,
    };
  }

  const { data: themeRow, error: themeError } = await supabase
    .from('themes')
    .select('key')
    .eq('id', preferredThemeId)
    .maybeSingle();

  if (themeError) {
    throw themeError;
  }

  return {
    preferredThemeId,
    preferredThemeKey: (themeRow?.key as UserThemePreferenceKey | undefined) ?? null,
  };
}
