-- Optional student profile photo (upper-body / face-visible recommended in UI)

alter table public.students
  add column if not exists photo_path text;

-- Private bucket for student profile photos
insert into storage.buckets (id, name, public)
values ('student-photos', 'student-photos', false)
on conflict (id) do nothing;

drop policy if exists "Users upload own student photos" on storage.objects;
drop policy if exists "Users read own student photos" on storage.objects;
drop policy if exists "Users update own student photos" on storage.objects;
drop policy if exists "Users delete own student photos" on storage.objects;

create policy "Users upload own student photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'student-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users read own student photos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'student-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users update own student photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'student-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users delete own student photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'student-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
