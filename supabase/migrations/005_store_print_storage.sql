-- Phase 2: private bucket for custom print assets (student face photos)

insert into storage.buckets (id, name, public)
values ('store-print-assets', 'store-print-assets', false)
on conflict (id) do nothing;

drop policy if exists "Users upload own print assets" on storage.objects;
drop policy if exists "Users read own print assets" on storage.objects;
drop policy if exists "Users update own print assets" on storage.objects;
drop policy if exists "Users delete own print assets" on storage.objects;

create policy "Users upload own print assets"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'store-print-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users read own print assets"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'store-print-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users update own print assets"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'store-print-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users delete own print assets"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'store-print-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow cancel while still in production (custom goods pre-ship)
drop policy if exists "Users manage own orders update" on public.orders;
create policy "Users manage own orders update"
  on public.orders for update
  to authenticated
  using (
    auth.uid() = user_id
    and status in ('submitted', 'in_production')
  )
  with check (auth.uid() = user_id);
