import { Platform } from 'react-native';

import { supabase } from '../../../lib/supabase';

function getRedirectTo() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.origin;
  }

  return undefined;
}

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getRedirectTo(),
    },
  });
}
