do $$
begin
  create type public.team_join_request_status as enum ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.join_request_source as enum ('START_PATH_SELECTION', 'TEAM_DISCOVERY', 'TEAM_PROFILE', 'OTHER');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.approved_membership_mode as enum (
    'PLAYER',
    'COMMITTEE',
    'DIRECTOR',
    'PRESIDENT',
    'PLAYER_DIRECTOR',
    'PLAYER_PRESIDENT'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.notification_type as enum (
    'TEAM_JOIN_REQUEST_CREATED',
    'TEAM_JOIN_REQUEST_APPROVED',
    'TEAM_JOIN_REQUEST_REJECTED',
    'MATCH_REMINDER',
    'SOCIAL_CONNECTION_ATTENTION',
    'PLAYER_WELCOME_PUBLISHED'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.notification_status as enum ('UNREAD', 'READ', 'ARCHIVED');
exception when duplicate_object then null;
end $$;

alter table public.team_join_requests
  add column if not exists status text;

alter table public.team_join_requests
  add column if not exists source_context text;

alter table public.team_join_requests
  add column if not exists requested_at timestamptz;

alter table public.team_join_requests
  add column if not exists responded_at timestamptz;

alter table public.team_join_requests
  add column if not exists responded_by_user_id uuid;

alter table public.team_join_requests
  add column if not exists approved_membership_mode text;

alter table public.team_join_requests
  add column if not exists rejection_reason text;

alter table public.team_join_requests
  add column if not exists cancelled_at timestamptz;

update public.team_join_requests
set requested_at = coalesce(requested_at, created_at, now()),
    responded_at = coalesce(responded_at, reviewed_at),
    responded_by_user_id = coalesce(responded_by_user_id, reviewed_by_user_id),
    approved_membership_mode = coalesce(
      approved_membership_mode,
      case
        when requested_role in ('COMMITTEE', 'DIRECTOR', 'PRESIDENT') then requested_role::text
        else null
      end
    ),
    rejection_reason = coalesce(
      rejection_reason,
      case
        when approved = false then nullif(btrim(coalesce(message, '')), '')
        else null
      end
    ),
    status = coalesce(
      status,
      case
        when approved = true then 'APPROVED'
        when approved = false then 'REJECTED'
        else 'PENDING'
      end
    );

alter table public.team_join_requests
  alter column requested_at set default now();

update public.team_join_requests
set requested_at = now()
where requested_at is null;

alter table public.team_join_requests
  alter column requested_at set not null;

update public.team_join_requests
set status = 'PENDING'
where status is null;

alter table public.team_join_requests
  alter column status set not null;

alter table public.team_join_requests
  alter column status drop default;

alter table public.team_join_requests
  drop constraint if exists team_join_requests_responded_by_user_id_fkey;

alter table public.team_join_requests
  add constraint team_join_requests_responded_by_user_id_fkey
  foreign key (responded_by_user_id)
  references public.users(id)
  on update cascade
  on delete set null;

alter table public.team_join_requests
  drop constraint if exists ck_team_join_requests_status;

alter table public.team_join_requests
  alter column status type public.team_join_request_status
  using status::public.team_join_request_status;

alter table public.team_join_requests
  alter column status set default 'PENDING'::public.team_join_request_status;

alter table public.team_join_requests
  alter column source_context type public.join_request_source
  using (
    case
      when source_context is null then null
      else source_context::public.join_request_source
    end
  );

alter table public.team_join_requests
  alter column approved_membership_mode type public.approved_membership_mode
  using (
    case
      when approved_membership_mode is null then null
      else approved_membership_mode::public.approved_membership_mode
    end
  );

alter table public.team_join_requests
  drop constraint if exists ck_team_join_requests_source_context_not_blank_when_present;

alter table public.team_join_requests
  drop constraint if exists ck_team_join_requests_rejection_reason_not_blank_when_present;

alter table public.team_join_requests
  add constraint ck_team_join_requests_rejection_reason_not_blank_when_present
  check (rejection_reason is null or btrim(rejection_reason) <> '');

alter table public.team_join_requests
  drop constraint if exists ck_team_join_requests_response_consistency;

alter table public.team_join_requests
  add constraint ck_team_join_requests_response_consistency
  check (
    (status in ('APPROVED', 'REJECTED') and responded_at is not null)
    or (status not in ('APPROVED', 'REJECTED'))
  );

alter table public.team_join_requests
  drop constraint if exists ck_team_join_requests_approved_mode_consistency;

alter table public.team_join_requests
  add constraint ck_team_join_requests_approved_mode_consistency
  check (
    (status = 'APPROVED' and approved_membership_mode is not null)
    or (status <> 'APPROVED' and approved_membership_mode is null)
  );

alter table public.team_join_requests
  drop constraint if exists ck_team_join_requests_cancelled_at_consistency;

alter table public.team_join_requests
  add constraint ck_team_join_requests_cancelled_at_consistency
  check (
    (status = 'CANCELLED' and cancelled_at is not null)
    or (status <> 'CANCELLED' and cancelled_at is null)
  );

alter table public.team_join_requests
  drop constraint if exists ck_team_join_requests_rejection_reason_status_consistency;

alter table public.team_join_requests
  add constraint ck_team_join_requests_rejection_reason_status_consistency
  check (
    status = 'REJECTED'
    or (status <> 'REJECTED' and rejection_reason is null)
  );

alter table public.team_join_requests
  drop constraint if exists ck_team_join_requests_requested_responded_order;

alter table public.team_join_requests
  add constraint ck_team_join_requests_requested_responded_order
  check (responded_at is null or responded_at >= requested_at);

alter table public.team_join_requests
  drop constraint if exists ck_team_join_requests_requested_cancelled_order;

alter table public.team_join_requests
  add constraint ck_team_join_requests_requested_cancelled_order
  check (cancelled_at is null or cancelled_at >= requested_at);

create index if not exists idx_team_join_requests_requested_at
  on public.team_join_requests (requested_at desc);

alter table public.team_join_requests
  drop column if exists reviewed_at;

alter table public.team_join_requests
  drop column if exists reviewed_by_user_id;

alter table public.team_join_requests
  drop column if exists approved;

alter table public.team_join_requests
  drop column if exists requested_role;

alter table public.team_join_requests
  drop column if exists message;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid not null references public.users(id) on update cascade on delete cascade,
  type public.notification_type not null,
  title text not null,
  body text,
  status public.notification_status not null default 'UNREAD',
  action_url text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  archived_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint ck_notifications_title_not_blank check (btrim(title) <> ''),
  constraint ck_notifications_body_not_blank_when_present check (body is null or btrim(body) <> ''),
  constraint ck_notifications_action_url_not_blank_when_present check (action_url is null or btrim(action_url) <> ''),
  constraint ck_notifications_unread_read_at_consistency check (
    (status = 'UNREAD' and read_at is null)
    or (status in ('READ', 'ARCHIVED'))
  ),
  constraint ck_notifications_archived_status_consistency check (
    (status = 'ARCHIVED' and archived_at is not null)
    or (status <> 'ARCHIVED' and archived_at is null)
  )
);

create trigger trg_notifications_touch_updated_at
before update on public.notifications
for each row execute function public.touch_updated_at();

create index if not exists idx_notifications_recipient_user_id
  on public.notifications (recipient_user_id);
create index if not exists idx_notifications_recipient_status_created_at
  on public.notifications (recipient_user_id, status, created_at desc);
create index if not exists idx_notifications_type
  on public.notifications (type);
create index if not exists idx_notifications_created_at
  on public.notifications (created_at desc);

create table if not exists public.person_social_connections (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.persons(id) on update cascade on delete cascade,
  platform public.social_platform not null,
  handle text,
  channel_url text,
  connection_status public.social_connection_status not null default 'PENDING',
  is_visible boolean not null default true,
  display_order integer not null default 0,
  last_validated_at timestamptz,
  external_account_id text,
  access_token_ref text,
  refresh_token_ref text,
  token_expires_at timestamptz,
  created_by_user_id uuid references public.users(id) on update cascade on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_person_social_connections_person_platform unique (person_id, platform),
  constraint ck_person_social_connections_handle_or_channel_url_required check (
    nullif(btrim(coalesce(handle, '')), '') is not null
    or nullif(btrim(coalesce(channel_url, '')), '') is not null
  ),
  constraint ck_person_social_connections_handle_not_blank_when_present check (
    handle is null or btrim(handle) <> ''
  ),
  constraint ck_person_social_connections_channel_url_not_blank_when_present check (
    channel_url is null or btrim(channel_url) <> ''
  ),
  constraint ck_person_social_connections_display_order_non_negative check (
    display_order >= 0
  )
);

create trigger trg_person_social_connections_touch_updated_at
before update on public.person_social_connections
for each row execute function public.touch_updated_at();

create index if not exists idx_person_social_connections_person_id
  on public.person_social_connections (person_id);
create index if not exists idx_person_social_connections_platform
  on public.person_social_connections (platform);
create index if not exists idx_person_social_connections_visible_order
  on public.person_social_connections (person_id, is_visible, display_order);
create index if not exists idx_person_social_connections_access_token_ref
  on public.person_social_connections (access_token_ref);
create index if not exists idx_person_social_connections_refresh_token_ref
  on public.person_social_connections (refresh_token_ref);

alter table public.person_social_connections
  drop constraint if exists fk_person_social_connections_access_token_ref;

alter table public.person_social_connections
  add constraint fk_person_social_connections_access_token_ref
  foreign key (access_token_ref)
  references public.social_connection_secrets(secret_ref)
  on update cascade
  on delete set null;

alter table public.person_social_connections
  drop constraint if exists fk_person_social_connections_refresh_token_ref;

alter table public.person_social_connections
  add constraint fk_person_social_connections_refresh_token_ref
  foreign key (refresh_token_ref)
  references public.social_connection_secrets(secret_ref)
  on update cascade
  on delete set null;

create or replace function public.create_notification(
  p_recipient_user_id uuid,
  p_type public.notification_type,
  p_title text,
  p_body text default null,
  p_action_url text default null,
  p_payload jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  notification_id uuid;
begin
  insert into public.notifications (
    recipient_user_id,
    type,
    title,
    body,
    action_url,
    payload
  )
  values (
    p_recipient_user_id,
    p_type,
    btrim(p_title),
    nullif(btrim(coalesce(p_body, '')), ''),
    nullif(btrim(coalesce(p_action_url, '')), ''),
    coalesce(p_payload, '{}'::jsonb)
  )
  returning id into notification_id;

  return notification_id;
end;
$$;

create or replace function public.archive_join_request_operational_notifications(
  p_join_request_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.notifications
  set status = 'ARCHIVED',
      archived_at = coalesce(archived_at, now()),
      updated_at = now()
  where type = 'TEAM_JOIN_REQUEST_CREATED'
    and status <> 'ARCHIVED'
    and payload ->> 'join_request_id' = p_join_request_id::text;
end;
$$;

create or replace function public.create_team_join_request(
  p_team_id uuid,
  p_source_context public.join_request_source default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  app_user public.users%rowtype;
  requester_person public.persons%rowtype;
  team_row public.teams%rowtype;
  join_request_row public.team_join_requests%rowtype;
  manager_user_id uuid;
  requester_display_name text;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  perform public.bootstrap_current_user();

  select * into app_user
  from public.users
  where id = auth.uid();

  select * into requester_person
  from public.persons
  where id = app_user.person_id;

  select * into team_row
  from public.teams
  where id = p_team_id;

  if not found then
    raise exception 'TEAM_NOT_FOUND';
  end if;

  if exists (
    select 1
    from public.team_members tm
    where tm.team_id = p_team_id
      and tm.person_id = app_user.person_id
      and tm.membership_status = 'ACTIVE'
  ) then
    raise exception 'TEAM_MEMBER_ALREADY_EXISTS';
  end if;

  if exists (
    select 1
    from public.team_join_requests jr
    where jr.team_id = p_team_id
      and jr.requester_user_id = auth.uid()
      and jr.status = 'PENDING'
  ) then
    raise exception 'TEAM_JOIN_REQUEST_ALREADY_PENDING';
  end if;

  insert into public.team_join_requests (
    team_id,
    requester_user_id,
    status,
    source_context,
    requested_at
  )
  values (
    p_team_id,
    auth.uid(),
    'PENDING',
    p_source_context,
    now()
  )
  returning * into join_request_row;

  requester_display_name := coalesce(
    nullif(btrim(coalesce(app_user.display_name, '')), ''),
    nullif(btrim(coalesce(requester_person.full_name, '')), ''),
    requester_person.nickname,
    'Uma pessoa'
  );

  for manager_user_id in
    select distinct utr.user_id
    from public.user_team_roles utr
    where utr.team_id = p_team_id
      and utr.role in ('DIRECTOR', 'PRESIDENT')
      and utr.revoked_at is null
      and utr.user_id <> auth.uid()
  loop
    perform public.create_notification(
      manager_user_id,
      'TEAM_JOIN_REQUEST_CREATED',
      'Nova solicitacao para entrar no time',
      requester_display_name || ' quer entrar em ' || team_row.name || '.',
      '/notifications?join_request_id=' || join_request_row.id::text,
      jsonb_build_object(
        'team_id', team_row.id,
        'team_name', team_row.name,
        'join_request_id', join_request_row.id,
        'requester_user_id', app_user.id,
        'requester_display_name', requester_display_name,
        'notification_context', 'TEAM_JOIN_REQUEST_CREATED'
      )
    );
  end loop;

  return jsonb_build_object(
    'join_request', jsonb_build_object(
      'id', join_request_row.id,
      'team_id', join_request_row.team_id,
      'requester_user_id', join_request_row.requester_user_id,
      'status', join_request_row.status,
      'requested_at', join_request_row.requested_at,
      'source_context', join_request_row.source_context
    ),
    'team_summary', jsonb_build_object(
      'team_id', team_row.id,
      'name', team_row.name,
      'crest_url', (
        select ma.public_url
        from public.media_assets ma
        where ma.id = team_row.crest_media_id
      )
    )
  );
end;
$$;

create or replace function public.get_team_join_request_queue(
  p_team_id uuid,
  p_status public.team_join_request_status default 'PENDING'
)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if not public.is_team_manager(p_team_id) then
    raise exception 'TEAM_MANAGER_REQUIRED';
  end if;

  return coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'id', jr.id,
        'team_id', jr.team_id,
        'requester_user_id', jr.requester_user_id,
        'status', jr.status,
        'source_context', jr.source_context,
        'requested_at', jr.requested_at,
        'responded_at', jr.responded_at,
        'approved_membership_mode', jr.approved_membership_mode,
        'rejection_reason', jr.rejection_reason,
        'requester', jsonb_build_object(
          'person_id', u.person_id,
          'display_name', coalesce(nullif(btrim(coalesce(u.display_name, '')), ''), p.nickname),
          'full_name', p.full_name,
          'nickname', p.nickname,
          'avatar_url', u.avatar_url,
          'has_player', exists (
            select 1 from public.players pl where pl.person_id = u.person_id
          )
        )
      )
      order by jr.requested_at desc
    )
    from public.team_join_requests jr
    join public.users u on u.id = jr.requester_user_id
    join public.persons p on p.id = u.person_id
    where jr.team_id = p_team_id
      and jr.status = p_status
  ), '[]'::jsonb);
end;
$$;

create or replace function public.approve_team_join_request(
  p_request_id uuid,
  p_approved_membership_mode public.approved_membership_mode
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  join_request_row public.team_join_requests%rowtype;
  requester_user public.users%rowtype;
  requester_person public.persons%rowtype;
  team_row public.teams%rowtype;
  team_member_id_value uuid;
  player_id_value uuid;
  team_player_id_value uuid;
  created_team_role public.team_role;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  perform public.bootstrap_current_user();

  select * into join_request_row
  from public.team_join_requests
  where id = p_request_id;

  if not found then
    raise exception 'TEAM_JOIN_REQUEST_NOT_FOUND';
  end if;

  if not public.is_team_manager(join_request_row.team_id) then
    raise exception 'TEAM_MANAGER_REQUIRED';
  end if;

  if join_request_row.status <> 'PENDING' then
    return jsonb_build_object(
      'join_request', jsonb_build_object(
        'id', join_request_row.id,
        'status', join_request_row.status,
        'approved_membership_mode', join_request_row.approved_membership_mode,
        'responded_at', join_request_row.responded_at,
        'responded_by_user_id', join_request_row.responded_by_user_id
      ),
      'read_only', true
    );
  end if;

  select * into requester_user
  from public.users
  where id = join_request_row.requester_user_id;

  select * into requester_person
  from public.persons
  where id = requester_user.person_id;

  select * into team_row
  from public.teams
  where id = join_request_row.team_id;

  select tm.id into team_member_id_value
  from public.team_members tm
  where tm.team_id = join_request_row.team_id
    and tm.person_id = requester_user.person_id
  order by case when tm.membership_status = 'ACTIVE' then 0 else 1 end, tm.created_at
  limit 1;

  if team_member_id_value is null then
    insert into public.team_members (
      team_id,
      person_id,
      membership_status,
      joined_at,
      created_by_user_id
    )
    values (
      join_request_row.team_id,
      requester_user.person_id,
      'ACTIVE',
      now(),
      auth.uid()
    )
    returning id into team_member_id_value;
  else
    update public.team_members
    set membership_status = 'ACTIVE',
        joined_at = coalesce(joined_at, now()),
        left_at = null,
        updated_at = now()
    where id = team_member_id_value;
  end if;

  if p_approved_membership_mode in ('PLAYER', 'PLAYER_DIRECTOR', 'PLAYER_PRESIDENT') then
    select pl.id into player_id_value
    from public.players pl
    where pl.person_id = requester_user.person_id;

    if player_id_value is null then
      insert into public.players (person_id, profile_completeness_status)
      values (requester_user.person_id, 'INCOMPLETE')
      returning id into player_id_value;
    end if;

    select tp.id into team_player_id_value
    from public.team_players tp
    where tp.team_member_id = team_member_id_value
    order by case when tp.status = 'ACTIVE' then 0 else 1 end, tp.created_at
    limit 1;

    if team_player_id_value is null then
      insert into public.team_players (
        team_member_id,
        player_id,
        status,
        joined_at
      )
      values (
        team_member_id_value,
        player_id_value,
        'ACTIVE',
        now()
      )
      returning id into team_player_id_value;
    else
      update public.team_players
      set player_id = player_id_value,
          status = 'ACTIVE',
          joined_at = coalesce(joined_at, now()),
          left_at = null,
          updated_at = now()
      where id = team_player_id_value;
    end if;
  end if;

  created_team_role := case p_approved_membership_mode
    when 'COMMITTEE' then 'COMMITTEE'
    when 'DIRECTOR' then 'DIRECTOR'
    when 'PRESIDENT' then 'PRESIDENT'
    when 'PLAYER_DIRECTOR' then 'DIRECTOR'
    when 'PLAYER_PRESIDENT' then 'PRESIDENT'
    else null
  end;

  if created_team_role is not null then
    if not exists (
      select 1
      from public.user_team_roles utr
      where utr.user_id = requester_user.id
        and utr.team_id = join_request_row.team_id
        and utr.role = created_team_role
        and utr.revoked_at is null
    ) then
      insert into public.user_team_roles (
        user_id,
        team_id,
        role,
        granted_by_user_id
      )
      values (
        requester_user.id,
        join_request_row.team_id,
        created_team_role,
        auth.uid()
      );
    end if;
  end if;

  update public.team_join_requests
  set status = 'APPROVED',
      approved_membership_mode = p_approved_membership_mode,
      responded_at = now(),
      responded_by_user_id = auth.uid(),
      rejection_reason = null,
      cancelled_at = null,
      updated_at = now()
  where id = join_request_row.id
  returning * into join_request_row;

  perform public.archive_join_request_operational_notifications(join_request_row.id);

  perform public.create_notification(
    requester_user.id,
    'TEAM_JOIN_REQUEST_APPROVED',
    'Solicitacao aprovada',
    'Seu pedido para entrar em ' || team_row.name || ' foi aprovado.',
    '/notifications?join_request_id=' || join_request_row.id::text,
    jsonb_build_object(
      'team_id', team_row.id,
      'team_name', team_row.name,
      'join_request_id', join_request_row.id,
      'approved_membership_mode', p_approved_membership_mode,
      'notification_context', 'TEAM_JOIN_REQUEST_APPROVED'
    )
  );

  return jsonb_build_object(
    'join_request', jsonb_build_object(
      'id', join_request_row.id,
      'status', join_request_row.status,
      'approved_membership_mode', join_request_row.approved_membership_mode,
      'responded_at', join_request_row.responded_at,
      'responded_by_user_id', join_request_row.responded_by_user_id
    ),
    'membership_result', jsonb_build_object(
      'team_id', join_request_row.team_id,
      'team_member_id', team_member_id_value,
      'player_id', player_id_value,
      'team_player_id', team_player_id_value,
      'created_team_role', created_team_role
    )
  );
end;
$$;

create or replace function public.reject_team_join_request(
  p_request_id uuid,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  join_request_row public.team_join_requests%rowtype;
  requester_user public.users%rowtype;
  team_row public.teams%rowtype;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  perform public.bootstrap_current_user();

  select * into join_request_row
  from public.team_join_requests
  where id = p_request_id;

  if not found then
    raise exception 'TEAM_JOIN_REQUEST_NOT_FOUND';
  end if;

  if not public.is_team_manager(join_request_row.team_id) then
    raise exception 'TEAM_MANAGER_REQUIRED';
  end if;

  if join_request_row.status <> 'PENDING' then
    return jsonb_build_object(
      'join_request', jsonb_build_object(
        'id', join_request_row.id,
        'status', join_request_row.status,
        'approved_membership_mode', join_request_row.approved_membership_mode,
        'responded_at', join_request_row.responded_at,
        'responded_by_user_id', join_request_row.responded_by_user_id
      ),
      'read_only', true
    );
  end if;

  select * into requester_user
  from public.users
  where id = join_request_row.requester_user_id;

  select * into team_row
  from public.teams
  where id = join_request_row.team_id;

  update public.team_join_requests
  set status = 'REJECTED',
      approved_membership_mode = null,
      responded_at = now(),
      responded_by_user_id = auth.uid(),
      rejection_reason = nullif(btrim(coalesce(p_reason, '')), ''),
      cancelled_at = null,
      updated_at = now()
  where id = join_request_row.id
  returning * into join_request_row;

  perform public.archive_join_request_operational_notifications(join_request_row.id);

  perform public.create_notification(
    requester_user.id,
    'TEAM_JOIN_REQUEST_REJECTED',
    'Solicitacao recusada',
    'O time ' || team_row.name || ' nao aprovou sua solicitacao neste momento.',
    '/notifications?join_request_id=' || join_request_row.id::text,
    jsonb_build_object(
      'team_id', team_row.id,
      'team_name', team_row.name,
      'join_request_id', join_request_row.id,
      'notification_context', 'TEAM_JOIN_REQUEST_REJECTED'
    )
  );

  return jsonb_build_object(
    'join_request', jsonb_build_object(
      'id', join_request_row.id,
      'status', join_request_row.status,
      'responded_at', join_request_row.responded_at,
      'responded_by_user_id', join_request_row.responded_by_user_id,
      'rejection_reason', join_request_row.rejection_reason
    )
  );
end;
$$;

create or replace function public.cancel_team_join_request(
  p_request_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  join_request_row public.team_join_requests%rowtype;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  perform public.bootstrap_current_user();

  select * into join_request_row
  from public.team_join_requests
  where id = p_request_id
    and requester_user_id = auth.uid();

  if not found then
    raise exception 'TEAM_JOIN_REQUEST_NOT_FOUND';
  end if;

  if join_request_row.status <> 'PENDING' then
    return jsonb_build_object(
      'join_request', jsonb_build_object(
        'id', join_request_row.id,
        'status', join_request_row.status,
        'responded_at', join_request_row.responded_at,
        'cancelled_at', join_request_row.cancelled_at
      ),
      'read_only', true
    );
  end if;

  update public.team_join_requests
  set status = 'CANCELLED',
      cancelled_at = now(),
      approved_membership_mode = null,
      rejection_reason = null,
      responded_at = null,
      responded_by_user_id = null,
      updated_at = now()
  where id = join_request_row.id
  returning * into join_request_row;

  perform public.archive_join_request_operational_notifications(join_request_row.id);

  return jsonb_build_object(
    'join_request', jsonb_build_object(
      'id', join_request_row.id,
      'status', join_request_row.status,
      'cancelled_at', join_request_row.cancelled_at
    )
  );
end;
$$;

create or replace function public.get_my_notifications(
  p_include_archived boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  return coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'id', n.id,
        'type', n.type,
        'title', n.title,
        'body', n.body,
        'status', n.status,
        'action_url', n.action_url,
        'payload', n.payload,
        'created_at', n.created_at,
        'read_at', n.read_at,
        'archived_at', n.archived_at
      )
      order by n.created_at desc
    )
    from public.notifications n
    where n.recipient_user_id = auth.uid()
      and (p_include_archived or n.status <> 'ARCHIVED')
  ), '[]'::jsonb);
end;
$$;

create or replace function public.mark_notification_read(
  p_notification_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  notification_row public.notifications%rowtype;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  update public.notifications
  set status = case when status = 'UNREAD' then 'READ' else status end,
      read_at = coalesce(read_at, now()),
      updated_at = now()
  where id = p_notification_id
    and recipient_user_id = auth.uid()
  returning * into notification_row;

  if notification_row.id is null then
    raise exception 'NOTIFICATION_NOT_FOUND';
  end if;

  return jsonb_build_object(
    'id', notification_row.id,
    'status', notification_row.status,
    'read_at', notification_row.read_at,
    'archived_at', notification_row.archived_at
  );
end;
$$;

create or replace function public.archive_notification(
  p_notification_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  notification_row public.notifications%rowtype;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  update public.notifications
  set status = 'ARCHIVED',
      archived_at = coalesce(archived_at, now()),
      updated_at = now()
  where id = p_notification_id
    and recipient_user_id = auth.uid()
  returning * into notification_row;

  if notification_row.id is null then
    raise exception 'NOTIFICATION_NOT_FOUND';
  end if;

  return jsonb_build_object(
    'id', notification_row.id,
    'status', notification_row.status,
    'read_at', notification_row.read_at,
    'archived_at', notification_row.archived_at
  );
end;
$$;

alter table public.notifications enable row level security;
alter table public.person_social_connections enable row level security;

create policy "Users can read their notifications"
on public.notifications for select
to authenticated
using (recipient_user_id = auth.uid());

create policy "Users can update their notifications"
on public.notifications for update
to authenticated
using (recipient_user_id = auth.uid())
with check (recipient_user_id = auth.uid());

create policy "Authenticated users can read visible person social connections"
on public.person_social_connections for select
to authenticated
using (
  is_visible = true
  or exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.person_id = person_social_connections.person_id
  )
);

create policy "Users can manage their person social connections"
on public.person_social_connections for all
to authenticated
using (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.person_id = person_social_connections.person_id
  )
)
with check (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.person_id = person_social_connections.person_id
  )
);

grant execute on function public.create_team_join_request(uuid, public.join_request_source) to authenticated;
grant execute on function public.get_team_join_request_queue(uuid, public.team_join_request_status) to authenticated;
grant execute on function public.approve_team_join_request(uuid, public.approved_membership_mode) to authenticated;
grant execute on function public.reject_team_join_request(uuid, text) to authenticated;
grant execute on function public.cancel_team_join_request(uuid) to authenticated;
grant execute on function public.get_my_notifications(boolean) to authenticated;
grant execute on function public.mark_notification_read(uuid) to authenticated;
grant execute on function public.archive_notification(uuid) to authenticated;
