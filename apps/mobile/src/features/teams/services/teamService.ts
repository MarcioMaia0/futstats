import { supabase } from '../../../lib/supabase';
import { getMe } from '../../identity/services/identityService';
import type { TeamExperienceThemeOverrides } from '../../../theme/teamExperienceTheme';

export type SportModality = 'FUTSAL' | 'SOCIETY' | 'FIELD';
export type ModalityFrameCount = 1 | 2;
export type ModalityFrameCounts = Partial<Record<SportModality, ModalityFrameCount>>;

export type HomeMatchCapability = 'HAS_HOME_VENUE' | 'NO_HOME_VENUE' | 'NOT_DEFINED_YET';

export type SocialPlatform = 'YOUTUBE' | 'INSTAGRAM' | 'TIKTOK';
export type ApprovedMembershipMode =
  | 'PLAYER'
  | 'COMMITTEE'
  | 'DIRECTOR'
  | 'PRESIDENT'
  | 'PLAYER_COMMITTEE'
  | 'PLAYER_DIRECTOR'
  | 'PLAYER_PRESIDENT';

export type TeamSummary = {
  id: string;
  name: string;
  slug: string;
  crest_media_id: string | null;
  crest_url: string | null;
  founded_day: number | null;
  founded_month: number | null;
  founded_year: number | null;
  modality_frame_counts: ModalityFrameCounts;
  modalities: SportModality[];
  home_match_capability: HomeMatchCapability;
  region_state: string | null;
  region_city: string | null;
  region_zone: string | null;
  primary_venue_id: string | null;
  colors: {
    first_color: string | null;
    second_color: string | null;
    third_color: string | null;
  };
  theme: TeamExperienceThemeOverrides | null;
  settings?: {
    comments_enabled: boolean;
    default_publish_team_events: boolean;
    public_feed_enabled: boolean;
    reactions_enabled: boolean;
  } | null;
};

export type TeamVenue = {
  address_district: string | null;
  address_line: string | null;
  address_number: string | null;
  id: string;
  is_primary: boolean;
  name: string;
  postal_code: string | null;
  region_city: string | null;
  region_state: string | null;
  region_zone: string | null;
};

export type TeamJoinSearchItem = {
  crest_url: string | null;
  location_label: string | null;
  name: string;
  region_city: string | null;
  region_state: string | null;
  region_zone: string | null;
  request_context: {
    already_member: boolean;
    can_request_join: boolean;
    has_pending_join_request: boolean;
  };
  slug: string;
  team_id: string;
};

export type TeamJoinRequestResult = {
  join_request: {
    id: string;
    requested_at: string;
    requester_user_id: string;
    source_context: 'START_PATH_SELECTION' | 'TEAM_DISCOVERY' | 'TEAM_PROFILE' | 'OTHER' | null;
    status: 'PENDING';
    team_id: string;
  };
  team_summary: {
    crest_url: string | null;
    name: string;
    team_id: string;
  };
};

export type CreatedTeamResult = {
  membership: {
    role: 'DIRECTOR';
    team_member_id: string;
  };
  team: TeamSummary;
};

export type CreateTeamPayload = {
  name: string;
  crest_upload_token?: string | null;
  founded_day?: number | null;
  founded_month?: number | null;
  founded_year?: number | null;
  region_state?: string | null;
  region_city?: string | null;
  region_zone?: string | null;
  first_color?: string | null;
  second_color?: string | null;
  third_color?: string | null;
  home_match_capability?: HomeMatchCapability;
  modality_frame_counts?: ModalityFrameCounts;
  modalities?: SportModality[];
  primary_venue?: {
    name?: string | null;
    region_state?: string | null;
    region_city?: string | null;
    region_zone?: string | null;
    address_line?: string | null;
    address_number?: string | null;
    address_district?: string | null;
    postal_code?: string | null;
    external_place_provider?: string | null;
    external_place_id?: string | null;
  } | null;
  social_accounts?: Array<{
    platform: SocialPlatform;
    handle?: string | null;
    channel_url?: string | null;
  }>;
};

export type SaveTeamSettingsPayload = {
  commentsEnabled: boolean;
  defaultPublishTeamEvents: boolean;
  firstColor?: string | null;
  modalityFrameCounts?: ModalityFrameCounts;
  modalities: SportModality[];
  name: string;
  publicFeedEnabled: boolean;
  reactionsEnabled: boolean;
  secondColor?: string | null;
  thirdColor?: string | null;
  themeOverrides?: TeamExperienceThemeOverrides | null;
};

export type SaveTeamVenuePayload = {
  addressDistrict?: string | null;
  addressLine?: string | null;
  addressNumber?: string | null;
  name: string;
  postalCode?: string | null;
  regionCity?: string | null;
  regionState?: string | null;
  regionZone?: string | null;
};

type TeamThemeSettingsRow = {
  ui_accent_on_primary_color: string | null;
  ui_accent_primary_color: string | null;
  ui_border_default_color: string | null;
  ui_surface_base_color: string | null;
  ui_surface_card_color: string | null;
  ui_text_muted_color: string | null;
  ui_text_primary_color: string | null;
};

type TeamSettingsRow = TeamThemeSettingsRow & {
  comments_enabled: boolean;
  default_publish_team_events: boolean;
  public_feed_enabled: boolean;
  reactions_enabled: boolean;
};

type TeamSearchRow = {
  crest_media_id: string | null;
  id: string;
  name: string;
  region_city: string | null;
  region_state: string | null;
  region_zone: string | null;
  slug: string;
};

type MePayload = {
  person?: {
    id?: string;
  } | null;
};

export async function createTeam(payload: CreateTeamPayload): Promise<CreatedTeamResult> {
  const { data, error } = await supabase.rpc('create_team', {
    p_payload: payload,
  });

  if (error) {
    throw error;
  }

  const createdTeam = data as CreatedTeamResult;
  await saveTeamModalityFrameCounts(createdTeam.team.id, payload.modalities ?? [], payload.modality_frame_counts);

  const savedTeam = await fetchTeamSummary(createdTeam.team.id);

  return {
    ...createdTeam,
    team: savedTeam ?? createdTeam.team,
  };
}

export async function fetchFirstManagedTeam(personId: string): Promise<TeamSummary | null> {
  const { data: membership, error: membershipError } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('person_id', personId)
    .eq('membership_status', 'ACTIVE')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    throw membershipError;
  }

  if (!membership?.team_id) {
    return null;
  }

  const { data: teamRow, error: teamError } = await supabase
    .from('teams')
    .select(
      'id, name, slug, crest_media_id, founded_day, founded_month, founded_year, home_match_capability, region_state, region_city, region_zone, primary_venue_id, first_color, second_color, third_color',
    )
    .eq('id', membership.team_id)
    .maybeSingle();

  if (teamError) {
    throw teamError;
  }

  if (!teamRow) {
    return null;
  }

  const { data: modalitiesRows, error: modalitiesError } = await supabase
    .from('team_modalities')
    .select('modality, default_match_frame_count')
    .eq('team_id', membership.team_id)
    .order('modality', { ascending: true });

  if (modalitiesError) {
    throw modalitiesError;
  }

  const { data: teamSettingsRow, error: teamSettingsError } = await supabase
    .from('team_settings')
    .select(
      'comments_enabled, default_publish_team_events, public_feed_enabled, reactions_enabled, ui_accent_on_primary_color, ui_accent_primary_color, ui_border_default_color, ui_surface_base_color, ui_surface_card_color, ui_text_muted_color, ui_text_primary_color',
    )
    .eq('team_id', membership.team_id)
    .maybeSingle();

  if (teamSettingsError) {
    throw teamSettingsError;
  }

  let crestUrl: string | null = null;

  if (teamRow.crest_media_id) {
    const { data: mediaRow, error: mediaError } = await supabase
      .from('media_assets')
      .select('public_url')
      .eq('id', teamRow.crest_media_id)
      .maybeSingle();

    if (mediaError) {
      throw mediaError;
    }

    crestUrl = mediaRow?.public_url ?? null;
  }

  return {
    id: teamRow.id,
    name: teamRow.name,
    slug: teamRow.slug,
    crest_media_id: teamRow.crest_media_id,
    crest_url: crestUrl,
    founded_day: teamRow.founded_day,
    founded_month: teamRow.founded_month,
    founded_year: teamRow.founded_year,
    modality_frame_counts: buildModalityFrameCounts(modalitiesRows),
    modalities: (modalitiesRows ?? []).map((row) => row.modality as SportModality),
    home_match_capability: teamRow.home_match_capability as HomeMatchCapability,
    region_state: teamRow.region_state,
    region_city: teamRow.region_city,
    region_zone: teamRow.region_zone,
    primary_venue_id: teamRow.primary_venue_id,
    colors: {
      first_color: teamRow.first_color,
      second_color: teamRow.second_color,
      third_color: teamRow.third_color,
    },
    settings: buildTeamSettings(teamSettingsRow),
    theme: buildTeamThemeOverrides(teamSettingsRow),
  };
}

export async function searchTeamsForJoin(query: string, limit = 10): Promise<TeamJoinSearchItem[]> {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 2) {
    return [];
  }

  const [{ data: authData, error: authError }, mePayload] = await Promise.all([supabase.auth.getUser(), getMe()]);

  if (authError) {
    throw authError;
  }

  const currentUserId = authData.user?.id;
  const personId = (mePayload as MePayload).person?.id ?? null;

  if (!currentUserId || !personId) {
    throw new Error('AUTH_REQUIRED');
  }

  const safeLimit = Math.max(1, Math.min(limit, 20));
  const { data: teamRows, error: teamsError } = await supabase
    .from('teams')
    .select('id, name, slug, crest_media_id, region_state, region_city, region_zone')
    .ilike('name', `%${normalizedQuery}%`)
    .order('name', { ascending: true })
    .limit(safeLimit);

  if (teamsError) {
    throw teamsError;
  }

  const rows = (teamRows ?? []) as TeamSearchRow[];

  if (!rows.length) {
    return [];
  }

  const teamIds = rows.map((row) => row.id);
  const crestMediaIds = rows.map((row) => row.crest_media_id).filter((value): value is string => Boolean(value));

  const [
    { data: pendingRows, error: pendingError },
    { data: membershipRows, error: membershipError },
    mediaResponse,
  ] = await Promise.all([
    supabase
      .from('team_join_requests')
      .select('team_id')
      .eq('requester_user_id', currentUserId)
      .eq('status', 'PENDING')
      .in('team_id', teamIds),
    supabase
      .from('team_members')
      .select('team_id')
      .eq('person_id', personId)
      .eq('membership_status', 'ACTIVE')
      .in('team_id', teamIds),
    crestMediaIds.length
      ? supabase.from('media_assets').select('id, public_url').in('id', crestMediaIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (pendingError) {
    throw pendingError;
  }

  if (membershipError) {
    throw membershipError;
  }

  if (mediaResponse.error) {
    throw mediaResponse.error;
  }

  const pendingTeamIds = new Set((pendingRows ?? []).map((row) => row.team_id as string));
  const memberTeamIds = new Set((membershipRows ?? []).map((row) => row.team_id as string));
  const crestMap = new Map((mediaResponse.data ?? []).map((row) => [row.id as string, row.public_url as string | null]));

  return rows.map((row) => {
    const alreadyMember = memberTeamIds.has(row.id);
    const hasPendingJoinRequest = pendingTeamIds.has(row.id);

    return {
      crest_url: row.crest_media_id ? crestMap.get(row.crest_media_id) ?? null : null,
      location_label: buildTeamLocationLabel(row),
      name: row.name,
      region_city: row.region_city,
      region_state: row.region_state,
      region_zone: row.region_zone,
      request_context: {
        already_member: alreadyMember,
        can_request_join: !alreadyMember && !hasPendingJoinRequest,
        has_pending_join_request: hasPendingJoinRequest,
      },
      slug: row.slug,
      team_id: row.id,
    };
  });
}

export async function createTeamJoinRequest(teamId: string): Promise<TeamJoinRequestResult> {
  const { data, error } = await supabase.rpc('create_team_join_request', {
    p_source_context: 'START_PATH_SELECTION',
    p_team_id: teamId,
  });

  if (error) {
    throw error;
  }

  return data as TeamJoinRequestResult;
}

export async function saveTeamThemeOverrides(teamId: string, overrides: TeamExperienceThemeOverrides | null): Promise<TeamExperienceThemeOverrides | null> {
  const payload = {
    team_id: teamId,
    ui_accent_on_primary_color: normalizeThemeColor(overrides?.accentOnPrimary),
    ui_accent_primary_color: normalizeThemeColor(overrides?.accentPrimary),
    ui_border_default_color: normalizeThemeColor(overrides?.borderDefault),
    ui_surface_base_color: normalizeThemeColor(overrides?.surfaceBase),
    ui_surface_card_color: normalizeThemeColor(overrides?.surfaceCard),
    ui_text_muted_color: normalizeThemeColor(overrides?.textMuted),
    ui_text_primary_color: normalizeThemeColor(overrides?.textPrimary),
  };

  const { data, error } = await supabase
    .from('team_settings')
    .upsert(payload, { onConflict: 'team_id' })
    .select(
      'ui_accent_on_primary_color, ui_accent_primary_color, ui_border_default_color, ui_surface_base_color, ui_surface_card_color, ui_text_muted_color, ui_text_primary_color',
    )
    .maybeSingle();

  if (error) {
    throw error;
  }

  return buildTeamThemeOverrides(data);
}

export async function saveTeamSettings(teamId: string, payload: SaveTeamSettingsPayload): Promise<TeamSummary> {
  const normalizedName = payload.name.trim();

  if (!normalizedName) {
    throw new Error('Informe o nome do time.');
  }

  const normalizedModalities = normalizeModalities(payload.modalities);
  const { data: existingModalitiesRows, error: existingModalitiesError } = await supabase
    .from('team_modalities')
    .select('modality, default_match_frame_count')
    .eq('team_id', teamId);

  if (existingModalitiesError) {
    throw existingModalitiesError;
  }

  const existingFrameCounts = buildModalityFrameCounts(existingModalitiesRows);

  const { error: teamError } = await supabase
    .from('teams')
    .update({
      first_color: normalizeOptionalText(payload.firstColor),
      name: normalizedName,
      second_color: normalizeOptionalText(payload.secondColor),
      third_color: normalizeOptionalText(payload.thirdColor),
    })
    .eq('id', teamId);

  if (teamError) {
    throw teamError;
  }

  const settingsPayload = {
    comments_enabled: payload.commentsEnabled,
    default_publish_team_events: payload.defaultPublishTeamEvents,
    public_feed_enabled: payload.publicFeedEnabled,
    reactions_enabled: payload.reactionsEnabled,
    team_id: teamId,
    ui_accent_on_primary_color: normalizeThemeColor(payload.themeOverrides?.accentOnPrimary),
    ui_accent_primary_color: normalizeThemeColor(payload.themeOverrides?.accentPrimary),
    ui_border_default_color: normalizeThemeColor(payload.themeOverrides?.borderDefault),
    ui_surface_base_color: normalizeThemeColor(payload.themeOverrides?.surfaceBase),
    ui_surface_card_color: normalizeThemeColor(payload.themeOverrides?.surfaceCard),
    ui_text_muted_color: normalizeThemeColor(payload.themeOverrides?.textMuted),
    ui_text_primary_color: normalizeThemeColor(payload.themeOverrides?.textPrimary),
  };

  const { error: settingsError } = await supabase
    .from('team_settings')
    .upsert(settingsPayload, { onConflict: 'team_id' });

  if (settingsError) {
    throw settingsError;
  }

  const { error: deleteModalitiesError } = await supabase
    .from('team_modalities')
    .delete()
    .eq('team_id', teamId);

  if (deleteModalitiesError) {
    throw deleteModalitiesError;
  }

  if (normalizedModalities.length) {
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError) {
      throw authError;
    }

    const { error: insertModalitiesError } = await supabase.from('team_modalities').insert(
      normalizedModalities.map((modality) => ({
        created_by_user_id: authData.user?.id ?? null,
        default_match_frame_count: normalizeModalityFrameCount(
          payload.modalityFrameCounts?.[modality] ?? existingFrameCounts[modality],
        ),
        modality,
        team_id: teamId,
      })),
    );

    if (insertModalitiesError) {
      throw insertModalitiesError;
    }
  }

  const savedTeam = await fetchTeamSummary(teamId);

  if (!savedTeam) {
    throw new Error('Nao foi possivel recarregar o time salvo.');
  }

  return savedTeam;
}

export async function fetchTeamVenues(teamId: string, primaryVenueId?: string | null): Promise<TeamVenue[]> {
  const { data, error } = await supabase
    .from('venues')
    .select('id, name, region_state, region_city, region_zone, address_line, address_number, address_district, postal_code')
    .eq('owner_team_id', teamId)
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapVenueRow(row, primaryVenueId ?? null));
}

export async function createTeamVenue(teamId: string, payload: SaveTeamVenuePayload, primaryVenueId?: string | null): Promise<TeamVenue> {
  const normalizedName = payload.name.trim();

  if (!normalizedName) {
    throw new Error('Informe o nome da quadra.');
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  const { data, error } = await supabase
    .from('venues')
    .insert({
      address_district: normalizeOptionalText(payload.addressDistrict),
      address_line: normalizeOptionalText(payload.addressLine),
      address_number: normalizeOptionalText(payload.addressNumber),
      created_by_user_id: authData.user?.id ?? null,
      name: normalizedName,
      owner_team_id: teamId,
      postal_code: normalizeOptionalText(payload.postalCode),
      region_city: normalizeOptionalText(payload.regionCity),
      region_state: normalizeOptionalText(payload.regionState),
      region_zone: normalizeOptionalText(payload.regionZone),
    })
    .select('id, name, region_state, region_city, region_zone, address_line, address_number, address_district, postal_code')
    .single();

  if (error) {
    throw error;
  }

  return mapVenueRow(data, primaryVenueId ?? null);
}

export async function updateTeamVenue(venueId: string, payload: SaveTeamVenuePayload, primaryVenueId?: string | null): Promise<TeamVenue> {
  const normalizedName = payload.name.trim();

  if (!normalizedName) {
    throw new Error('Informe o nome da quadra.');
  }

  const { data, error } = await supabase
    .from('venues')
    .update({
      address_district: normalizeOptionalText(payload.addressDistrict),
      address_line: normalizeOptionalText(payload.addressLine),
      address_number: normalizeOptionalText(payload.addressNumber),
      name: normalizedName,
      postal_code: normalizeOptionalText(payload.postalCode),
      region_city: normalizeOptionalText(payload.regionCity),
      region_state: normalizeOptionalText(payload.regionState),
      region_zone: normalizeOptionalText(payload.regionZone),
    })
    .eq('id', venueId)
    .select('id, name, region_state, region_city, region_zone, address_line, address_number, address_district, postal_code')
    .single();

  if (error) {
    throw error;
  }

  return mapVenueRow(data, primaryVenueId ?? null);
}

export async function deleteTeamVenue(teamId: string, venueId: string): Promise<TeamSummary> {
  const { data: teamRow, error: teamError } = await supabase
    .from('teams')
    .select('primary_venue_id')
    .eq('id', teamId)
    .maybeSingle();

  if (teamError) {
    throw teamError;
  }

  if (teamRow?.primary_venue_id === venueId) {
    const { error: clearPrimaryError } = await supabase
      .from('teams')
      .update({ primary_venue_id: null })
      .eq('id', teamId);

    if (clearPrimaryError) {
      throw clearPrimaryError;
    }
  }

  const { error } = await supabase
    .from('venues')
    .delete()
    .eq('id', venueId)
    .eq('owner_team_id', teamId);

  if (error) {
    throw error;
  }

  const savedTeam = await fetchTeamSummary(teamId);

  if (!savedTeam) {
    throw new Error('Nao foi possivel recarregar o time apos remover a quadra.');
  }

  return savedTeam;
}

export async function setTeamPrimaryVenue(teamId: string, venueId: string | null): Promise<TeamSummary> {
  if (venueId) {
    const { data: venueRow, error: venueError } = await supabase
      .from('venues')
      .select('id')
      .eq('id', venueId)
      .eq('owner_team_id', teamId)
      .maybeSingle();

    if (venueError) {
      throw venueError;
    }

    if (!venueRow) {
      throw new Error('A quadra selecionada nao pertence a este time.');
    }
  }

  const { error } = await supabase
    .from('teams')
    .update({ primary_venue_id: venueId })
    .eq('id', teamId);

  if (error) {
    throw error;
  }

  const savedTeam = await fetchTeamSummary(teamId);

  if (!savedTeam) {
    throw new Error('Nao foi possivel recarregar o time apos definir a quadra principal.');
  }

  return savedTeam;
}

export async function fetchTeamSummary(teamId: string): Promise<TeamSummary | null> {
  const { data: teamRow, error: teamError } = await supabase
    .from('teams')
    .select(
      'id, name, slug, crest_media_id, founded_day, founded_month, founded_year, home_match_capability, region_state, region_city, region_zone, primary_venue_id, first_color, second_color, third_color',
    )
    .eq('id', teamId)
    .maybeSingle();

  if (teamError) {
    throw teamError;
  }

  if (!teamRow) {
    return null;
  }

  const [{ data: modalitiesRows, error: modalitiesError }, { data: teamSettingsRow, error: teamSettingsError }] =
    await Promise.all([
      supabase
        .from('team_modalities')
        .select('modality, default_match_frame_count')
        .eq('team_id', teamId)
        .order('modality', { ascending: true }),
      supabase
        .from('team_settings')
        .select(
          'comments_enabled, default_publish_team_events, public_feed_enabled, reactions_enabled, ui_accent_on_primary_color, ui_accent_primary_color, ui_border_default_color, ui_surface_base_color, ui_surface_card_color, ui_text_muted_color, ui_text_primary_color',
        )
        .eq('team_id', teamId)
        .maybeSingle(),
    ]);

  if (modalitiesError) {
    throw modalitiesError;
  }

  if (teamSettingsError) {
    throw teamSettingsError;
  }

  let crestUrl: string | null = null;

  if (teamRow.crest_media_id) {
    const { data: mediaRow, error: mediaError } = await supabase
      .from('media_assets')
      .select('public_url')
      .eq('id', teamRow.crest_media_id)
      .maybeSingle();

    if (mediaError) {
      throw mediaError;
    }

    crestUrl = mediaRow?.public_url ?? null;
  }

  return {
    id: teamRow.id,
    name: teamRow.name,
    slug: teamRow.slug,
    crest_media_id: teamRow.crest_media_id,
    crest_url: crestUrl,
    founded_day: teamRow.founded_day,
    founded_month: teamRow.founded_month,
    founded_year: teamRow.founded_year,
    modality_frame_counts: buildModalityFrameCounts(modalitiesRows),
    modalities: (modalitiesRows ?? []).map((row) => row.modality as SportModality),
    home_match_capability: teamRow.home_match_capability as HomeMatchCapability,
    region_state: teamRow.region_state,
    region_city: teamRow.region_city,
    region_zone: teamRow.region_zone,
    primary_venue_id: teamRow.primary_venue_id,
    colors: {
      first_color: teamRow.first_color,
      second_color: teamRow.second_color,
      third_color: teamRow.third_color,
    },
    settings: buildTeamSettings(teamSettingsRow),
    theme: buildTeamThemeOverrides(teamSettingsRow),
  };
}

function buildTeamThemeOverrides(row: TeamThemeSettingsRow | null): TeamExperienceThemeOverrides | null {
  if (!row) {
    return null;
  }

  const overrides: TeamExperienceThemeOverrides = {};

  if (row.ui_accent_on_primary_color) {
    overrides.accentOnPrimary = row.ui_accent_on_primary_color;
  }
  if (row.ui_accent_primary_color) {
    overrides.accentPrimary = row.ui_accent_primary_color;
  }
  if (row.ui_border_default_color) {
    overrides.borderDefault = row.ui_border_default_color;
  }
  if (row.ui_surface_base_color) {
    overrides.surfaceBase = row.ui_surface_base_color;
  }
  if (row.ui_surface_card_color) {
    overrides.surfaceCard = row.ui_surface_card_color;
  }
  if (row.ui_text_muted_color) {
    overrides.textMuted = row.ui_text_muted_color;
  }
  if (row.ui_text_primary_color) {
    overrides.textPrimary = row.ui_text_primary_color;
  }

  return Object.keys(overrides).length ? overrides : null;
}

function buildTeamSettings(row: TeamSettingsRow | null) {
  if (!row) {
    return null;
  }

  return {
    comments_enabled: row.comments_enabled,
    default_publish_team_events: row.default_publish_team_events,
    public_feed_enabled: row.public_feed_enabled,
    reactions_enabled: row.reactions_enabled,
  };
}

function buildModalityFrameCounts(
  rows: Array<{ default_match_frame_count?: number | null; modality?: string | null }> | null,
): ModalityFrameCounts {
  return (rows ?? []).reduce<ModalityFrameCounts>((counts, row) => {
    if (isSportModality(row.modality)) {
      counts[row.modality] = normalizeModalityFrameCount(row.default_match_frame_count);
    }

    return counts;
  }, {});
}

async function saveTeamModalityFrameCounts(
  teamId: string,
  modalities: SportModality[],
  frameCounts?: ModalityFrameCounts,
) {
  if (!frameCounts || !modalities.length) {
    return;
  }

  await Promise.all(
    normalizeModalities(modalities).map(async (modality) => {
      const { error } = await supabase
        .from('team_modalities')
        .update({
          default_match_frame_count: normalizeModalityFrameCount(frameCounts[modality]),
        })
        .eq('team_id', teamId)
        .eq('modality', modality);

      if (error) {
        throw error;
      }
    }),
  );
}

function normalizeModalityFrameCount(value?: number | null): ModalityFrameCount {
  return value === 2 ? 2 : 1;
}

function isSportModality(value?: string | null): value is SportModality {
  return value === 'FUTSAL' || value === 'SOCIETY' || value === 'FIELD';
}

function mapVenueRow(
  row: {
    address_district: string | null;
    address_line: string | null;
    address_number: string | null;
    id: string;
    name: string;
    postal_code: string | null;
    region_city: string | null;
    region_state: string | null;
    region_zone: string | null;
  },
  primaryVenueId: string | null,
): TeamVenue {
  return {
    address_district: row.address_district,
    address_line: row.address_line,
    address_number: row.address_number,
    id: row.id,
    is_primary: row.id === primaryVenueId,
    name: row.name,
    postal_code: row.postal_code,
    region_city: row.region_city,
    region_state: row.region_state,
    region_zone: row.region_zone,
  };
}

function normalizeThemeColor(value?: string | null) {
  const normalized = value?.trim().toUpperCase() ?? '';
  return normalized.length ? normalized : null;
}

function normalizeOptionalText(value?: string | null) {
  const normalized = value?.trim() ?? '';
  return normalized.length ? normalized : null;
}

function normalizeModalities(modalities: SportModality[]) {
  return Array.from(new Set(modalities));
}

function buildTeamLocationLabel(team: Pick<TeamSearchRow, 'region_city' | 'region_state' | 'region_zone'>) {
  const cityState = [team.region_city, team.region_state].filter(Boolean).join(', ');

  if (cityState && team.region_zone) {
    return `${cityState} • ${team.region_zone}`;
  }

  if (cityState) {
    return cityState;
  }

  return team.region_zone ?? null;
}
