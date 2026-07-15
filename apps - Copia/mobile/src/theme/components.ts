import { defaultTheme } from './tokens';
import { layout } from './layout';
import { typography } from './typography';

export type ComponentTheme = {
  button: {
    ghost: {
      borderColor: string;
      minHeight: number;
      radius: number;
      textColor: string;
      textStyle: typeof typography.textStyles.buttonPrimary;
    };
    primary: {
      backgroundColor: string;
      iconGap: number;
      minHeight: number;
      radius: number;
      textColor: string;
      textStyle: typeof typography.textStyles.buttonPrimary;
    };
    secondary: {
      backgroundColor: string;
      borderColor: string;
      minHeight: number;
      radius: number;
      textColor: string;
      textStyle: typeof typography.textStyles.buttonPrimary;
    };
  };
  card: {
    backgroundColor: string;
    borderColor: string;
    borderRadius: number;
    borderWidth: number;
    paddingHorizontal: number;
    paddingVertical: number;
  };
  input: {
    backgroundColor: string;
    borderColor: string;
    borderRadius: number;
    borderWidth: number;
    minHeight: number;
    paddingHorizontal: number;
    placeholderColor: string;
    textColor: string;
    textStyle: typeof typography.textStyles.input;
  };
  wizard: {
    markerActiveColor: string;
    markerInactiveColor: string;
    markerRadius: number;
  };
};

export const components: ComponentTheme = {
  button: {
    ghost: {
      borderColor: defaultTheme.border.emphasis,
      minHeight: layout.size.buttonHeight,
      radius: layout.radius.lg,
      textColor: defaultTheme.text.accent,
      textStyle: typography.textStyles.buttonPrimary,
    },
    primary: {
      backgroundColor: defaultTheme.surface.primaryAction,
      iconGap: layout.spacing.sm,
      minHeight: layout.size.buttonHeight,
      radius: layout.radius.lg,
      textColor: 'rgb(30, 30, 30)',
      textStyle: typography.textStyles.buttonPrimary,
    },
    secondary: {
      backgroundColor: defaultTheme.surface.secondaryAction,
      borderColor: defaultTheme.border.emphasis,
      minHeight: layout.size.buttonHeightSm,
      radius: layout.radius.md,
      textColor: defaultTheme.text.accent,
      textStyle: typography.textStyles.buttonPrimary,
    },
  },
  card: {
    backgroundColor: defaultTheme.surface.card,
    borderColor: defaultTheme.border.default,
    borderRadius: layout.radius.lg,
    borderWidth: 1,
    paddingHorizontal: layout.spacing.lg,
    paddingVertical: layout.spacing.lg,
  },
  input: {
    backgroundColor: defaultTheme.surface.input,
    borderColor: defaultTheme.border.default,
    borderRadius: layout.radius.lg,
    borderWidth: 1,
    minHeight: layout.size.inputHeight,
    paddingHorizontal: layout.spacing.lg,
    placeholderColor: defaultTheme.text.muted,
    textColor: defaultTheme.text.body,
    textStyle: typography.textStyles.input,
  },
  wizard: {
    markerActiveColor: defaultTheme.wizard.markerActive,
    markerInactiveColor: defaultTheme.wizard.markerInactive,
    markerRadius: 999,
  },
};
