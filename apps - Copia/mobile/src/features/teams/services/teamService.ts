import { supabase } from '../../../lib/supabase';

export type SportModality = 'FUTSAL' | 'SOCIETY' | 'FIELD';

export type HomeMatchCapability = 'HAS_HOME_VENUE' | 'NO_HOME_VENUE' | 'NOT_DEFINED_YET';

export type SocialPlatform = 'YOUTUBE' | 'INSTAGRAM' | 'TIKTOK';

export type TeamSummary = {
  id: string;
  name: string;
  slug: string;
  crest_media_id: string | null;
  crest_url: string | null;
  founded_day: number | null;
  founded_month: number | null;
  founded_year: number | null;
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

export async function createTeam(payload: CreateTeamPayload): Promise<CreatedTeamResult> {
  const { data, error } = await supabase.rpc('create_team', {
    p_payload: payload,
  });

  if (error) {
    throw error;
  }

  return data as CreatedTeamResult;
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
    .select('modality')
    .eq('team_id', membership.team_id)
    .order('modality', { ascending: true });

  if (modalitiesError) {
    throw modalitiesError;
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
  };
}
