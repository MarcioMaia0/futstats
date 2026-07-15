-- FUTSTATS initial identity and teams schema.
-- This migration keeps the first runnable slice aligned with the current docs:
-- auth.users -> public.users -> persons -> players, plus teams and team membership.

create schema if not exists extensions;
create extension if not exists pgcrypto;
create extension if not exists unaccent with schema extensions;

do $$
begin
  create type public.start_path_choice as enum ('CREATE_TEAM', 'JOIN_TEAM', 'EXPLORE');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.language_mode as enum ('TECHNICAL', 'VARZEA', 'RESENHA');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.profile_visibility as enum ('PUBLIC', 'FOLLOWERS', 'TEAM_MEMBERS');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.name_display as enum ('NAME', 'NICKNAME', 'BOTH');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.dominant_foot as enum ('RIGHT', 'LEFT', 'AMBIDEXTROUS');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.player_profile_completeness_status as enum ('INCOMPLETE', 'BASIC_COMPLETE', 'ENRICHED');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.sport_modality as enum ('FUTSAL', 'SOCIETY', 'FIELD');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.home_match_capability as enum ('HAS_HOME_VENUE', 'NO_HOME_VENUE', 'NOT_DEFINED_YET');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.team_membership_status as enum ('ACTIVE', 'INACTIVE', 'REMOVED');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.team_player_status as enum ('ACTIVE', 'INACTIVE', 'LEFT', 'REMOVED');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.team_role as enum ('DIRECTOR', 'PRESIDENT', 'COMMITTEE');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.team_color_source as enum ('FIRST_COLOR', 'SECOND_COLOR', 'THIRD_COLOR');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.social_platform as enum ('YOUTUBE', 'INSTAGRAM', 'TIKTOK');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.social_connection_status as enum ('PENDING', 'CONNECTED', 'EXPIRED', 'REVOKED', 'ERROR');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.media_asset_status as enum ('TEMPORARY', 'UPLOADED', 'READY', 'FAILED', 'DELETED');
exception when duplicate_object then null;
end $$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.normalize_search_text(value text)
returns text
language sql
stable
as $$
  select nullif(
    regexp_replace(
      lower(extensions.unaccent(coalesce(value, ''))),
      '\s+',
      ' ',
      'g'
    ),
    ''
  );
$$;

create or replace function public.make_slug(value text)
returns text
language sql
stable
as $$
  select trim(both '-' from regexp_replace(public.normalize_search_text(value), '[^a-z0-9]+', '-', 'g'));
$$;

create table if not exists public.persons (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  nickname text not null,
  avatar_media_id uuid,
  search_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ck_persons_nickname_not_blank check (btrim(nickname) <> ''),
  constraint ck_persons_search_name_not_blank check (btrim(search_name) <> ''),
  constraint ck_persons_full_name_not_blank_when_present check (full_name is null or btrim(full_name) <> '')
);

create trigger trg_persons_touch_updated_at
before update on public.persons
for each row execute function public.touch_updated_at();

create index if not exists idx_persons_search_name on public.persons (search_name);
create index if not exists idx_persons_nickname on public.persons (nickname);
create index if not exists idx_persons_full_name on public.persons (full_name);

create table if not exists public.users (
  id uuid primary key references auth.users(id) on update cascade on delete restrict,
  person_id uuid not null unique references public.persons(id) on update cascade on delete restrict,
  username text unique,
  display_name text,
  avatar_url text,
  contact_phone text,
  region_state text,
  region_city text,
  region_zone text,
  terms_accepted_at timestamptz not null default now(),
  start_path_completed_at timestamptz,
  last_start_path_choice public.start_path_choice,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint ck_users_username_not_blank_when_present check (username is null or btrim(username) <> ''),
  constraint ck_users_display_name_not_blank_when_present check (display_name is null or btrim(display_name) <> ''),
  constraint ck_users_contact_phone_not_blank_when_present check (contact_phone is null or btrim(contact_phone) <> ''),
  constraint ck_users_region_state_not_blank_when_present check (region_state is null or btrim(region_state) <> ''),
  constraint ck_users_region_city_not_blank_when_present check (region_city is null or btrim(region_city) <> ''),
  constraint ck_users_region_zone_not_blank_when_present check (region_zone is null or btrim(region_zone) <> '')
);

create trigger trg_users_touch_updated_at
before update on public.users
for each row execute function public.touch_updated_at();

create index if not exists idx_users_username on public.users (username);
create index if not exists idx_users_person_id on public.users (person_id);
create index if not exists idx_users_start_path_choice on public.users (last_start_path_choice);
create index if not exists idx_users_deleted_at on public.users (deleted_at);

create table if not exists public.user_preferences (
  user_id uuid primary key references public.users(id) on update cascade on delete cascade,
  preferred_language_mode public.language_mode not null default 'VARZEA',
  preferred_theme_id uuid,
  profile_visibility public.profile_visibility not null default 'PUBLIC',
  name_display_public public.name_display not null default 'NAME',
  name_display_followers public.name_display not null default 'NAME',
  name_display_team public.name_display not null default 'NICKNAME',
  region_prompt_dismissed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_user_preferences_touch_updated_at
before update on public.user_preferences
for each row execute function public.touch_updated_at();

create index if not exists idx_user_preferences_profile_visibility on public.user_preferences (profile_visibility);
create index if not exists idx_user_preferences_preferred_language_mode on public.user_preferences (preferred_language_mode);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references public.users(id) on update cascade on delete set null,
  domain text not null,
  purpose text not null,
  storage_bucket text,
  storage_path text,
  public_url text,
  mime_type text,
  byte_size bigint,
  status public.media_asset_status not null default 'TEMPORARY',
  is_temporary boolean not null default true,
  upload_token text unique,
  expires_at timestamptz,
  consumed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ck_media_assets_domain_not_blank check (btrim(domain) <> ''),
  constraint ck_media_assets_purpose_not_blank check (btrim(purpose) <> ''),
  constraint ck_media_assets_storage_bucket_not_blank_when_present check (storage_bucket is null or btrim(storage_bucket) <> ''),
  constraint ck_media_assets_storage_path_not_blank_when_present check (storage_path is null or btrim(storage_path) <> '')
);

create trigger trg_media_assets_touch_updated_at
before update on public.media_assets
for each row execute function public.touch_updated_at();

create index if not exists idx_media_assets_owner_user_id on public.media_assets (owner_user_id);
create index if not exists idx_media_assets_upload_token on public.media_assets (upload_token);
create index if not exists idx_media_assets_domain_purpose on public.media_assets (domain, purpose);

alter table public.persons
  add constraint fk_persons_avatar_media
  foreign key (avatar_media_id)
  references public.media_assets(id)
  on update cascade
  on delete set null;

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null unique references public.persons(id) on update cascade on delete restrict,
  dominant_foot public.dominant_foot,
  birth_date date,
  height_cm integer,
  weight_kg numeric(5, 2),
  profile_completeness_status public.player_profile_completeness_status not null default 'INCOMPLETE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ck_players_height_cm_positive check (height_cm is null or height_cm > 0),
  constraint ck_players_weight_kg_positive check (weight_kg is null or weight_kg > 0),
  constraint ck_players_birth_date_not_future check (birth_date is null or birth_date <= current_date)
);

create trigger trg_players_touch_updated_at
before update on public.players
for each row execute function public.touch_updated_at();

create index if not exists idx_players_person_id on public.players (person_id);
create index if not exists idx_players_profile_completeness_status on public.players (profile_completeness_status);
create index if not exists idx_players_birth_date on public.players (birth_date);

create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_team_id uuid,
  created_by_user_id uuid references public.users(id) on update cascade on delete set null,
  region_state text,
  region_city text,
  region_zone text,
  address_line text,
  address_number text,
  address_district text,
  postal_code text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  external_place_provider text,
  external_place_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ck_venues_name_not_blank check (btrim(name) <> '')
);

create trigger trg_venues_touch_updated_at
before update on public.venues
for each row execute function public.touch_updated_at();

create index if not exists idx_venues_owner_team_id on public.venues (owner_team_id);
create index if not exists idx_venues_region on public.venues (region_state, region_city, region_zone);
create index if not exists idx_venues_external_place on public.venues (external_place_provider, external_place_id);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  crest_media_id uuid references public.media_assets(id) on update cascade on delete set null,
  first_color text,
  second_color text,
  third_color text,
  home_match_capability public.home_match_capability not null default 'NOT_DEFINED_YET',
  region_state text,
  region_city text,
  region_zone text,
  primary_venue_id uuid references public.venues(id) on update cascade on delete set null,
  created_by_user_id uuid not null references public.users(id) on update cascade on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ck_teams_name_not_blank check (btrim(name) <> ''),
  constraint ck_teams_slug_not_blank check (btrim(slug) <> ''),
  constraint ck_teams_first_color_not_blank_when_present check (first_color is null or btrim(first_color) <> ''),
  constraint ck_teams_second_color_not_blank_when_present check (second_color is null or btrim(second_color) <> ''),
  constraint ck_teams_third_color_not_blank_when_present check (third_color is null or btrim(third_color) <> '')
);

alter table public.venues
  add constraint fk_venues_owner_team
  foreign key (owner_team_id)
  references public.teams(id)
  on update cascade
  on delete set null;

create trigger trg_teams_touch_updated_at
before update on public.teams
for each row execute function public.touch_updated_at();

create index if not exists idx_teams_name on public.teams (name);
create index if not exists idx_teams_slug on public.teams (slug);
create index if not exists idx_teams_region on public.teams (region_state, region_city, region_zone);
create index if not exists idx_teams_created_by_user_id on public.teams (created_by_user_id);

create table if not exists public.team_modalities (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on update cascade on delete restrict,
  modality public.sport_modality not null,
  created_by_user_id uuid references public.users(id) on update cascade on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_team_modalities_team_modality unique (team_id, modality)
);

create trigger trg_team_modalities_touch_updated_at
before update on public.team_modalities
for each row execute function public.touch_updated_at();

create index if not exists idx_team_modalities_team_id on public.team_modalities (team_id);
create index if not exists idx_team_modalities_modality on public.team_modalities (modality);

create table if not exists public.team_settings (
  team_id uuid primary key references public.teams(id) on update cascade on delete cascade,
  default_theme_id uuid,
  default_language_mode public.language_mode,
  reactions_enabled boolean not null default true,
  comments_enabled boolean not null default true,
  public_feed_enabled boolean not null default true,
  default_publish_team_events boolean not null default false,
  ui_primary_color_source public.team_color_source,
  ui_secondary_color_source public.team_color_source,
  ui_background_color_source public.team_color_source,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_team_settings_touch_updated_at
before update on public.team_settings
for each row execute function public.touch_updated_at();

create table if not exists public.team_social_connections (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on update cascade on delete restrict,
  platform public.social_platform not null,
  handle text,
  channel_url text,
  connection_status public.social_connection_status not null default 'PENDING',
  external_account_id text,
  access_token_ref text,
  refresh_token_ref text,
  token_expires_at timestamptz,
  publish_events_enabled boolean not null default false,
  last_validated_at timestamptz,
  last_publish_at timestamptz,
  created_by_user_id uuid references public.users(id) on update cascade on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_team_social_connections_team_platform unique (team_id, platform),
  constraint ck_team_social_connections_handle_not_blank_when_present check (handle is null or btrim(handle) <> ''),
  constraint ck_team_social_connections_channel_url_not_blank_when_present check (channel_url is null or btrim(channel_url) <> '')
);

create trigger trg_team_social_connections_touch_updated_at
before update on public.team_social_connections
for each row execute function public.touch_updated_at();

create index if not exists idx_team_social_connections_team_id on public.team_social_connections (team_id);
create index if not exists idx_team_social_connections_platform on public.team_social_connections (platform);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on update cascade on delete restrict,
  person_id uuid not null references public.persons(id) on update cascade on delete restrict,
  membership_status public.team_membership_status not null default 'ACTIVE',
  joined_at timestamptz,
  left_at timestamptz,
  created_by_user_id uuid references public.users(id) on update cascade on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ck_team_members_notes_not_blank_when_present check (notes is null or btrim(notes) <> ''),
  constraint ck_team_members_left_at_after_joined_at check (joined_at is null or left_at is null or left_at >= joined_at)
);

create trigger trg_team_members_touch_updated_at
before update on public.team_members
for each row execute function public.touch_updated_at();

create unique index if not exists uq_team_members_active_team_person
  on public.team_members (team_id, person_id)
  where membership_status = 'ACTIVE';
create index if not exists idx_team_members_team_id on public.team_members (team_id);
create index if not exists idx_team_members_person_id on public.team_members (person_id);
create index if not exists idx_team_members_membership_status on public.team_members (membership_status);
create index if not exists idx_team_members_created_by_user_id on public.team_members (created_by_user_id);

create table if not exists public.team_players (
  id uuid primary key default gen_random_uuid(),
  team_member_id uuid not null references public.team_members(id) on update cascade on delete restrict,
  player_id uuid not null references public.players(id) on update cascade on delete restrict,
  status public.team_player_status not null default 'ACTIVE',
  joined_at timestamptz,
  left_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ck_team_players_left_at_after_joined_at check (joined_at is null or left_at is null or left_at >= joined_at)
);

create trigger trg_team_players_touch_updated_at
before update on public.team_players
for each row execute function public.touch_updated_at();

create unique index if not exists uq_team_players_active_team_member
  on public.team_players (team_member_id)
  where status = 'ACTIVE';
create index if not exists idx_team_players_team_member_id on public.team_players (team_member_id);
create index if not exists idx_team_players_player_id on public.team_players (player_id);
create index if not exists idx_team_players_status on public.team_players (status);
create index if not exists idx_team_players_joined_at on public.team_players (joined_at);

create table if not exists public.user_team_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on update cascade on delete restrict,
  team_id uuid not null references public.teams(id) on update cascade on delete restrict,
  role public.team_role not null,
  granted_by_user_id uuid references public.users(id) on update cascade on delete set null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_user_team_roles_touch_updated_at
before update on public.user_team_roles
for each row execute function public.touch_updated_at();

create unique index if not exists uq_user_team_roles_active_role
  on public.user_team_roles (user_id, team_id, role)
  where revoked_at is null;
create index if not exists idx_user_team_roles_user_id on public.user_team_roles (user_id);
create index if not exists idx_user_team_roles_team_id on public.user_team_roles (team_id);
create index if not exists idx_user_team_roles_role on public.user_team_roles (role);

create table if not exists public.team_join_requests (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on update cascade on delete restrict,
  requester_user_id uuid not null references public.users(id) on update cascade on delete restrict,
  status text not null default 'PENDING',
  source_context text,
  requested_at timestamptz not null default now(),
  responded_at timestamptz,
  responded_by_user_id uuid references public.users(id) on update cascade on delete set null,
  approved_membership_mode text,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ck_team_join_requests_status check (status in ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
  constraint ck_team_join_requests_source_context_not_blank_when_present check (source_context is null or btrim(source_context) <> '')
);

create trigger trg_team_join_requests_touch_updated_at
before update on public.team_join_requests
for each row execute function public.touch_updated_at();

create unique index if not exists uq_team_join_requests_pending_user_team
  on public.team_join_requests (requester_user_id, team_id)
  where status = 'PENDING';
create index if not exists idx_team_join_requests_team_id on public.team_join_requests (team_id);
create index if not exists idx_team_join_requests_requester_user_id on public.team_join_requests (requester_user_id);
create index if not exists idx_team_join_requests_status on public.team_join_requests (status);

create or replace function public.ensure_team_player_person_consistency()
returns trigger
language plpgsql
as $$
declare
  member_person_id uuid;
  player_person_id uuid;
begin
  select person_id into member_person_id from public.team_members where id = new.team_member_id;
  select person_id into player_person_id from public.players where id = new.player_id;

  if member_person_id is null or player_person_id is null or member_person_id <> player_person_id then
    raise exception 'TEAM_PLAYER_PERSON_MISMATCH';
  end if;

  return new;
end;
$$;

create trigger trg_team_players_person_consistency
before insert or update of team_member_id, player_id on public.team_players
for each row execute function public.ensure_team_player_person_consistency();

create or replace function public.prevent_invalid_active_role_conflicts()
returns trigger
language plpgsql
as $$
declare
  has_director boolean;
  has_president boolean;
  has_committee boolean;
  has_active_player boolean;
  person_id_value uuid;
begin
  if new.revoked_at is not null then
    return new;
  end if;

  select u.person_id into person_id_value
  from public.users u
  where u.id = new.user_id;

  select exists (
    select 1 from public.user_team_roles r
    where r.user_id = new.user_id
      and r.team_id = new.team_id
      and r.role = 'DIRECTOR'
      and r.revoked_at is null
      and r.id <> new.id
  ) into has_director;

  select exists (
    select 1 from public.user_team_roles r
    where r.user_id = new.user_id
      and r.team_id = new.team_id
      and r.role = 'PRESIDENT'
      and r.revoked_at is null
      and r.id <> new.id
  ) into has_president;

  select exists (
    select 1 from public.user_team_roles r
    where r.user_id = new.user_id
      and r.team_id = new.team_id
      and r.role = 'COMMITTEE'
      and r.revoked_at is null
      and r.id <> new.id
  ) into has_committee;

  select exists (
    select 1
    from public.team_members tm
    join public.team_players tp on tp.team_member_id = tm.id and tp.status = 'ACTIVE'
    where tm.team_id = new.team_id
      and tm.person_id = person_id_value
      and tm.membership_status = 'ACTIVE'
  ) into has_active_player;

  if new.role = 'DIRECTOR' and (has_president or has_committee) then
    raise exception 'TEAM_ROLE_CONFLICT';
  end if;

  if new.role = 'PRESIDENT' and (has_director or has_committee) then
    raise exception 'TEAM_ROLE_CONFLICT';
  end if;

  if new.role = 'COMMITTEE' and (has_director or has_president or has_active_player) then
    raise exception 'TEAM_ROLE_CONFLICT';
  end if;

  return new;
end;
$$;

create trigger trg_user_team_roles_prevent_invalid_conflicts
before insert or update of role, revoked_at on public.user_team_roles
for each row execute function public.prevent_invalid_active_role_conflicts();

create or replace function public.is_team_manager(p_team_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.user_team_roles r
    where r.team_id = p_team_id
      and r.user_id = auth.uid()
      and r.role in ('DIRECTOR', 'PRESIDENT')
      and r.revoked_at is null
  );
$$;

create or replace function public.is_team_member(p_team_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.users u
    join public.team_members tm on tm.person_id = u.person_id
    where u.id = auth.uid()
      and tm.team_id = p_team_id
      and tm.membership_status = 'ACTIVE'
  );
$$;

create or replace function public.bootstrap_current_user()
returns jsonb
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  auth_user auth.users%rowtype;
  existing_user public.users%rowtype;
  person_id_value uuid;
  display_name_value text;
  nickname_value text;
  avatar_url_value text;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select * into existing_user from public.users where id = auth.uid();
  if found then
    insert into public.user_preferences (user_id)
    values (existing_user.id)
    on conflict (user_id) do nothing;

    return public.get_me();
  end if;

  select * into auth_user from auth.users where id = auth.uid();
  if not found then
    raise exception 'AUTH_USER_NOT_FOUND';
  end if;

  display_name_value := nullif(coalesce(
    auth_user.raw_user_meta_data ->> 'full_name',
    auth_user.raw_user_meta_data ->> 'name',
    split_part(auth_user.email, '@', 1),
    'Pessoa'
  ), '');

  nickname_value := nullif(coalesce(
    auth_user.raw_user_meta_data ->> 'nickname',
    auth_user.raw_user_meta_data ->> 'name',
    display_name_value
  ), '');

  avatar_url_value := nullif(coalesce(
    auth_user.raw_user_meta_data ->> 'avatar_url',
    auth_user.raw_user_meta_data ->> 'picture'
  ), '');

  insert into public.persons (full_name, nickname, search_name)
  values (
    display_name_value,
    nickname_value,
    public.normalize_search_text(display_name_value || ' ' || nickname_value)
  )
  returning id into person_id_value;

  insert into public.users (
    id,
    person_id,
    display_name,
    avatar_url,
    terms_accepted_at
  )
  values (
    auth.uid(),
    person_id_value,
    display_name_value,
    avatar_url_value,
    now()
  );

  insert into public.user_preferences (user_id)
  values (auth.uid())
  on conflict (user_id) do nothing;

  return public.get_me();
end;
$$;

create or replace function public.get_me()
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  result jsonb;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select jsonb_build_object(
    'user', to_jsonb(u),
    'person', to_jsonb(p),
    'preferences', to_jsonb(up),
    'onboarding', jsonb_build_object(
      'start_path_completed', u.start_path_completed_at is not null,
      'last_start_path_choice', u.last_start_path_choice
    )
  )
  into result
  from public.users u
  join public.persons p on p.id = u.person_id
  left join public.user_preferences up on up.user_id = u.id
  where u.id = auth.uid();

  if result is null then
    raise exception 'USER_BOOTSTRAP_REQUIRED';
  end if;

  return result;
end;
$$;

create or replace function public.complete_start_path_choice(p_choice public.start_path_choice)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  perform public.bootstrap_current_user();

  update public.users
  set start_path_completed_at = now(),
      last_start_path_choice = p_choice
  where id = auth.uid();

  return public.get_me();
end;
$$;

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
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  perform public.bootstrap_current_user();
  select * into app_user from public.users where id = auth.uid();

  if nullif(btrim(coalesce(p_payload ->> 'name', '')), '') is null then
    raise exception 'TEAM_NAME_REQUIRED';
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

alter table public.persons enable row level security;
alter table public.users enable row level security;
alter table public.user_preferences enable row level security;
alter table public.media_assets enable row level security;
alter table public.players enable row level security;
alter table public.venues enable row level security;
alter table public.teams enable row level security;
alter table public.team_modalities enable row level security;
alter table public.team_settings enable row level security;
alter table public.team_social_connections enable row level security;
alter table public.team_members enable row level security;
alter table public.team_players enable row level security;
alter table public.user_team_roles enable row level security;
alter table public.team_join_requests enable row level security;

create policy "Authenticated users can read persons"
on public.persons for select
to authenticated
using (true);

create policy "Users can read themselves"
on public.users for select
to authenticated
using (id = auth.uid());

create policy "Users can update themselves"
on public.users for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Users can read their preferences"
on public.user_preferences for select
to authenticated
using (user_id = auth.uid());

create policy "Users can update their preferences"
on public.user_preferences for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can manage their media assets"
on public.media_assets for all
to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

create policy "Authenticated users can read players"
on public.players for select
to authenticated
using (true);

create policy "Authenticated users can read venues"
on public.venues for select
to authenticated
using (true);

create policy "Authenticated users can create venues"
on public.venues for insert
to authenticated
with check (created_by_user_id = auth.uid());

create policy "Team managers can update venues"
on public.venues for update
to authenticated
using (owner_team_id is null or public.is_team_manager(owner_team_id))
with check (owner_team_id is null or public.is_team_manager(owner_team_id));

create policy "Authenticated users can read teams"
on public.teams for select
to authenticated
using (true);

create policy "Team creators can insert teams"
on public.teams for insert
to authenticated
with check (created_by_user_id = auth.uid());

create policy "Team managers can update teams"
on public.teams for update
to authenticated
using (public.is_team_manager(id))
with check (public.is_team_manager(id));

create policy "Authenticated users can read team modalities"
on public.team_modalities for select
to authenticated
using (true);

create policy "Team managers can manage team modalities"
on public.team_modalities for all
to authenticated
using (public.is_team_manager(team_id))
with check (public.is_team_manager(team_id));

create policy "Authenticated users can read team settings"
on public.team_settings for select
to authenticated
using (true);

create policy "Team managers can manage team settings"
on public.team_settings for all
to authenticated
using (public.is_team_manager(team_id))
with check (public.is_team_manager(team_id));

create policy "Authenticated users can read team social connections"
on public.team_social_connections for select
to authenticated
using (true);

create policy "Team managers can manage team social connections"
on public.team_social_connections for all
to authenticated
using (public.is_team_manager(team_id))
with check (public.is_team_manager(team_id));

create policy "Team members can read team members"
on public.team_members for select
to authenticated
using (public.is_team_member(team_id) or public.is_team_manager(team_id));

create policy "Team managers can manage team members"
on public.team_members for all
to authenticated
using (public.is_team_manager(team_id))
with check (public.is_team_manager(team_id));

create policy "Team members can read team players"
on public.team_players for select
to authenticated
using (
  exists (
    select 1
    from public.team_members tm
    where tm.id = team_players.team_member_id
      and (public.is_team_member(tm.team_id) or public.is_team_manager(tm.team_id))
  )
);

create policy "Team managers can manage team players"
on public.team_players for all
to authenticated
using (
  exists (
    select 1
    from public.team_members tm
    where tm.id = team_players.team_member_id
      and public.is_team_manager(tm.team_id)
  )
)
with check (
  exists (
    select 1
    from public.team_members tm
    where tm.id = team_players.team_member_id
      and public.is_team_manager(tm.team_id)
  )
);

create policy "Users can read their team roles"
on public.user_team_roles for select
to authenticated
using (user_id = auth.uid() or public.is_team_manager(team_id));

create policy "Team managers can manage team roles"
on public.user_team_roles for all
to authenticated
using (public.is_team_manager(team_id))
with check (public.is_team_manager(team_id));

create policy "Users can read their join requests"
on public.team_join_requests for select
to authenticated
using (requester_user_id = auth.uid() or public.is_team_manager(team_id));

create policy "Users can create their join requests"
on public.team_join_requests for insert
to authenticated
with check (requester_user_id = auth.uid());

create policy "Team managers can update join requests"
on public.team_join_requests for update
to authenticated
using (public.is_team_manager(team_id))
with check (public.is_team_manager(team_id));

grant execute on function public.bootstrap_current_user() to authenticated;
grant execute on function public.get_me() to authenticated;
grant execute on function public.complete_start_path_choice(public.start_path_choice) to authenticated;
grant execute on function public.create_team(jsonb) to authenticated;
