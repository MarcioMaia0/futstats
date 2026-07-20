alter table public.team_modalities
  add column if not exists default_match_frame_count smallint not null default 1;

alter table public.team_modalities
  drop constraint if exists ck_team_modalities_default_match_frame_count;

alter table public.team_modalities
  add constraint ck_team_modalities_default_match_frame_count
  check (default_match_frame_count in (1, 2));
