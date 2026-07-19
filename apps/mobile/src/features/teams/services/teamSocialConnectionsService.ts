import { supabase } from '../../../lib/supabase';
import type { SocialPlatform } from './teamService';

export type SocialConnectionStatus = 'PENDING' | 'CONNECTED' | 'EXPIRED' | 'REVOKED' | 'ERROR';

export type TeamSocialConnection = {
  channelUrl: string | null;
  connectionStatus: SocialConnectionStatus;
  externalAccountId: string | null;
  handle: string | null;
  lastPublishAt: string | null;
  lastValidatedAt: string | null;
  platform: SocialPlatform;
  publishEventsEnabled: boolean;
  teamId: string;
  tokenExpiresAt: string | null;
};

type TeamSocialConnectionRow = {
  channel_url: string | null;
  connection_status: SocialConnectionStatus;
  external_account_id: string | null;
  handle: string | null;
  last_publish_at: string | null;
  last_validated_at: string | null;
  platform: SocialPlatform;
  publish_events_enabled: boolean;
  team_id: string;
  token_expires_at: string | null;
};

type TeamSocialConnectionPatch = {
  channelUrl?: string | null;
  connectionStatus?: SocialConnectionStatus;
  handle?: string | null;
  lastValidatedAt?: string | null;
  publishEventsEnabled?: boolean;
};

const TEAM_SOCIAL_CONNECTION_SELECT =
  'team_id, platform, handle, channel_url, connection_status, external_account_id, token_expires_at, publish_events_enabled, last_validated_at, last_publish_at';

export async function fetchTeamSocialConnections(teamId: string): Promise<TeamSocialConnection[]> {
  const { data, error } = await supabase
    .from('team_social_connections')
    .select(TEAM_SOCIAL_CONNECTION_SELECT)
    .eq('team_id', teamId)
    .order('platform', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapTeamSocialConnectionRow);
}

export async function saveTeamSocialConnection(
  teamId: string,
  platform: SocialPlatform,
  patch: TeamSocialConnectionPatch,
): Promise<TeamSocialConnection> {
  const payload: Record<string, unknown> = {
    team_id: teamId,
    platform,
  };

  if (patch.handle !== undefined) {
    payload.handle = normalizeNullableText(patch.handle);
  }

  if (patch.channelUrl !== undefined) {
    payload.channel_url = normalizeNullableText(patch.channelUrl);
  }

  if (patch.connectionStatus !== undefined) {
    payload.connection_status = patch.connectionStatus;
  }

  if (patch.publishEventsEnabled !== undefined) {
    payload.publish_events_enabled = patch.publishEventsEnabled;
  }

  if (patch.lastValidatedAt !== undefined) {
    payload.last_validated_at = patch.lastValidatedAt;
  }

  const { data, error } = await supabase
    .from('team_social_connections')
    .upsert(payload, { onConflict: 'team_id,platform' })
    .select(TEAM_SOCIAL_CONNECTION_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return mapTeamSocialConnectionRow(data as TeamSocialConnectionRow);
}

export async function disconnectTeamSocialConnection(
  teamId: string,
  platform: SocialPlatform,
): Promise<TeamSocialConnection> {
  return saveTeamSocialConnection(teamId, platform, {
    connectionStatus: 'REVOKED',
    lastValidatedAt: null,
    publishEventsEnabled: false,
  });
}

function mapTeamSocialConnectionRow(row: TeamSocialConnectionRow): TeamSocialConnection {
  return {
    channelUrl: row.channel_url,
    connectionStatus: row.connection_status,
    externalAccountId: row.external_account_id,
    handle: row.handle,
    lastPublishAt: row.last_publish_at,
    lastValidatedAt: row.last_validated_at,
    platform: row.platform,
    publishEventsEnabled: row.publish_events_enabled,
    teamId: row.team_id,
    tokenExpiresAt: row.token_expires_at,
  };
}

function normalizeNullableText(value: string | null | undefined) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}
