drop policy if exists "Users can manage their media assets" on public.media_assets;

create policy "Users can read own media assets or public team crests"
on public.media_assets for select
to authenticated
using (
  owner_user_id = auth.uid()
  or exists (
    select 1
    from public.teams t
    where t.crest_media_id = media_assets.id
  )
);

create policy "Users can insert their own media assets"
on public.media_assets for insert
to authenticated
with check (owner_user_id = auth.uid());

create policy "Users can update their own media assets"
on public.media_assets for update
to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

create policy "Users can delete their own media assets"
on public.media_assets for delete
to authenticated
using (owner_user_id = auth.uid());
