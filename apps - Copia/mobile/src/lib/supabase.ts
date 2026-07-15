import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

import { env } from '../config/env';

if (!env.supabaseUrl || !env.supabasePublishableKey) {
  console.warn('Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.');
}

export const supabase = createClient(
  env.supabaseUrl ?? 'https://example.supabase.co',
  env.supabasePublishableKey ?? 'missing-publishable-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  },
);
