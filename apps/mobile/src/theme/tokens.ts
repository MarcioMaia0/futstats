export type AppTheme = {
  background: {
    canvas: string;
    canvasMuted: string;
    overlay: string;
  };
  gray: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  border: {
    default: string;
    emphasis: string;
    subtle: string;
  };
  color: {
    accent: string;
    background: string;
    danger: string;
    primary: string;
    secondary: string;
    success: string;
    surface: string;
    text: string;
  };
  icon: {
    accent: string;
    primary: string;
    subdued: string;
  };
  surface: {
    accentSoft: string;
    card: string;
    cardMuted: string;
    input: string;
    primaryAction: string;
    secondaryAction: string;
    transparent: string;
  };
  text: {
    accent: string;
    body: string;
    danger: string;
    heading: string;
    muted: string;
    onPrimary: string;
    success: string;
    subdued: string;
  };
  wizard: {
    markerActive: string;
    markerInactive: string;
  };
};

export const defaultTheme: AppTheme = {
  background: {
    canvas: '#0E0E0E',
    canvasMuted: '#E7E7E7',
    overlay: 'rgba(0, 0, 0, 0.74)',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
  border: {
    default: '#5A5A5A',
    emphasis: '#F2AD24',
    subtle: '#2C2C2C',
  },
  color: {
    accent: '#F2AD24',
    background: '#0E0E0E',
    danger: '#FF7B7B',
    primary: '#F2AD24',
    secondary: '#D99612',
    success: '#73E2A7',
    surface: '#181818',
    text: '#FFFFFF',
  },
  icon: {
    accent: '#F2AD24',
    primary: '#FFFFFF',
    subdued: '#8E8E8E',
  },
  surface: {
    accentSoft: 'rgba(242, 173, 36, 0.22)',
    card: '#181818',
    cardMuted: '#242424',
    input: '#242424',
    primaryAction: '#F2AD24',
    secondaryAction: '#242424',
    transparent: 'transparent',
  },
  text: {
    accent: '#F2AD24',
    body: '#FFFFFF',
    danger: '#FF7B7B',
    heading: '#FFFFFF',
    muted: '#8E8E8E',
    onPrimary: '#17120A',
    subdued: '#D7D7D7',
    success: '#73E2A7',
  },
  wizard: {
    markerActive: '#F2AD24',
    markerInactive: 'rgba(255, 255, 255, 0.24)',
  },
};
