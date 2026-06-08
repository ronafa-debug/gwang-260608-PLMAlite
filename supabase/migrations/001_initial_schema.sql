-- PLMA Lite initial schema

create extension if not exists "pgcrypto";

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  grade text not null,
  favorite_character text not null,
  favorite_activity text not null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.storytelling_materials (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  subject text not null,
  learning_goal text not null,
  story_situation text not null,
  story_length text not null,
  story_content text not null,
  worksheet_content jsonb not null default '[]'::jsonb,
  coloring_image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.diary_materials (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  title text not null,
  raw_input text not null,
  final_text text not null,
  image_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_storytelling_student_id
  on public.storytelling_materials(student_id);

create index if not exists idx_diary_student_id
  on public.diary_materials(student_id);

create index if not exists idx_storytelling_created_at
  on public.storytelling_materials(created_at desc);

create index if not exists idx_diary_created_at
  on public.diary_materials(created_at desc);

insert into storage.buckets (id, name, public)
values
  ('coloring-images', 'coloring-images', true),
  ('diary-images', 'diary-images', true)
on conflict (id) do nothing;

alter table public.students enable row level security;
alter table public.storytelling_materials enable row level security;
alter table public.diary_materials enable row level security;

create policy "Allow public read students"
  on public.students for select using (true);

create policy "Allow public insert students"
  on public.students for insert with check (true);

create policy "Allow public update students"
  on public.students for update using (true);

create policy "Allow public delete students"
  on public.students for delete using (true);

create policy "Allow public read storytelling"
  on public.storytelling_materials for select using (true);

create policy "Allow public insert storytelling"
  on public.storytelling_materials for insert with check (true);

create policy "Allow public delete storytelling"
  on public.storytelling_materials for delete using (true);

create policy "Allow public read diary"
  on public.diary_materials for select using (true);

create policy "Allow public insert diary"
  on public.diary_materials for insert with check (true);

create policy "Allow public delete diary"
  on public.diary_materials for delete using (true);

create policy "Public read coloring images"
  on storage.objects for select
  using (bucket_id = 'coloring-images');

create policy "Public read diary images"
  on storage.objects for select
  using (bucket_id = 'diary-images');

create policy "Service role upload coloring images"
  on storage.objects for insert
  with check (bucket_id = 'coloring-images');

create policy "Service role upload diary images"
  on storage.objects for insert
  with check (bucket_id = 'diary-images');
