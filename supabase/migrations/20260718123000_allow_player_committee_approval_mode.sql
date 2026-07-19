alter type public.approved_membership_mode add value if not exists 'PLAYER_COMMITTEE';

create or replace function public.prevent_invalid_active_role_conflicts()
returns trigger
language plpgsql
as $$
declare
  has_director boolean;
  has_president boolean;
  has_committee boolean;
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

  if new.role = 'DIRECTOR' and (has_president or has_committee) then
    raise exception 'TEAM_ROLE_CONFLICT';
  end if;

  if new.role = 'PRESIDENT' and (has_director or has_committee) then
    raise exception 'TEAM_ROLE_CONFLICT';
  end if;

  if new.role = 'COMMITTEE' and (has_director or has_president) then
    raise exception 'TEAM_ROLE_CONFLICT';
  end if;

  return new;
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

  if p_approved_membership_mode in ('PLAYER', 'PLAYER_COMMITTEE', 'PLAYER_DIRECTOR', 'PLAYER_PRESIDENT') then
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
    when 'PLAYER_COMMITTEE' then 'COMMITTEE'
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

  return jsonb_build_object(
    'join_request', jsonb_build_object(
      'id', join_request_row.id,
      'status', join_request_row.status,
      'approved_membership_mode', join_request_row.approved_membership_mode,
      'responded_at', join_request_row.responded_at,
      'responded_by_user_id', join_request_row.responded_by_user_id
    ),
    'team_member_id', team_member_id_value,
    'team_player_id', team_player_id_value,
    'team_role', created_team_role
  );
end;
$$;
