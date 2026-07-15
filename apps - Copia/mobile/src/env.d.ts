declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_SUPABASE_URL?: string;
    EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
    EXPO_PUBLIC_SUPABASE_KEY?: string;
  }
}

declare module '*.png' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}
