alter table public.teams
  add column if not exists founded_year smallint,
  add column if not exists founded_month smallint,
  add column if not exists founded_day smallint;

alter table public.teams
  drop constraint if exists ck_teams_founded_year_range,
  drop constraint if exists ck_teams_founded_month_range,
  drop constraint if exists ck_teams_founded_day_range,
  drop constraint if exists ck_teams_founded_month_requires_year,
  drop constraint if exists ck_teams_founded_day_requires_month_and_year;

alter table public.teams
  add constraint ck_teams_founded_year_range
    check (founded_year is null or founded_year between 1800 and 2100),
  add constraint ck_teams_founded_month_range
    check (founded_month is null or founded_month between 1 and 12),
  add constraint ck_teams_founded_day_range
    check (founded_day is null or founded_day between 1 and 31),
  add constraint ck_teams_founded_month_requires_year
    check (founded_month is null or founded_year is not null),
  add constraint ck_teams_founded_day_requires_month_and_year
    check (founded_day is null or (founded_month is not null and founded_year is not null));

create or replace function public.create_team(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  app_user public.users%rowtype;
  team_id_value uuid;
  venue_id_value uuid;
  crest_media_id_value uuid;
  base_slug text;
  final_slug text;
  suffix integer := 0;
  modality_value text;
  social_key text;
  social_payload jsonb;
  primary_venue_payload jsonb;
  founded_year_value smallint;
  founded_month_value smallint;
  founded_day_value smallint;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  perform public.bootstrap_current_user();
  select * into app_user from public.users where id = auth.uid();

  if nullif(btrim(coalesce(p_payload ->> 'name', '')), '') is null then
    raise exception 'TEAM_NAME_REQUIRED';
  end if;

  founded_year_value := nullif(p_payload ->> 'founded_year', '')::smallint;
  founded_month_value := nullif(p_payload ->> 'founded_month', '')::smallint;
  founded_day_value := nullif(p_payload ->> 'founded_day', '')::smallint;

  if founded_month_value is not null and founded_year_value is null then
    raise exception 'TEAM_FOUNDATION_YEAR_REQUIRED';
  end if;

  if founded_day_value is not null and founded_month_value is null then
    raise exception 'TEAM_FOUNDATION_MONTH_REQUIRED';
  end if;

  if founded_year_value is not null and (founded_year_value < 1800 or founded_year_value > 2100) then
    raise exception 'TEAM_FOUNDATION_YEAR_INVALID';
  end if;

  if founded_month_value is not null and (founded_month_value < 1 or founded_month_value > 12) then
    raise exception 'TEAM_FOUNDATION_MONTH_INVALID';
  end if;

  if founded_day_value is not null and (founded_day_value < 1 or founded_day_value > 31) then
    raise exception 'TEAM_FOUNDATION_DAY_INVALID';
  end if;

  if nullif(p_payload ->> 'crest_upload_token', '') is not null then
    select id into crest_media_id_value
    from public.media_assets
    where upload_token = p_payload ->> 'crest_upload_token'
      and owner_user_id = auth.uid()
      and purpose = 'TEAM_CREST'
      and is_temporary = true
      and consumed_at is null
      and (expires_at is null or expires_at > now())
      and status in ('TEMPORARY', 'UPLOADED')
    limit 1;

    if crest_media_id_value is null then
      raise exception 'TEAM_CREST_UPLOAD_INVALID';
    end if;
  end if;

  primary_venue_payload := p_payload -> 'primary_venue';
  if jsonb_typeof(primary_venue_payload) = 'object' and nullif(primary_venue_payload ->> 'name', '') is not null then
    insert into public.venues (
      name,
      created_by_user_id,
      region_state,
      region_city,
      region_zone,
      address_line,
      address_number,
      address_district,
      postal_code,
      latitude,
      longitude,
      external_place_provider,
      external_place_id
    )
    values (
      primary_venue_payload ->> 'name',
      auth.uid(),
      primary_venue_payload ->> 'region_state',
      primary_venue_payload ->> 'region_city',
      primary_venue_payload ->> 'region_zone',
      primary_venue_payload ->> 'address_line',
      primary_venue_payload ->> 'address_number',
      primary_venue_payload ->> 'address_district',
      primary_venue_payload ->> 'postal_code',
      nullif(primary_venue_payload ->> 'latitude', '')::numeric,
      nullif(primary_venue_payload ->> 'longitude', '')::numeric,
      primary_venue_payload ->> 'external_place_provider',
      primary_venue_payload ->> 'external_place_id'
    )
    returning id into venue_id_value;
  end if;

  base_slug := public.make_slug(p_payload ->> 'name');
  final_slug := base_slug;

  while exists (select 1 from public.teams where slug = final_slug) loop
    suffix := suffix + 1;
    final_slug := base_slug || '-' || suffix::text;
  end loop;

  insert into public.teams (
    name,
    slug,
    crest_media_id,
    founded_year,
    founded_month,
    founded_day,
    first_color,
    second_color,
    third_color,
    home_match_capability,
    region_state,
    region_city,
    region_zone,
    primary_venue_id,
    created_by_user_id
  )
  values (
    btrim(p_payload ->> 'name'),
    final_slug,
    crest_media_id_value,
    founded_year_value,
    founded_month_value,
    founded_day_value,
    coalesce(p_payload #>> '{colors,first_color}', p_payload ->> 'first_color'),
    coalesce(p_payload #>> '{colors,second_color}', p_payload ->> 'second_color'),
    coalesce(p_payload #>> '{colors,third_color}', p_payload ->> 'third_color'),
    coalesce(nullif(p_payload ->> 'home_match_capability', '')::public.home_match_capability, 'NOT_DEFINED_YET'),
    p_payload ->> 'region_state',
    p_payload ->> 'region_city',
    p_payload ->> 'region_zone',
    venue_id_value,
    auth.uid()
  )
  returning id into team_id_value;

  if venue_id_value is not null then
    update public.venues
    set owner_team_id = team_id_value
    where id = venue_id_value;
  end if;

  if crest_media_id_value is not null then
    update public.media_assets
    set status = 'READY',
        is_temporary = false,
        consumed_at = now(),
        metadata = metadata || jsonb_build_object('team_id', team_id_value)
    where id = crest_media_id_value;
  end if;

  insert into public.team_members (team_id, person_id, membership_status, joined_at, created_by_user_id)
  values (team_id_value, app_user.person_id, 'ACTIVE', now(), auth.uid());

  insert into public.user_team_roles (user_id, team_id, role, granted_by_user_id)
  values (auth.uid(), team_id_value, 'DIRECTOR', auth.uid());

  insert into public.team_settings (team_id, default_language_mode)
  values (team_id_value, 'VARZEA');

  if jsonb_typeof(p_payload -> 'modalities') = 'array' then
    for modality_value in select jsonb_array_elements_text(p_payload -> 'modalities')
    loop
      insert into public.team_modalities (team_id, modality, created_by_user_id)
      values (team_id_value, modality_value::public.sport_modality, auth.uid())
      on conflict (team_id, modality) do nothing;
    end loop;
  end if;

  if jsonb_typeof(p_payload -> 'social_accounts') = 'object' then
    for social_key, social_payload in select key, value from jsonb_each(p_payload -> 'social_accounts')
    loop
      if upper(social_key) in ('YOUTUBE', 'INSTAGRAM', 'TIKTOK') then
        insert into public.team_social_connections (
          team_id,
          platform,
          handle,
          channel_url,
          connection_status,
          created_by_user_id
        )
        values (
          team_id_value,
          upper(social_key)::public.social_platform,
          social_payload ->> 'handle',
          social_payload ->> 'channel_url',
          'PENDING',
          auth.uid()
        )
        on conflict (team_id, platform)
        do update set
          handle = excluded.handle,
          channel_url = excluded.channel_url,
          updated_at = now();
      end if;
    end loop;
  elsif jsonb_typeof(p_payload -> 'social_accounts') = 'array' then
    for social_payload in select value from jsonb_array_elements(p_payload -> 'social_accounts')
    loop
      if upper(coalesce(social_payload ->> 'platform', '')) in ('YOUTUBE', 'INSTAGRAM', 'TIKTOK') then
        insert into public.team_social_connections (
          team_id,
          platform,
          handle,
          channel_url,
          connection_status,
          created_by_user_id
        )
        values (
          team_id_value,
          upper(social_payload ->> 'platform')::public.social_platform,
          social_payload ->> 'handle',
          social_payload ->> 'channel_url',
          'PENDING',
          auth.uid()
        )
        on conflict (team_id, platform)
        do update set
          handle = excluded.handle,
          channel_url = excluded.channel_url,
          updated_at = now();
      end if;
    end loop;
  end if;

  return (
    select jsonb_build_object(
      'team', jsonb_build_object(
        'id', t.id,
        'name', t.name,
        'slug', t.slug,
        'crest_media_id', t.crest_media_id,
        'crest_url', ma.public_url,
        'founded_day', t.founded_day,
        'founded_month', t.founded_month,
        'founded_year', t.founded_year,
        'modalities', coalesce((
          select jsonb_agg(tm.modality order by tm.modality)
          from public.team_modalities tm
          where tm.team_id = t.id
        ), '[]'::jsonb),
        'home_match_capability', t.home_match_capability,
        'region_state', t.region_state,
        'region_city', t.region_city,
        'region_zone', t.region_zone,
        'primary_venue_id', t.primary_venue_id,
        'colors', jsonb_build_object(
          'first_color', t.first_color,
          'second_color', t.second_color,
          'third_color', t.third_color
        )
      ),
      'membership', jsonb_build_object(
        'role', 'DIRECTOR',
        'team_member_id', (
          select id from public.team_members
          where team_id = t.id and person_id = app_user.person_id and membership_status = 'ACTIVE'
          limit 1
        )
      )
    )
    from public.teams t
    left join public.media_assets ma on ma.id = t.crest_media_id
    where t.id = team_id_value
  );
end;
$$;
