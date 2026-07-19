import { Pressable, View } from 'react-native';

type ThemeToggleProps = {
  activeColor: string;
  inactiveColor: string;
  disabled?: boolean;
  onValueChange: (value: boolean) => void;
  value: boolean;
};

export function ThemeToggle({
  activeColor,
  disabled = false,
  inactiveColor,
  onValueChange,
  value,
}: ThemeToggleProps) {
  const trackColor = value ? `${activeColor}55` : inactiveColor;
  const thumbColor = value ? activeColor : '#F4F4F5';

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      className="h-7 w-12 rounded-full p-[3px]"
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={{
        backgroundColor: trackColor,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <View
        className="h-[22px] w-[22px] rounded-full"
        style={{
          alignSelf: value ? 'flex-end' : 'flex-start',
          backgroundColor: thumbColor,
          borderColor: value ? activeColor : inactiveColor,
          borderWidth: 1,
        }}
      />
    </Pressable>
  );
}
