do $$
begin
  if not exists (select 1 from pg_type where typnamespace = 'public'::regnamespace and typname = 'default_frame_type') then
    create type public.default_frame_type as enum ('SECOND_FRAME', 'FIRST_FRAME', 'UNASSIGNED');
  end if;
end;
$$;

create table if not exists public.team_player_frame_defaults (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on update cascade on delete restrict,
  player_id uuid not null references public.players(id) on update cascade on delete restrict,
  modality public.sport_modality not null,
  default_frame_type public.default_frame_type not null default 'UNASSIGNED',
  created_by_user_id uuid references public.users(id) on update cascade on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_team_player_frame_defaults_team_player_modality unique (team_id, player_id, modality)
);

drop trigger if exists trg_team_player_frame_defaults_touch_updated_at on public.team_player_frame_defaults;
create trigger trg_team_player_frame_defaults_touch_updated_at
before update on public.team_player_frame_defaults
for each row execute function public.touch_updated_at();

create index if not exists idx_team_player_frame_defaults_team_id
  on public.team_player_frame_defaults (team_id);

create index if not exists idx_team_player_frame_defaults_player_id
  on public.team_player_frame_defaults (player_id);

create index if not exists idx_team_player_frame_defaults_team_id_modality
  on public.team_player_frame_defaults (team_id, modality);

create index if not exists idx_team_player_frame_defaults_default_frame_type
  on public.team_player_frame_defaults (default_frame_type);

alter table public.team_player_frame_defaults enable row level security;

drop policy if exists "Team members can read player frame defaults" on public.team_player_frame_defaults;
create policy "Team members can read player frame defaults"
on public.team_player_frame_defaults for select
to authenticated
using (
  public.is_team_member(team_id)
  or public.is_team_manager(team_id)
);

drop policy if exists "Team managers can manage player frame defaults" on public.team_player_frame_defaults;
create policy "Team managers can manage player frame defaults"
on public.team_player_frame_defaults for all
to authenticated
using (public.is_team_manager(team_id))
with check (public.is_team_manager(team_id));

create or replace function public.create_team_roster_quick_person(
  p_team_id uuid,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  full_name_value text := nullif(btrim(coalesce(p_payload ->> 'full_name', '')), '');
  nickname_value text := nullif(btrim(coalesce(p_payload ->> 'nickname', '')), '');
  add_as_player_value boolean := coalesce((p_payload ->> 'add_as_player')::boolean, false);
  dominant_foot_value text := nullif(btrim(coalesce(p_payload ->> 'dominant_foot', '')), '');
  modality_value text := nullif(btrim(coalesce(p_payload ->> 'modality', '')), '');
  context_payload jsonb;
  context_modality text;
  context_default_frame_type text;
  context_position_codes jsonb;
  person_row public.persons%rowtype;
  player_row public.players%rowtype;
  team_member_row public.team_members%rowtype;
  team_player_row public.team_players%rowtype;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED'
      using errcode = '28000';
  end if;

  if not public.is_team_manager(p_team_id) then
    raise exception 'TEAM_MANAGER_REQUIRED'
      using errcode = '42501';
  end if;

  if full_name_value is null and nickname_value is null then
    raise exception 'PERSON_NAME_REQUIRED'
      using errcode = '23514';
  end if;

  nickname_value := coalesce(nickname_value, full_name_value);

  insert into public.persons (
    full_name,
    nickname,
    search_name
  )
  values (
    full_name_value,
    nickname_value,
    public.normalize_search_text(coalesce(full_name_value, '') || ' ' || coalesce(nickname_value, ''))
  )
  returning * into person_row;

  insert into public.team_members (
    team_id,
    person_id,
    membership_status,
    joined_at,
    created_by_user_id
  )
  values (
    p_team_id,
    person_row.id,
    'ACTIVE',
    now(),
    current_user_id
  )
  returning * into team_member_row;

  if add_as_player_value then
    insert into public.players (
      person_id,
      dominant_foot
    )
    values (
      person_row.id,
      case dominant_foot_value
        when 'RIGHT' then 'RIGHT'::public.dominant_foot
        when 'LEFT' then 'LEFT'::public.dominant_foot
        when 'BOTH' then 'AMBIDEXTROUS'::public.dominant_foot
        when 'AMBIDEXTROUS' then 'AMBIDEXTROUS'::public.dominant_foot
        else null
      end
    )
    returning * into player_row;

    insert into public.team_players (
      team_member_id,
      player_id,
      status,
      joined_at
    )
    values (
      team_member_row.id,
      player_row.id,
      'ACTIVE',
      now()
    )
    returning * into team_player_row;

    if jsonb_typeof(p_payload -> 'sport_contexts') = 'array' then
      for context_payload in select value from jsonb_array_elements(p_payload -> 'sport_contexts')
      loop
        context_modality := nullif(btrim(coalesce(context_payload ->> 'modality', '')), '');
        context_default_frame_type := coalesce(nullif(btrim(coalesce(context_payload ->> 'default_frame_type', '')), ''), 'UNASSIGNED');
        context_position_codes := context_payload -> 'position_codes';

        if context_modality is not null then
          insert into public.team_player_frame_defaults (
            team_id,
            player_id,
            modality,
            default_frame_type,
            created_by_user_id
          )
          values (
            p_team_id,
            player_row.id,
            context_modality::public.sport_modality,
            context_default_frame_type::public.default_frame_type,
            current_user_id
          )
          on conflict (team_id, player_id, modality)
          do update set
            default_frame_type = excluded.default_frame_type,
            updated_at = now();

          if jsonb_typeof(context_position_codes) = 'array' then
            insert into public.player_positions (
              player_id,
              modality_position_id
            )
            select
              player_row.id,
              modality_positions.id
            from public.modality_positions
            where modality_positions.modality = context_modality::public.sport_modality
              and modality_positions.code in (
                select jsonb_array_elements_text(context_position_codes)
              )
              and modality_positions.is_active = true
            on conflict do nothing;
          end if;
        end if;
      end loop;
    elsif modality_value is not null and jsonb_typeof(p_payload -> 'position_codes') = 'array' then
      insert into public.player_positions (
        player_id,
        modality_position_id
      )
      select
        player_row.id,
        modality_positions.id
      from public.modality_positions
      where modality_positions.modality = modality_value::public.sport_modality
        and modality_positions.code in (
          select jsonb_array_elements_text(p_payload -> 'position_codes')
        )
        and modality_positions.is_active = true
      on conflict do nothing;
    end if;
  end if;

  return jsonb_build_object(
    'person_id', person_row.id,
    'player_id', player_row.id,
    'team_player_id', team_player_row.id,
    'team_member_id', team_member_row.id
  );
end;
$$;

revoke all on function public.create_team_roster_quick_person(uuid, jsonb) from public;
grant execute on function public.create_team_roster_quick_person(uuid, jsonb) to authenticated;
