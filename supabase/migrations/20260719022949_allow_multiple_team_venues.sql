drop policy if exists "Authenticated users can create venues" on public.venues;

create policy "Authenticated users can create venues"
on public.venues for insert
to authenticated
with check (
  created_by_user_id = auth.uid()
  and (
    owner_team_id is null
    or public.is_team_manager(owner_team_id)
  )
);

drop policy if exists "Team managers can update venues" on public.venues;

create policy "Team managers can update venues"
on public.venues for update
to authenticated
using (
  (
    owner_team_id is not null
    and public.is_team_manager(owner_team_id)
  )
  or (
    owner_team_id is null
    and created_by_user_id = auth.uid()
  )
)
with check (
  (
    owner_team_id is not null
    and public.is_team_manager(owner_team_id)
  )
  or (
    owner_team_id is null
    and created_by_user_id = auth.uid()
  )
);

drop policy if exists "Team managers can delete venues" on public.venues;

create policy "Team managers can delete venues"
on public.venues for delete
to authenticated
using (
  owner_team_id is not null
  and public.is_team_manager(owner_team_id)
);
