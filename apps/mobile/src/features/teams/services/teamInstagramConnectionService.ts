import { Platform } from 'react-native';

import { supabase } from '../../../lib/supabase';

type InstagramStartResult = {
  authorizationUrl: string;
  redirectUri: string;
  state: string;
};

type InstagramCompleteResult = {
  connection: {
    channel_url: string | null;
    connection_status: 'CONNECTED' | 'ERROR' | 'EXPIRED' | 'PENDING' | 'REVOKED';
    external_account_id: string | null;
    handle: string | null;
    last_validated_at: string | null;
    platform: 'INSTAGRAM';
    publish_events_enabled: boolean;
    team_id: string;
    token_expires_at: string | null;
  };
};

type InstagramValidateResult = InstagramCompleteResult;

export async function startInstagramConnection(teamId: string): Promise<InstagramStartResult> {
  const { data, error } = await supabase.functions.invoke('team-social-instagram', {
    body: {
      action: 'start',
      redirectUri: getInstagramRedirectUri(),
      teamId,
    },
  });

  if (error) {
    throw error;
  }

  return {
    authorizationUrl: data.authorizationUrl as string,
    redirectUri: data.redirectUri as string,
    state: data.state as string,
  };
}

export async function completeInstagramConnection(teamId: string, code: string, state?: string | null): Promise<InstagramCompleteResult> {
  const { data, error } = await supabase.functions.invoke('team-social-instagram', {
    body: {
      action: 'complete',
      authorizationCode: code,
      redirectUri: getInstagramRedirectUri(),
      state: state ?? null,
      teamId,
    },
  });

  if (error) {
    throw error;
  }

  return data as InstagramCompleteResult;
}

export async function validateInstagramConnection(teamId: string): Promise<InstagramValidateResult> {
  const { data, error } = await supabase.functions.invoke('team-social-instagram', {
    body: {
      action: 'validate',
      teamId,
    },
  });

  if (error) {
    throw error;
  }

  return data as InstagramValidateResult;
}

function getInstagramRedirectUri() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/?screen=team-settings&social_provider=instagram`;
  }

  return 'futstats://team-settings/social/instagram';
}
