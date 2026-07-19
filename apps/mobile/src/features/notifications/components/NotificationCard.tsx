import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Image, Pressable, Text, View } from 'react-native';

import type { ApprovedMembershipMode } from '../../teams/services/teamService';
import type { TeamExperienceTheme } from '../../../theme/teamExperienceTheme';

export type NotificationFilterKey = 'all' | 'attention' | 'team' | 'social' | 'games';

type BaseNotificationItem = {
  createdAt: string;
  id: string;
  pendingAction?: boolean;
  read?: boolean;
  teamCrestUrl?: string | null;
  teamId: string;
  teamName: string;
};

export type TeamJoinRequestCreatedNotification = BaseNotificationItem & {
  applicantAvatarUrl?: string | null;
  applicantName: string;
  applicantRoleLabel: string;
  applicantSubtitle?: string | null;
  approvalModeOptions: Array<{
    description: string;
    label: string;
    value: ApprovedMembershipMode;
  }>;
  joinRequestId: string | null;
  type: 'TEAM_JOIN_REQUEST_CREATED';
};

export type TeamJoinRequestResolvedNotification = BaseNotificationItem & {
  actionUrl?: string | null;
  decisionLabel: string;
  description: string;
  applicantName: string;
  type: 'TEAM_JOIN_REQUEST_APPROVED' | 'TEAM_JOIN_REQUEST_REJECTED';
};

export type GenericNotificationItem = BaseNotificationItem & {
  actionUrl?: string | null;
  description: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  type: 'MATCH_REMINDER' | 'SOCIAL_CONNECTION_ATTENTION' | 'PLAYER_WELCOME_PUBLISHED';
};

export type NotificationCardItem =
  | TeamJoinRequestCreatedNotification
  | TeamJoinRequestResolvedNotification
  | GenericNotificationItem;

type NotificationCardProps = {
  item: NotificationCardItem;
  onPress?: (item: NotificationCardItem) => void;
  theme: TeamExperienceTheme;
};

function hookProps(id: string) {
  return {
    nativeID: id,
    testID: id,
  };
}

export function NotificationCard({ item, onPress, theme }: NotificationCardProps) {
  const hookBase = `notifications-card-${item.id}`;
  const leadVisual = getLeadVisual(item);
  const createdAtLabel = formatNotificationCardTimestamp(item.createdAt);
  const showAttentionDot = !item.read || item.pendingAction;

  return (
    <Pressable
      accessibilityRole="button"
      className="gap-4 rounded-[26px] border p-4"
      onPress={() => onPress?.(item)}
      style={{ backgroundColor: theme.surfaceCard, borderColor: theme.borderDefault }}
      {...hookProps(hookBase)}
    >
      <View className="flex-row items-start gap-3" {...hookProps(`${hookBase}-header`)}>
        <AvatarVisual hookBase={`${hookBase}-avatar`} theme={theme} visual={leadVisual} />

        <View className="min-w-0 flex-1 gap-[6px]" {...hookProps(`${hookBase}-header-content`)}>
          <View className="flex-row items-start justify-between gap-3" {...hookProps(`${hookBase}-headline-row`)}>
            <View className="min-w-0 flex-1 gap-1" {...hookProps(`${hookBase}-headline-copy`)}>
              <Text className="text-[1.3rem] leading-[1.4rem] font-bold mb-1" style={{ color: theme.accentPrimary }} {...hookProps(`${hookBase}-title`)}>
                {getCardTitle(item)}
              </Text>
              <Text className="text-[0.95rem] leading-6" style={{ color: theme.textPrimary }} {...hookProps(`${hookBase}-subtitle`)}>
                {getCardSubtitle(item, theme)}
              </Text>
            </View>
            <View className="max-w-[72px] flex flex-col items-end">
              {showAttentionDot ? <View className="mt-[6px] h-[10px] w-[10px] rounded-full" style={{ backgroundColor: theme.accentPrimary }} {...hookProps(`${hookBase}-unread-dot`)} /> : null}
              <Text className="text-[0.9rem] leading-[1.35rem] text-right max-w-[55px]" style={{ color: theme.textMuted }} {...hookProps(`${hookBase}-timestamp`)}>
                {createdAtLabel}
              </Text>
            </View>
          </View>
        </View>
      </View>

    </Pressable>
  );
}

function getCardTitle(item: NotificationCardItem) {
  if (item.type === 'TEAM_JOIN_REQUEST_CREATED') {
    return `${item.applicantName}`;
  }

  if (item.type === 'TEAM_JOIN_REQUEST_APPROVED') {
    return 'Solicitação aprovada';
  }

  if (item.type === 'TEAM_JOIN_REQUEST_REJECTED') {
    return 'Solicitação recusada';
  }

  if (
    item.type === 'MATCH_REMINDER' ||
    item.type === 'SOCIAL_CONNECTION_ATTENTION' ||
    item.type === 'PLAYER_WELCOME_PUBLISHED'
  ) {
    return item.title;
  }

  return '';
}

function getCardSubtitle(item: NotificationCardItem, theme: TeamExperienceTheme) {
  if (item.type === 'TEAM_JOIN_REQUEST_CREATED') {
    return (
      <>
        Solicitou entrar em{' '}
        <Text style={{ color: theme.accentPrimary, fontWeight: '700' }}>{item.teamName}</Text>
        .
      </>
    );
  }

  if (item.type === 'TEAM_JOIN_REQUEST_APPROVED') {
    // return item.teamName;
    return (
      <>
        <Text style={{ color: theme.accentPrimary, fontWeight: '700' }}>{item.applicantName}</Text>
        {' '}é o novo integrante do time{' '}
        <Text style={{ color: theme.accentPrimary, fontWeight: '700' }}>{item.teamName}</Text>
        .
      </>
    );
  }

  if (item.type === 'TEAM_JOIN_REQUEST_REJECTED') {
    return item.teamName;
  }

  return item.teamName;
}

type NotificationLeadVisual =
  | { kind: 'team'; crestUrl?: string | null }
  | { kind: 'person'; avatarUrl?: string | null }
  | { kind: 'icon'; icon: ComponentProps<typeof Ionicons>['name'] };

function AvatarVisual({
  hookBase,
  theme,
  visual,
}: {
  hookBase: string;
  theme: TeamExperienceTheme;
  visual: NotificationLeadVisual;
}) {
  const iconName =
    visual.kind === 'team'
      ? 'shield-outline'
      : visual.kind === 'person'
        ? 'person-outline'
        : visual.icon;
  const imageUri = visual.kind === 'team' ? visual.crestUrl : visual.kind === 'person' ? visual.avatarUrl : null;
  const hasImage = Boolean(imageUri);

  if (hasImage && imageUri) {
    return (
      <View
        className="h-[58px] w-[58px] items-center justify-center overflow-hidden rounded-full"
        style={{
          backgroundColor: theme.surfaceBase,
          borderColor: theme.borderDefault,
          borderWidth: 1,
        }}
        {...hookProps(hookBase)}
      >
        <Image resizeMode="cover" source={{ uri: imageUri }} style={{ height: '100%', width: '100%' }} {...hookProps(`${hookBase}-image`)} />
      </View>
    );
  }

  return (
    <View className="h-[58px] w-[58px] items-center justify-center" {...hookProps(hookBase)}>
      <Ionicons color={theme.accentPrimary} name={iconName} size={40} {...hookProps(`${hookBase}-fallback-icon`)} />
    </View>
  );
}

function getLeadVisual(item: NotificationCardItem): NotificationLeadVisual {
  if (item.type === 'TEAM_JOIN_REQUEST_CREATED') {
    return {
      kind: 'person',
      avatarUrl: item.applicantAvatarUrl ?? null,
    };
  }

  if (item.type === 'TEAM_JOIN_REQUEST_APPROVED' || item.type === 'TEAM_JOIN_REQUEST_REJECTED') {
    return {
      kind: 'team',
      crestUrl: item.teamCrestUrl ?? null,
    };
  }

  if (
    item.type === 'MATCH_REMINDER' ||
    item.type === 'SOCIAL_CONNECTION_ATTENTION' ||
    item.type === 'PLAYER_WELCOME_PUBLISHED'
  ) {
    return {
      kind: 'icon',
      icon: item.icon,
    };
  }

  return {
    kind: 'team',
    crestUrl: item.teamCrestUrl ?? null,
  };
}

function formatNotificationCardTimestamp(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) {
    return 'Agora';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  return `${Math.floor(diffHours / 24)}d`;
}
