export type FontFamilyToken =
  | 'brandDisplay'
  | 'brandDisplayAlt'
  | 'body'
  | 'bodyEmphasis'
  | 'mono';

export type TextStyleToken = {
  fontFamily?: string;
  fontSize: number;
  fontWeight?:
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900'
    | 'normal'
    | 'bold';
  letterSpacing?: number;
  lineHeight: number;
  textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
};

export type TypographyTheme = {
  baseFontSize: number;
  families: Record<FontFamilyToken, string | undefined>;
  textStyles: {
    action: TextStyleToken;
    body: TextStyleToken;
    bodySmall: TextStyleToken;
    buttonPrimary: TextStyleToken;
    caption: TextStyleToken;
    display: TextStyleToken;
    eyebrow: TextStyleToken;
    fieldHint: TextStyleToken;
    headingLg: TextStyleToken;
    headingMd: TextStyleToken;
    headingSm: TextStyleToken;
    input: TextStyleToken;
    label: TextStyleToken;
  };
};

export const BASE_REM = 16;

export function rem(multiplier: number) {
  return BASE_REM * multiplier;
}

export const typography: TypographyTheme = {
  baseFontSize: BASE_REM,
  families: {
    body: undefined,
    bodyEmphasis: undefined,
    brandDisplay: 'SedgwickAve_400Regular',
    brandDisplayAlt: 'RobotoSlab_700Bold',
    mono: undefined,
  },
  textStyles: {
    action: {
      fontSize: rem(1),
      fontWeight: '900',
      letterSpacing: 0,
      lineHeight: rem(1.25),
    },
    body: {
      fontSize: rem(0.875),
      fontWeight: '400',
      lineHeight: rem(1.25),
    },
    bodySmall: {
      fontSize: rem(0.8125),
      fontWeight: '400',
      lineHeight: rem(1.125),
    },
    buttonPrimary: {
      fontSize: rem(1.2),
      fontWeight: '700',
      lineHeight: rem(1.5),
    },
    caption: {
      fontSize: rem(0.6875),
      fontWeight: '400',
      lineHeight: rem(0.9375),
    },
    display: {
      fontFamily: 'SedgwickAve_400Regular',
      fontSize: rem(2),
      lineHeight: rem(2.25),
    },
    eyebrow: {
      fontFamily: 'RobotoSlab_700Bold',
      fontSize: rem(0.75),
      fontWeight: '900',
      letterSpacing: 1,
      lineHeight: rem(1),
      textTransform: 'uppercase',
    },
    fieldHint: {
      fontSize: rem(1),
      fontWeight: '400',
      lineHeight: rem(1.5),
    },
    headingLg: {
      fontFamily: 'RobotoSlab_700Bold',
      fontSize: rem(1.5),
      fontWeight: '900',
      lineHeight: rem(1.875),
    },
    headingMd: {
      fontFamily: 'RobotoSlab_700Bold',
      fontSize: rem(1.125),
      fontWeight: '900',
      lineHeight: rem(1.5),
    },
    headingSm: {
      fontFamily: 'RobotoSlab_700Bold',
      fontSize: rem(0.9375),
      fontWeight: '800',
      lineHeight: rem(1.25),
    },
    input: {
      fontSize: rem(0.9375),
      fontWeight: '400',
      lineHeight: rem(1.25),
    },
    label: {
      fontSize: rem(0.8125),
      fontWeight: '700',
      lineHeight: rem(1.125),
    },
  },
};
