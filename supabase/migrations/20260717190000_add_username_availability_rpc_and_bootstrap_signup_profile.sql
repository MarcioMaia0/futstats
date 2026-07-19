create or replace function public.is_reserved_username(p_username text)
returns boolean
language sql
stable
as $$
  select lower(coalesce(p_username, '')) in (
    'admin',
    'api',
    'app',
    'auth',
    'buscar',
    'configuracoes',
    'conta',
    'explorar',
    'futstats',
    'home',
    'inicio',
    'login',
    'me',
    'notifications',
    'notificacoes',
    'perfil',
    'search',
    'settings',
    'signup',
    'suporte',
    'team',
    'teams',
    'time',
    'times',
    'user',
    'users'
  );
$$;

create or replace function public.check_username_availability(p_username text)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  normalized_username text;
  username_count bigint;
  validation_error text;
begin
  normalized_username := lower(btrim(coalesce(p_username, '')));

  if normalized_username = '' then
    validation_error := 'EMPTY';
  elsif char_length(normalized_username) < 3 then
    validation_error := 'TOO_SHORT';
  elsif char_length(normalized_username) > 20 then
    validation_error := 'TOO_LONG';
  elsif normalized_username !~ '^[a-z0-9._]+$' then
    validation_error := 'INVALID_FORMAT';
  elsif public.is_reserved_username(normalized_username) then
    validation_error := 'RESERVED';
  end if;

  if validation_error is not null then
    return jsonb_build_object(
      'username', normalized_username,
      'available', false,
      'error', validation_error
    );
  end if;

  select count(*)
  into username_count
  from public.users
  where username = normalized_username;

  return jsonb_build_object(
    'username', normalized_username,
    'available', username_count = 0,
    'error', case when username_count = 0 then null else 'USERNAME_ALREADY_TAKEN' end
  );
end;
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
  username_value text;
  contact_phone_value text;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select * into auth_user from auth.users where id = auth.uid();
  if not found then
    raise exception 'AUTH_USER_NOT_FOUND';
  end if;

  display_name_value := nullif(coalesce(
    auth_user.raw_user_meta_data ->> 'display_name',
    auth_user.raw_user_meta_data ->> 'full_name',
    auth_user.raw_user_meta_data ->> 'name',
    split_part(auth_user.email, '@', 1),
    'Pessoa'
  ), '');

  nickname_value := nullif(coalesce(
    auth_user.raw_user_meta_data ->> 'nickname',
    auth_user.raw_user_meta_data ->> 'display_name',
    auth_user.raw_user_meta_data ->> 'name',
    display_name_value
  ), '');

  avatar_url_value := nullif(coalesce(
    auth_user.raw_user_meta_data ->> 'avatar_url',
    auth_user.raw_user_meta_data ->> 'picture'
  ), '');

  username_value := nullif(lower(btrim(auth_user.raw_user_meta_data ->> 'username')), '');
  contact_phone_value := nullif(btrim(auth_user.raw_user_meta_data ->> 'contact_phone'), '');

  select * into existing_user from public.users where id = auth.uid();
  if found then
    update public.users
    set username = coalesce(public.users.username, username_value),
        display_name = coalesce(public.users.display_name, display_name_value),
        avatar_url = coalesce(public.users.avatar_url, avatar_url_value),
        contact_phone = coalesce(public.users.contact_phone, contact_phone_value)
    where id = auth.uid();

    insert into public.user_preferences (user_id)
    values (existing_user.id)
    on conflict (user_id) do nothing;

    return public.get_me();
  end if;

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
    username,
    display_name,
    avatar_url,
    contact_phone,
    terms_accepted_at
  )
  values (
    auth.uid(),
    person_id_value,
    username_value,
    display_name_value,
    avatar_url_value,
    contact_phone_value,
    now()
  );

  insert into public.user_preferences (user_id)
  values (auth.uid())
  on conflict (user_id) do nothing;

  return public.get_me();
end;
$$;

grant execute on function public.check_username_availability(text) to anon;
grant execute on function public.check_username_availability(text) to authenticated;
