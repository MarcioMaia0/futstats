import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

type Action = 'complete' | 'start' | 'validate';

type SocialConnectionStatus = 'PENDING' | 'CONNECTED' | 'EXPIRED' | 'REVOKED' | 'ERROR';

type StartPayload = {
  action: 'start';
  redirectUri?: string | null;
  teamId?: string | null;
};

type CompletePayload = {
  action: 'complete';
  authorizationCode?: string | null;
  redirectUri?: string | null;
  state?: string | null;
  teamId?: string | null;
};

type ValidatePayload = {
  action: 'validate';
  teamId?: string | null;
};

type RequestPayload = CompletePayload | StartPayload | ValidatePayload;

type InstagramTokenResponse = {
  access_token: string;
  expires_in?: number;
  permissions?: string;
  user_id?: number | string;
};

type InstagramProfileResponse = {
  account_type?: string;
  id?: string;
  user_id?: number | string;
  username?: string;
};

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

const INSTAGRAM_SCOPES = ['instagram_business_basic', 'instagram_business_content_publish'];

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed.' }, 405);
    }

    const payload = (await request.json()) as RequestPayload;
    const action = payload.action as Action | undefined;

    if (!action) {
      return jsonResponse({ error: 'Missing action.' }, 400);
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Missing Authorization header.' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      return jsonResponse({ error: 'Supabase environment is not configured.' }, 500);
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: 'Authenticated user not found.' }, 401);
    }

    if (action === 'start') {
      return await handleStart(payload as StartPayload);
    }

    if (!supabaseServiceRoleKey) {
      return jsonResponse({ error: 'SUPABASE_SERVICE_ROLE_KEY is required for Instagram connection actions.' }, 500);
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    if (action === 'complete') {
      return await handleComplete({
        adminClient,
        payload: payload as CompletePayload,
        userId: user.id,
        userClient,
      });
    }

    return await handleValidate({
      adminClient,
      payload: payload as ValidatePayload,
      userClient,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected Instagram connection error.';
    return jsonResponse({ error: message }, 500);
  }
});

async function handleStart(payload: StartPayload) {
  const teamId = payload.teamId?.trim();
  if (!teamId) {
    return jsonResponse({ error: 'teamId is required.' }, 400);
  }

  const instagramAppId = Deno.env.get('INSTAGRAM_APP_ID');
  const redirectUri = resolveRedirectUri(payload.redirectUri ?? null);

  if (!instagramAppId) {
    return jsonResponse({ error: 'INSTAGRAM_APP_ID is not configured.' }, 500);
  }

  if (!redirectUri) {
    return jsonResponse({ error: 'Instagram redirect URI is not configured.' }, 500);
  }

  const state = buildState(teamId);
  const authorizationUrl = new URL('https://www.instagram.com/oauth/authorize');
  authorizationUrl.searchParams.set('client_id', instagramAppId);
  authorizationUrl.searchParams.set('redirect_uri', redirectUri);
  authorizationUrl.searchParams.set('response_type', 'code');
  authorizationUrl.searchParams.set('scope', INSTAGRAM_SCOPES.join(','));
  authorizationUrl.searchParams.set('state', state);
  authorizationUrl.searchParams.set('force_reauth', 'true');

  return jsonResponse({
    authorizationUrl: authorizationUrl.toString(),
    redirectUri,
    state,
  });
}

async function handleComplete({
  adminClient,
  payload,
  userClient,
  userId,
}: {
  adminClient: ReturnType<typeof createClient>;
  payload: CompletePayload;
  userClient: ReturnType<typeof createClient>;
  userId: string;
}) {
  const teamId = payload.teamId?.trim();
  const authorizationCode = payload.authorizationCode?.trim();
  const redirectUri = resolveRedirectUri(payload.redirectUri ?? null);

  if (!teamId || !authorizationCode) {
    return jsonResponse({ error: 'teamId and authorizationCode are required.' }, 400);
  }

  if (!redirectUri) {
    return jsonResponse({ error: 'Instagram redirect URI is not configured.' }, 500);
  }

  const instagramAppId = Deno.env.get('INSTAGRAM_APP_ID');
  const instagramAppSecret = Deno.env.get('INSTAGRAM_APP_SECRET');
  const encryptionSecret = Deno.env.get('SOCIAL_CONNECTION_ENCRYPTION_KEY');

  if (!instagramAppId || !instagramAppSecret || !encryptionSecret) {
    return jsonResponse(
      {
        error:
          'Instagram completion requires INSTAGRAM_APP_ID, INSTAGRAM_APP_SECRET and SOCIAL_CONNECTION_ENCRYPTION_KEY.',
      },
      500,
    );
  }

  const shortLivedToken = await exchangeAuthorizationCode({
    authorizationCode,
    clientId: instagramAppId,
    clientSecret: instagramAppSecret,
    redirectUri,
  });

  const longLivedToken = await exchangeForLongLivedToken({
    accessToken: shortLivedToken.access_token,
    clientSecret: instagramAppSecret,
  });

  const profile = await fetchInstagramProfile(longLivedToken.access_token);

  if (!profile.username || !profile.id) {
    return jsonResponse({ error: 'Instagram did not return a valid professional account profile.' }, 502);
  }

  if (!isSupportedInstagramProfessionalAccount(profile.account_type)) {
    await userClient
      .from('team_social_connections')
      .upsert(
        {
          channel_url: profile.username ? `https://instagram.com/${profile.username}` : null,
          connection_status: 'ERROR',
          created_by_user_id: userId,
          external_account_id: profile.id ? String(profile.id) : null,
          handle: profile.username ? `@${profile.username}` : null,
          last_validated_at: new Date().toISOString(),
          platform: 'INSTAGRAM',
          publish_events_enabled: false,
          team_id: teamId,
        },
        { onConflict: 'team_id,platform' },
      );

    return jsonResponse(
      {
        error:
          'A conta conectada nao e profissional. Para conectar o Instagram do time, use uma conta Business ou Creator.',
      },
      400,
    );
  }

  const accessSecretRef = await insertSecret({
    adminClient,
    createdByUserId: userId,
    encryptedSecret: await encryptSecret(longLivedToken.access_token, encryptionSecret),
    metadata: {
      expires_in: longLivedToken.expires_in ?? null,
      source: 'instagram_login',
      username: profile.username,
    },
    platform: 'INSTAGRAM',
    secretKind: 'ACCESS_TOKEN',
  });

  const tokenExpiresAt =
    typeof longLivedToken.expires_in === 'number'
      ? new Date(Date.now() + longLivedToken.expires_in * 1000).toISOString()
      : null;

  const channelUrl = `https://instagram.com/${profile.username}`;

  const { data, error } = await userClient
    .from('team_social_connections')
    .upsert(
      {
        access_token_ref: accessSecretRef,
        channel_url: channelUrl,
        connection_status: 'CONNECTED',
        created_by_user_id: userId,
        external_account_id: String(profile.id),
        handle: `@${profile.username}`,
        last_validated_at: new Date().toISOString(),
        platform: 'INSTAGRAM',
        refresh_token_ref: null,
        team_id: teamId,
        token_expires_at: tokenExpiresAt,
      },
      { onConflict: 'team_id,platform' },
    )
    .select(
      'team_id, platform, handle, channel_url, connection_status, external_account_id, token_expires_at, publish_events_enabled, last_validated_at',
    )
    .single();

  if (error) {
    return jsonResponse({ error: error.message }, 400);
  }

  return jsonResponse({ connection: data });
}

async function handleValidate({
  adminClient,
  payload,
  userClient,
}: {
  adminClient: ReturnType<typeof createClient>;
  payload: ValidatePayload;
  userClient: ReturnType<typeof createClient>;
}) {
  const teamId = payload.teamId?.trim();
  const encryptionSecret = Deno.env.get('SOCIAL_CONNECTION_ENCRYPTION_KEY');

  if (!teamId) {
    return jsonResponse({ error: 'teamId is required.' }, 400);
  }

  if (!encryptionSecret) {
    return jsonResponse({ error: 'SOCIAL_CONNECTION_ENCRYPTION_KEY is not configured.' }, 500);
  }

  const { data: connection, error: connectionError } = await userClient
    .from('team_social_connections')
    .select(
      'team_id, platform, handle, channel_url, connection_status, external_account_id, access_token_ref, token_expires_at, publish_events_enabled, last_validated_at',
    )
    .eq('team_id', teamId)
    .eq('platform', 'INSTAGRAM')
    .maybeSingle();

  if (connectionError) {
    return jsonResponse({ error: connectionError.message }, 400);
  }

  if (!connection?.access_token_ref) {
    return jsonResponse({ error: 'Instagram account is not connected yet.' }, 400);
  }

  if (connection.token_expires_at && new Date(connection.token_expires_at).getTime() <= Date.now()) {
    const { data: expiredData, error: expiredError } = await userClient
      .from('team_social_connections')
      .update({
        connection_status: 'EXPIRED',
        publish_events_enabled: false,
      })
      .eq('team_id', teamId)
      .eq('platform', 'INSTAGRAM')
      .select(
        'team_id, platform, handle, channel_url, connection_status, external_account_id, token_expires_at, publish_events_enabled, last_validated_at',
      )
      .single();

    if (expiredError) {
      return jsonResponse({ error: expiredError.message }, 400);
    }

    return jsonResponse({ connection: expiredData });
  }

  const { data: secretRow, error: secretError } = await adminClient
    .from('social_connection_secrets')
    .select('encrypted_secret')
    .eq('secret_ref', connection.access_token_ref)
    .maybeSingle();

  if (secretError || !secretRow?.encrypted_secret) {
    return jsonResponse({ error: 'Instagram access token secret was not found.' }, 400);
  }

  const accessToken = await decryptSecret(secretRow.encrypted_secret, encryptionSecret);
  const profile = await fetchInstagramProfile(accessToken);

  if (!isSupportedInstagramProfessionalAccount(profile.account_type)) {
    const { data: invalidAccountData, error: invalidAccountError } = await userClient
      .from('team_social_connections')
      .update({
        channel_url: profile.username ? `https://instagram.com/${profile.username}` : connection.channel_url,
        connection_status: 'ERROR',
        external_account_id: profile.id ? String(profile.id) : connection.external_account_id,
        handle: profile.username ? `@${profile.username}` : connection.handle,
        last_validated_at: new Date().toISOString(),
        publish_events_enabled: false,
      })
      .eq('team_id', teamId)
      .eq('platform', 'INSTAGRAM')
      .select(
        'team_id, platform, handle, channel_url, connection_status, external_account_id, token_expires_at, publish_events_enabled, last_validated_at',
      )
      .single();

    if (invalidAccountError) {
      return jsonResponse({ error: invalidAccountError.message }, 400);
    }

    return jsonResponse(
      {
        connection: invalidAccountData,
        error:
          'A conta conectada nao e profissional. Para conectar o Instagram do time, use uma conta Business ou Creator.',
      },
      400,
    );
  }

  const handle = profile.username ? `@${profile.username}` : connection.handle;
  const channelUrl = profile.username ? `https://instagram.com/${profile.username}` : connection.channel_url;

  const { data, error } = await userClient
    .from('team_social_connections')
    .update({
      channel_url: channelUrl,
      connection_status: 'CONNECTED',
      external_account_id: profile.id ? String(profile.id) : connection.external_account_id,
      handle,
      last_validated_at: new Date().toISOString(),
    })
    .eq('team_id', teamId)
    .eq('platform', 'INSTAGRAM')
    .select(
      'team_id, platform, handle, channel_url, connection_status, external_account_id, token_expires_at, publish_events_enabled, last_validated_at',
    )
    .single();

  if (error) {
    return jsonResponse({ error: error.message }, 400);
  }

  return jsonResponse({ connection: data });
}

async function exchangeAuthorizationCode({
  authorizationCode,
  clientId,
  clientSecret,
  redirectUri,
}: {
  authorizationCode: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}) {
  const formData = new FormData();
  formData.set('client_id', clientId);
  formData.set('client_secret', clientSecret);
  formData.set('grant_type', 'authorization_code');
  formData.set('redirect_uri', redirectUri);
  formData.set('code', authorizationCode);

  const response = await fetch('https://api.instagram.com/oauth/access_token', {
    body: formData,
    method: 'POST',
  });

  const data = (await response.json()) as InstagramTokenResponse & { error_message?: string; error_type?: string };

  if (!response.ok || !data.access_token) {
    throw new Error(data.error_message ?? data.error_type ?? 'Instagram authorization code exchange failed.');
  }

  return data;
}

async function exchangeForLongLivedToken({
  accessToken,
  clientSecret,
}: {
  accessToken: string;
  clientSecret: string;
}) {
  const url = new URL('https://graph.instagram.com/access_token');
  url.searchParams.set('grant_type', 'ig_exchange_token');
  url.searchParams.set('client_secret', clientSecret);
  url.searchParams.set('access_token', accessToken);

  const response = await fetch(url);
  const data = (await response.json()) as InstagramTokenResponse & { error?: { message?: string } };

  if (!response.ok || !data.access_token) {
    throw new Error(data.error?.message ?? 'Instagram long-lived token exchange failed.');
  }

  return data;
}

async function fetchInstagramProfile(accessToken: string) {
  const url = new URL('https://graph.instagram.com/me');
  url.searchParams.set('fields', 'id,user_id,username,account_type');
  url.searchParams.set('access_token', accessToken);

  const response = await fetch(url);
  const data = (await response.json()) as InstagramProfileResponse & { error?: { message?: string } };

  if (!response.ok || !data.username) {
    throw new Error(data.error?.message ?? 'Instagram profile validation failed.');
  }

  return data;
}

async function insertSecret({
  adminClient,
  createdByUserId,
  encryptedSecret,
  metadata,
  platform,
  secretKind,
}: {
  adminClient: ReturnType<typeof createClient>;
  createdByUserId: string;
  encryptedSecret: string;
  metadata: Record<string, unknown>;
  platform: 'INSTAGRAM';
  secretKind: 'ACCESS_TOKEN' | 'REFRESH_TOKEN';
}) {
  const { data, error } = await adminClient
    .from('social_connection_secrets')
    .insert({
      created_by_user_id: createdByUserId,
      encrypted_secret: encryptedSecret,
      key_version: 'v1',
      metadata,
      platform,
      secret_kind: secretKind,
    })
    .select('secret_ref')
    .single();

  if (error || !data?.secret_ref) {
    throw new Error(error?.message ?? 'Could not store Instagram secret.');
  }

  return data.secret_ref as string;
}

function resolveRedirectUri(clientRedirectUri: string | null) {
  return Deno.env.get('INSTAGRAM_REDIRECT_URI') ?? clientRedirectUri ?? null;
}

function buildState(teamId: string) {
  return btoa(
    JSON.stringify({
      nonce: crypto.randomUUID(),
      platform: 'INSTAGRAM',
      teamId,
      timestamp: Date.now(),
    }),
  );
}

function isSupportedInstagramProfessionalAccount(accountType?: string) {
  if (!accountType) {
    return false;
  }

  return ['BUSINESS', 'CREATOR', 'MEDIA_CREATOR'].includes(accountType.toUpperCase());
}

async function encryptSecret(secret: string, passphrase: string) {
  const key = await deriveAesKey(passphrase);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedSecret = new TextEncoder().encode(secret);
  const encrypted = await crypto.subtle.encrypt({ iv, name: 'AES-GCM' }, key, encodedSecret);

  return JSON.stringify({
    ciphertext: bytesToBase64(new Uint8Array(encrypted)),
    iv: bytesToBase64(iv),
    version: 'v1',
  });
}

async function decryptSecret(payload: string, passphrase: string) {
  const parsed = JSON.parse(payload) as { ciphertext: string; iv: string };
  const key = await deriveAesKey(passphrase);
  const decrypted = await crypto.subtle.decrypt(
    { iv: base64ToBytes(parsed.iv), name: 'AES-GCM' },
    key,
    base64ToBytes(parsed.ciphertext),
  );

  return new TextDecoder().decode(decrypted);
}

async function deriveAesKey(passphrase: string) {
  const material = new TextEncoder().encode(passphrase);
  const hash = await crypto.subtle.digest('SHA-256', material);
  return crypto.subtle.importKey('raw', hash, { length: 256, name: 'AES-GCM' }, false, ['decrypt', 'encrypt']);
}

function bytesToBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: corsHeaders,
    status,
  });
}
