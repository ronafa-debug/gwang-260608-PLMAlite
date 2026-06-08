-- Auth: profiles + per-user data isolation

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '선생님',
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.students
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.storytelling_materials
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.diary_materials
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists idx_students_user_id on public.students(user_id);
create index if not exists idx_storytelling_user_id on public.storytelling_materials(user_id);
create index if not exists idx_diary_user_id on public.diary_materials(user_id);

alter table public.profiles enable row level security;

drop policy if exists "Allow public read students" on public.students;
drop policy if exists "Allow public insert students" on public.students;
drop policy if exists "Allow public update students" on public.students;
drop policy if exists "Allow public delete students" on public.students;

drop policy if exists "Allow public read storytelling" on public.storytelling_materials;
drop policy if exists "Allow public insert storytelling" on public.storytelling_materials;
drop policy if exists "Allow public delete storytelling" on public.storytelling_materials;

drop policy if exists "Allow public read diary" on public.diary_materials;
drop policy if exists "Allow public insert diary" on public.diary_materials;
drop policy if exists "Allow public delete diary" on public.diary_materials;

drop policy if exists "Users manage own profile select" on public.profiles;
drop policy if exists "Users manage own profile update" on public.profiles;
drop policy if exists "Users manage own profile insert" on public.profiles;

drop policy if exists "Users manage own students" on public.students;
drop policy if exists "Users manage own storytelling" on public.storytelling_materials;
drop policy if exists "Users manage own diary" on public.diary_materials;

create policy "Users manage own profile select"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users manage own profile update"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users manage own profile insert"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users manage own students"
  on public.students for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own storytelling"
  on public.storytelling_materials for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own diary"
  on public.diary_materials for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', '선생님'),
    coalesce(new.email, '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
