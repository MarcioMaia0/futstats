drop policy if exists "Team members can read roster user profiles" on public.users;

create policy "Team members can read roster user profiles"
on public.users for select
to authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.team_members target_member
    where target_member.person_id = users.person_id
      and target_member.membership_status = 'ACTIVE'
      and (
        public.is_team_member(target_member.team_id)
        or public.is_team_manager(target_member.team_id)
      )
  )
);
