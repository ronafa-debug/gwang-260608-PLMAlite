-- Admin content quality: read all materials + generation event logs

-- Admins can select all saved materials (teachers keep own-only via existing policies)
drop policy if exists "Admins read all storytelling" on public.storytelling_materials;
create policy "Admins read all storytelling"
  on public.storytelling_materials for select
  to authenticated
  using (public.is_store_admin());

drop policy if exists "Admins read all diary" on public.diary_materials;
create policy "Admins read all diary"
  on public.diary_materials for select
  to authenticated
  using (public.is_store_admin());

-- Generation / save / delete events for quality metrics (no student PII required)
create table if not exists public.generation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  material_type text not null
    check (material_type in ('storytelling', 'diary')),
  event_type text not null
    check (event_type in (
      'generate_success',
      'generate_failed',
      'saved',
      'deleted'
    )),
  duration_ms integer,
  error_code text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_generation_events_created
  on public.generation_events(created_at desc);
create index if not exists idx_generation_events_type
  on public.generation_events(material_type, event_type);
create index if not exists idx_generation_events_user
  on public.generation_events(user_id);

alter table public.generation_events enable row level security;

drop policy if exists "Users insert own generation events" on public.generation_events;
create policy "Users insert own generation events"
  on public.generation_events for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Admins read all generation events" on public.generation_events;
create policy "Admins read all generation events"
  on public.generation_events for select
  to authenticated
  using (public.is_store_admin());

-- Teachers may read their own events (optional, for future personal stats)
drop policy if exists "Users read own generation events" on public.generation_events;
create policy "Users read own generation events"
  on public.generation_events for select
  to authenticated
  using (auth.uid() = user_id);
