import { Ionicons } from '@expo/vector-icons';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { defaultTheme } from '../../theme/tokens';
import type { TeamExperienceTheme } from '../../theme/teamExperienceTheme';

type BackCircleButtonProps = {
  className?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  theme?: Pick<TeamExperienceTheme, 'accentPrimary' | 'surfaceCard'>;
};

export function BackCircleButton({ className, onPress, style, theme }: BackCircleButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`h-[42px] w-[42px] items-center justify-center rounded-full ${className ?? ''}`}
      onPress={onPress}
      style={[
        {
          backgroundColor: theme?.surfaceCard ?? 'rgba(0, 0, 0, 0.8)',
        },
        style,
      ]}
    >
      <Ionicons color={theme?.accentPrimary ?? defaultTheme.icon.accent} name="arrow-back" size={22} />
    </Pressable>
  );
}
