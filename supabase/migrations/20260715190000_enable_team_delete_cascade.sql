alter table public.team_modalities
  drop constraint if exists team_modalities_team_id_fkey;

alter table public.team_modalities
  add constraint team_modalities_team_id_fkey
  foreign key (team_id)
  references public.teams(id)
  on update cascade
  on delete cascade;

alter table public.team_social_connections
  drop constraint if exists team_social_connections_team_id_fkey;

alter table public.team_social_connections
  add constraint team_social_connections_team_id_fkey
  foreign key (team_id)
  references public.teams(id)
  on update cascade
  on delete cascade;

alter table public.team_members
  drop constraint if exists team_members_team_id_fkey;

alter table public.team_members
  add constraint team_members_team_id_fkey
  foreign key (team_id)
  references public.teams(id)
  on update cascade
  on delete cascade;

alter table public.team_players
  drop constraint if exists team_players_team_member_id_fkey;

alter table public.team_players
  add constraint team_players_team_member_id_fkey
  foreign key (team_member_id)
  references public.team_members(id)
  on update cascade
  on delete cascade;

alter table public.user_team_roles
  drop constraint if exists user_team_roles_team_id_fkey;

alter table public.user_team_roles
  add constraint user_team_roles_team_id_fkey
  foreign key (team_id)
  references public.teams(id)
  on update cascade
  on delete cascade;

alter table public.team_join_requests
  drop constraint if exists team_join_requests_team_id_fkey;

alter table public.team_join_requests
  add constraint team_join_requests_team_id_fkey
  foreign key (team_id)
  references public.teams(id)
  on update cascade
  on delete cascade;

alter table public.venues
  drop constraint if exists fk_venues_owner_team;

alter table public.venues
  add constraint fk_venues_owner_team
  foreign key (owner_team_id)
  references public.teams(id)
  on update cascade
  on delete cascade;

create or replace function public.delete_team_dependent_media_assets()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.crest_media_id is not null then
    delete from public.media_assets
    where id = old.crest_media_id
      and purpose = 'TEAM_CREST';
  end if;

  return old;
end;
$$;

drop trigger if exists trg_teams_delete_dependent_media_assets on public.teams;

create trigger trg_teams_delete_dependent_media_assets
after delete on public.teams
for each row
execute function public.delete_team_dependent_media_assets();
