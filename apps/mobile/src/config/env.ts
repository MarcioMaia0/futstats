const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_KEY;
const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

export const env = {
  supabaseUrl,
  supabasePublishableKey,
  googleMapsApiKey,
  hasSupabaseConfig: Boolean(supabaseUrl && supabasePublishableKey),
  hasGoogleMapsApiKey: Boolean(googleMapsApiKey),
};
