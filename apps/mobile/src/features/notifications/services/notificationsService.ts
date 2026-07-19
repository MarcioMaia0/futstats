import { supabase } from '../../../lib/supabase';
import type { ApprovedMembershipMode, TeamSummary } from '../../teams/services/teamService';
import type { NotificationCardItem } from '../components/NotificationCard';

type NotificationRow = {
  action_url: string | null;
  archived_at: string | null;
  body: string | null;
  created_at: string;
  id: string;
  payload: Record<string, unknown> | null;
  read_at: string | null;
  status: 'UNREAD' | 'READ' | 'ARCHIVED';
  title: string;
  type:
    | 'TEAM_JOIN_REQUEST_CREATED'
    | 'TEAM_JOIN_REQUEST_APPROVED'
    | 'TEAM_JOIN_REQUEST_REJECTED'
    | 'MATCH_REMINDER'
    | 'SOCIAL_CONNECTION_ATTENTION'
    | 'PLAYER_WELCOME_PUBLISHED';
};

type JoinRequestQueueRow = {
  approved_membership_mode: ApprovedMembershipMode | null;
  id: string;
  rejection_reason: string | null;
  requested_at: string;
  requester: {
    avatar_url: string | null;
    display_name: string | null;
    full_name: string | null;
    has_player: boolean;
    nickname: string | null;
    person_id: string;
  };
  requester_user_id: string;
  responded_at: string | null;
  source_context: 'START_PATH_SELECTION' | 'TEAM_DISCOVERY' | 'TEAM_PROFILE' | 'OTHER' | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  team_id: string;
};

type NotificationFeedResult = {
  items: NotificationCardItem[];
};

const APPROVAL_MODE_OPTIONS: Array<{
  description: string;
  label: string;
  value: ApprovedMembershipMode;
}> = [
  {
    description: 'Entra apenas para compor o elenco esportivo.',
    label: 'Jogador',
    value: 'PLAYER',
  },
  {
    description: 'Entra para apoiar a operação do time sem vínculo esportivo.',
    label: 'Comissão',
    value: 'COMMITTEE',
  },
  {
    description: 'Entra com acesso de gestão do time.',
    label: 'Diretoria',
    value: 'DIRECTOR',
  },
  {
    description: 'Entra como responsável principal pelo time.',
    label: 'Presidência',
    value: 'PRESIDENT',
  },
  {
    description: 'Entra no elenco e também fica disponível para apoiar a comissão do time.',
    label: 'Jogador + comissão',
    value: 'PLAYER_COMMITTEE',
  },
  {
    description: 'Entra no elenco e também ganha acesso de diretoria.',
    label: 'Jogador + diretoria',
    value: 'PLAYER_DIRECTOR',
  },
  {
    description: 'Entra no elenco e também ganha acesso de presidência.',
    label: 'Jogador + presidência',
    value: 'PLAYER_PRESIDENT',
  },
];

export async function fetchNotificationsFeed(team: TeamSummary | null): Promise<NotificationFeedResult> {
  const { data, error } = await supabase.rpc('get_my_notifications', {
    p_include_archived: false,
  });

  if (error) {
    throw error;
  }

  const notifications = (data ?? []) as NotificationRow[];
  const pendingJoinRequests = await fetchPendingJoinRequestMap(team, notifications);

  return {
    items: notifications
      .map((row) => mapNotificationRowToCardItem(row, team, pendingJoinRequests.get(readPayloadString(row.payload, 'join_request_id') ?? '')))
      .filter((item): item is NotificationCardItem => item !== null)
      .sort(sortNotificationItems),
  };
}

export async function fetchUnreadNotificationsCount() {
  const { count: unreadCount, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'UNREAD');

  if (error) {
    throw error;
  }

  const { count: pendingJoinRequestCount, error: pendingError } = await supabase
    .from('team_join_requests')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'PENDING');

  if (pendingError) {
    throw pendingError;
  }

  return Math.max(unreadCount ?? 0, pendingJoinRequestCount ?? 0);
}

export async function markNotificationRead(notificationId: string) {
  const { error } = await supabase.rpc('mark_notification_read', {
    p_notification_id: notificationId,
  });

  if (error) {
    throw error;
  }
}

export async function archiveNotification(notificationId: string) {
  const { error } = await supabase.rpc('archive_notification', {
    p_notification_id: notificationId,
  });

  if (error) {
    throw error;
  }
}

export async function approveJoinRequest(requestId: string, approvedMembershipMode: ApprovedMembershipMode) {
  const { error } = await supabase.rpc('approve_team_join_request', {
    p_approved_membership_mode: approvedMembershipMode,
    p_request_id: requestId,
  });

  if (error) {
    throw error;
  }
}

export async function rejectJoinRequest(requestId: string, reason?: string | null) {
  const { error } = await supabase.rpc('reject_team_join_request', {
    p_reason: normalizeOptionalText(reason),
    p_request_id: requestId,
  });

  if (error) {
    throw error;
  }
}

function mapNotificationRowToCardItem(
  row: NotificationRow,
  team: TeamSummary | null,
  joinRequestRow?: JoinRequestQueueRow,
): NotificationCardItem | null {
  const payload = row.payload ?? {};
  const teamId = readPayloadString(payload, 'team_id') ?? team?.id ?? 'unknown-team';
  const teamName = readPayloadString(payload, 'team_name') ?? team?.name ?? 'Seu time';
  const teamCrestUrl = team?.id === teamId ? team.crest_url ?? null : null;

  if (row.type === 'TEAM_JOIN_REQUEST_CREATED') {
    const applicantName =
      joinRequestRow?.requester.display_name ??
      readPayloadString(payload, 'requester_display_name') ??
      'Pessoa interessada';

    return {
      applicantAvatarUrl: joinRequestRow?.requester.avatar_url ?? null,
      applicantName,
      applicantRoleLabel: '',
      applicantSubtitle: buildApplicantSubtitle(joinRequestRow),
      approvalModeOptions: APPROVAL_MODE_OPTIONS,
      createdAt: row.created_at,
      id: row.id,
      joinRequestId: readPayloadString(payload, 'join_request_id') ?? joinRequestRow?.id ?? null,
      pendingAction: true,
      read: row.status !== 'UNREAD',
      teamCrestUrl,
      teamId,
      teamName,
      type: 'TEAM_JOIN_REQUEST_CREATED',
    };
  }

  if (row.type === 'TEAM_JOIN_REQUEST_APPROVED' || row.type === 'TEAM_JOIN_REQUEST_REJECTED') {
    return {
      actionUrl: row.action_url,
      applicantName: readPayloadString(payload, 'requester_display_name') ?? 'Sua solicitação',
      createdAt: row.created_at,
      decisionLabel: row.type === 'TEAM_JOIN_REQUEST_APPROVED' ? 'Aprovada' : 'Recusada',
      description: row.body ?? '',
      id: row.id,
      read: row.status !== 'UNREAD',
      teamCrestUrl,
      teamId,
      teamName,
      type: row.type,
    };
  }

  if (row.type === 'MATCH_REMINDER') {
    return {
      actionUrl: row.action_url,
      createdAt: row.created_at,
      description: row.body ?? '',
      icon: 'calendar-outline',
      id: row.id,
      read: row.status !== 'UNREAD',
      teamCrestUrl,
      teamId,
      teamName,
      title: row.title,
      type: 'MATCH_REMINDER',
    };
  }

  if (row.type === 'SOCIAL_CONNECTION_ATTENTION') {
    return {
      actionUrl: row.action_url,
      createdAt: row.created_at,
      description: row.body ?? '',
      icon: resolveSocialNotificationIcon(payload),
      id: row.id,
      read: row.status !== 'UNREAD',
      teamCrestUrl,
      teamId,
      teamName,
      title: row.title,
      type: 'SOCIAL_CONNECTION_ATTENTION',
    };
  }

  if (row.type === 'PLAYER_WELCOME_PUBLISHED') {
    return {
      actionUrl: row.action_url,
      createdAt: row.created_at,
      description: row.body ?? '',
      icon: 'megaphone-outline',
      id: row.id,
      read: row.status !== 'UNREAD',
      teamCrestUrl,
      teamId,
      teamName,
      title: row.title,
      type: 'PLAYER_WELCOME_PUBLISHED',
    };
  }

  return null;
}

function sortNotificationItems(a: NotificationCardItem, b: NotificationCardItem) {
  const aPending = a.pendingAction ? 1 : 0;
  const bPending = b.pendingAction ? 1 : 0;

  if (aPending !== bPending) {
    return bPending - aPending;
  }

  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

async function fetchPendingJoinRequestMap(team: TeamSummary | null, notifications: NotificationRow[]) {
  const map = new Map<string, JoinRequestQueueRow>();
  const hasPendingJoinRequestNotification = notifications.some((item) => item.type === 'TEAM_JOIN_REQUEST_CREATED');

  if (!team?.id || !hasPendingJoinRequestNotification) {
    return map;
  }

  const { data, error } = await supabase.rpc('get_team_join_request_queue', {
    p_status: 'PENDING',
    p_team_id: team.id,
  });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as JoinRequestQueueRow[];
  rows.forEach((row) => {
    map.set(row.id, row);
  });

  return map;
}

function buildApplicantSubtitle(joinRequestRow?: JoinRequestQueueRow) {
  if (!joinRequestRow?.requester.has_player) {
    return null;
  }

  return 'Já possui perfil de jogador no app. A função final no time será definida pela gestão.';
}

function normalizeOptionalText(value?: string | null) {
  const normalized = value?.trim() ?? '';
  return normalized.length ? normalized : null;
}

function readPayloadString(payload: Record<string, unknown> | null, key: string) {
  const value = payload?.[key];
  return typeof value === 'string' && value.trim().length ? value : null;
}

function resolveSocialNotificationIcon(payload: Record<string, unknown> | null) {
  const platform = readPayloadString(payload, 'platform')?.toUpperCase();

  if (platform === 'YOUTUBE') {
    return 'logo-youtube';
  }

  if (platform === 'TIKTOK') {
    return 'logo-tiktok';
  }

  return 'logo-instagram';
}
