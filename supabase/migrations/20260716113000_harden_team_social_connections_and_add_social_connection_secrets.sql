do $$
begin
  create type public.social_secret_kind as enum ('ACCESS_TOKEN', 'REFRESH_TOKEN');
exception when duplicate_object then null;
end $$;

create table if not exists public.social_connection_secrets (
  id uuid primary key default gen_random_uuid(),
  secret_ref text not null unique default gen_random_uuid()::text,
  platform public.social_platform not null,
  secret_kind public.social_secret_kind not null,
  encrypted_secret text not null,
  key_version text,
  metadata jsonb not null default '{}'::jsonb,
  created_by_user_id uuid references public.users(id) on update cascade on delete set null,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ck_social_connection_secrets_secret_ref_not_blank check (btrim(secret_ref) <> ''),
  constraint ck_social_connection_secrets_encrypted_secret_not_blank check (btrim(encrypted_secret) <> ''),
  constraint ck_social_connection_secrets_key_version_not_blank_when_present check (key_version is null or btrim(key_version) <> '')
);

create trigger trg_social_connection_secrets_touch_updated_at
before update on public.social_connection_secrets
for each row execute function public.touch_updated_at();

create index if not exists idx_social_connection_secrets_platform on public.social_connection_secrets (platform);
create index if not exists idx_social_connection_secrets_secret_kind on public.social_connection_secrets (secret_kind);
create index if not exists idx_social_connection_secrets_created_by_user_id on public.social_connection_secrets (created_by_user_id);
create index if not exists idx_social_connection_secrets_revoked_at on public.social_connection_secrets (revoked_at);

alter table public.team_social_connections
  drop constraint if exists fk_team_social_connections_access_token_ref;

alter table public.team_social_connections
  add constraint fk_team_social_connections_access_token_ref
  foreign key (access_token_ref)
  references public.social_connection_secrets(secret_ref)
  on update cascade
  on delete set null;

alter table public.team_social_connections
  drop constraint if exists fk_team_social_connections_refresh_token_ref;

alter table public.team_social_connections
  add constraint fk_team_social_connections_refresh_token_ref
  foreign key (refresh_token_ref)
  references public.social_connection_secrets(secret_ref)
  on update cascade
  on delete set null;

create index if not exists idx_team_social_connections_access_token_ref on public.team_social_connections (access_token_ref);
create index if not exists idx_team_social_connections_refresh_token_ref on public.team_social_connections (refresh_token_ref);

update public.team_social_connections
set publish_events_enabled = false,
    updated_at = now()
where publish_events_enabled = true
  and connection_status <> 'CONNECTED';

alter table public.team_social_connections
  drop constraint if exists ck_team_social_connections_publish_requires_connected;

alter table public.team_social_connections
  add constraint ck_team_social_connections_publish_requires_connected
  check (
    publish_events_enabled = false
    or connection_status = 'CONNECTED'
  );

alter table public.social_connection_secrets enable row level security;
