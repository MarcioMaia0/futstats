alter table public.team_settings
  add column if not exists ui_surface_base_color text,
  add column if not exists ui_surface_card_color text,
  add column if not exists ui_text_primary_color text,
  add column if not exists ui_text_muted_color text,
  add column if not exists ui_accent_primary_color text,
  add column if not exists ui_accent_on_primary_color text,
  add column if not exists ui_border_default_color text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'ck_team_settings_ui_surface_base_color_hex'
  ) then
    alter table public.team_settings
      add constraint ck_team_settings_ui_surface_base_color_hex
      check (ui_surface_base_color is null or ui_surface_base_color ~* '^#[0-9A-F]{6}$');
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'ck_team_settings_ui_surface_card_color_hex'
  ) then
    alter table public.team_settings
      add constraint ck_team_settings_ui_surface_card_color_hex
      check (ui_surface_card_color is null or ui_surface_card_color ~* '^#[0-9A-F]{6}$');
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'ck_team_settings_ui_text_primary_color_hex'
  ) then
    alter table public.team_settings
      add constraint ck_team_settings_ui_text_primary_color_hex
      check (ui_text_primary_color is null or ui_text_primary_color ~* '^#[0-9A-F]{6}$');
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'ck_team_settings_ui_text_muted_color_hex'
  ) then
    alter table public.team_settings
      add constraint ck_team_settings_ui_text_muted_color_hex
      check (ui_text_muted_color is null or ui_text_muted_color ~* '^#[0-9A-F]{6}$');
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'ck_team_settings_ui_accent_primary_color_hex'
  ) then
    alter table public.team_settings
      add constraint ck_team_settings_ui_accent_primary_color_hex
      check (ui_accent_primary_color is null or ui_accent_primary_color ~* '^#[0-9A-F]{6}$');
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'ck_team_settings_ui_accent_on_primary_color_hex'
  ) then
    alter table public.team_settings
      add constraint ck_team_settings_ui_accent_on_primary_color_hex
      check (ui_accent_on_primary_color is null or ui_accent_on_primary_color ~* '^#[0-9A-F]{6}$');
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'ck_team_settings_ui_border_default_color_hex'
  ) then
    alter table public.team_settings
      add constraint ck_team_settings_ui_border_default_color_hex
      check (ui_border_default_color is null or ui_border_default_color ~* '^#[0-9A-F]{6}$');
  end if;
end $$;
