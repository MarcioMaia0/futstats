import { FontAwesome5 } from '@expo/vector-icons';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { defaultTheme } from '../../theme/tokens';

type BackCircleButtonProps = {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function BackCircleButton({ onPress, style }: BackCircleButtonProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.button, style]}>
      <FontAwesome5 color={defaultTheme.icon.accent} name="arrow-left" size={22} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: 'rgba(18, 18, 18, 0.82)',
    borderRadius: 21,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
});
