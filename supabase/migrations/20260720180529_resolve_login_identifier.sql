create or replace function public.normalize_login_phone_digits(p_value text)
returns text
language sql
immutable
set search_path = public, pg_temp
as $$
  select nullif(regexp_replace(coalesce(p_value, ''), '\D', '', 'g'), '');
$$;

create index if not exists idx_users_contact_phone_digits
  on public.users (public.normalize_login_phone_digits(contact_phone))
  where contact_phone is not null;

create or replace function public.resolve_login_identifier(p_identifier text)
returns text
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  identifier_value text := lower(btrim(coalesce(p_identifier, '')));
  username_candidate text;
  phone_digits text;
  resolved_email text;
begin
  if identifier_value = '' then
    return null;
  end if;

  if position('@' in identifier_value) > 0 then
    select au.email
      into resolved_email
      from auth.users au
     where lower(au.email) = identifier_value
       and au.deleted_at is null
     limit 1;

    if resolved_email is not null then
      return resolved_email;
    end if;
  end if;

  username_candidate := lower(btrim(regexp_replace(identifier_value, '^@+', '')));

  if username_candidate <> '' then
    select au.email
      into resolved_email
      from public.users u
      join auth.users au on au.id = u.id
     where u.username = username_candidate
       and u.deleted_at is null
       and au.deleted_at is null
     limit 1;

    if resolved_email is not null then
      return resolved_email;
    end if;
  end if;

  if position('@' in identifier_value) > 0 then
    return null;
  end if;

  phone_digits := public.normalize_login_phone_digits(identifier_value);

  if phone_digits is not null and char_length(phone_digits) in (10, 11, 12, 13) then
    select au.email
      into resolved_email
      from public.users u
      join auth.users au on au.id = u.id
     where (
       public.normalize_login_phone_digits(u.contact_phone) = phone_digits
       or public.normalize_login_phone_digits(u.contact_phone) = concat('55', phone_digits)
       or concat('55', public.normalize_login_phone_digits(u.contact_phone)) = phone_digits
     )
       and u.deleted_at is null
       and au.deleted_at is null
     order by u.created_at asc
     limit 1;

    if resolved_email is not null then
      return resolved_email;
    end if;
  end if;

  return null;
end;
$$;

revoke all on function public.resolve_login_identifier(text) from public;
grant execute on function public.resolve_login_identifier(text) to anon, authenticated;
