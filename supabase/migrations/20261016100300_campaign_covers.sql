-- Storage for campaign cover images.
--
-- Public bucket (objects are readable by URL, which is what share previews need) with the
-- size and type limits enforced by Storage itself, in addition to the app's own checks in
-- src/lib/campaigns/cover.ts. Keep the two in sync: 3 MB, JPEG/PNG/WebP.
--
-- Objects live under "<owner id>/<file>". Write policies require the first path segment to
-- equal the caller's id and the caller not to be suspended, so a user can only write into
-- their own folder and a suspended user cannot upload at all.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'campaign-covers',
  'campaign-covers',
  true,
  3145728,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy campaign_covers_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'campaign-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.is_active_user()
  );

create policy campaign_covers_update_own on storage.objects
  for update to authenticated
  using (
    bucket_id = 'campaign-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.is_active_user()
  )
  with check (
    bucket_id = 'campaign-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.is_active_user()
  );

create policy campaign_covers_delete_own on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'campaign-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.is_active_user()
  );
