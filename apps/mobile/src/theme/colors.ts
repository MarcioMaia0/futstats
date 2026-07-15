import { defaultTheme } from './tokens';

// Compatibility layer while the mobile app migrates from fixed palette names
// to semantic theme tokens.
export const colors = {
  brand: {
    black: defaultTheme.background.canvas,
    gold: defaultTheme.color.primary,
    goldStrong: defaultTheme.color.secondary,
    white: defaultTheme.text.body,
  },
  gray: defaultTheme.gray,
  border: {
    default: defaultTheme.border.default,
    subtle: defaultTheme.border.subtle,
  },
  surface: {
    base: defaultTheme.background.canvas,
    input: defaultTheme.surface.input,
    lightBase: defaultTheme.background.canvasMuted,
    raised: defaultTheme.surface.card,
    transparent: defaultTheme.surface.transparent,
  },
  text: {
    muted: defaultTheme.text.muted,
    onGold: defaultTheme.text.onPrimary,
    primary: defaultTheme.text.body,
    secondary: defaultTheme.text.subdued,
  },
};
