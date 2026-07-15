export type SizeScale = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
};

export type LayoutTheme = {
  breakpoint: {
    phone: number;
    tablet: number;
    wide: number;
  };
  icon: {
    md: number;
    sm: number;
    xl: number;
  };
  radius: SizeScale;
  shell: {
    cardMaxWidth: number;
    pageMaxWidth: number;
    pagePaddingHorizontal: number;
    pagePaddingBottom: number;
    pagePaddingTop: number;
    pagePaddingVertical: number;
  };
  size: {
    buttonHeight: number;
    buttonHeightSm: number;
    inputHeight: number;
    touchTargetMin: number;
  };
  spacing: SizeScale & {
    '4xl': number;
  };
  wizard: {
    contentGap: number;
    markerGap: number;
    markerHeight: number;
    markerWidthActive: number;
    markerWidthInactive: number;
    stepGap: number;
  };
};

export const layout: LayoutTheme = {
  breakpoint: {
    phone: 480,
    tablet: 768,
    wide: 1024,
  },
  icon: {
    md: 20,
    sm: 16,
    xl: 32,
  },
  radius: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 18,
    xl: 24,
    '2xl': 28,
    '3xl': 36,
  },
  shell: {
    cardMaxWidth: 360,
    pageMaxWidth: 480,
    pagePaddingBottom: 24,
    pagePaddingHorizontal: 16,
    pagePaddingTop: 12,
    pagePaddingVertical: 12,
  },
  size: {
    buttonHeight: 54,
    buttonHeightSm: 48,
    inputHeight: 50,
    touchTargetMin: 40,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
  },
  wizard: {
    contentGap: 16,
    markerGap: 8,
    markerHeight: 3,
    markerWidthActive: 18,
    markerWidthInactive: 22,
    stepGap: 18,
  },
};
