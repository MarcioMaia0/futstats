import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { TeamExperienceTheme } from '../../theme/teamExperienceTheme';

type TeamExperienceBottomBarKey = 'home' | 'notifications' | 'search' | 'profile';

type TeamExperienceBottomBarProps = {
  activeKey?: TeamExperienceBottomBarKey | null;
  hasUnreadNotifications?: boolean;
  onHomePress?: () => void;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
  onSearchPress?: () => void;
  theme: TeamExperienceTheme;
};

const BOTTOM_ITEMS: Array<{
  icon: ComponentProps<typeof Ionicons>['name'];
  key: TeamExperienceBottomBarKey;
  label: string;
}> = [
  { icon: 'home-outline', key: 'home', label: 'Início' },
  { icon: 'notifications-outline', key: 'notifications', label: 'Notificações' },
  { icon: 'search', key: 'search', label: 'Buscar' },
  { icon: 'person-outline', key: 'profile', label: 'Perfil' },
];

export function TeamExperienceBottomBar({
  activeKey = null,
  hasUnreadNotifications = false,
  onHomePress,
  onNotificationsPress,
  onProfilePress,
  onSearchPress,
  theme,
}: TeamExperienceBottomBarProps) {
  return (
    <View
      className="absolute bottom-0 left-0 right-0 h-[94px] flex-row px-2 pb-[14px] pt-3"
      style={{ backgroundColor: theme.surfaceBase, borderTopColor: theme.borderDefault, borderTopWidth: 1 }}
      nativeID="team-experience-bottom-bar"
      testID="team-experience-bottom-bar"
    >
      {BOTTOM_ITEMS.map((item) => {
        const active = item.key === activeKey;
        const onPress =
          item.key === 'home'
            ? onHomePress
            : item.key === 'notifications'
              ? onNotificationsPress
              : item.key === 'search'
                ? onSearchPress
                : onProfilePress;

        return (
          <Pressable
            accessibilityRole="button"
            className="flex-1 items-center justify-center gap-2"
            key={item.key}
            onPress={onPress}
            nativeID={`team-experience-bottom-bar-button-${item.key}`}
            testID={`team-experience-bottom-bar-button-${item.key}`}
          >
            <View>
              <Ionicons color={active ? theme.accentPrimary : theme.textMuted} name={item.icon} size={22} />
              {item.key === 'notifications' && hasUnreadNotifications && !active ? (
                <View className="absolute -right-[2px] -top-[2px] h-2 w-2 rounded-full" style={{ backgroundColor: theme.accentPrimary }} />
              ) : null}
            </View>
            <Text className="text-[13px] leading-[18px]" style={{ color: active ? theme.accentPrimary : theme.textMuted }}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
