-- Community: material share feed + topic boards + comments

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null default '선생님',
  board text not null
    check (board in ('materials', 'qna', 'tips')),
  title text not null,
  body text not null default '',
  -- Snapshot so peers can view without RLS access to private materials
  material_type text
    check (material_type is null or material_type in ('storytelling', 'diary')),
  material_id uuid,
  material_snapshot jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint community_posts_materials_require_snapshot check (
    board <> 'materials'
    or (
      material_type is not null
      and material_snapshot is not null
    )
  )
);

create index if not exists idx_community_posts_board_created
  on public.community_posts(board, created_at desc);
create index if not exists idx_community_posts_user
  on public.community_posts(user_id);

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null default '선생님',
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_community_comments_post
  on public.community_comments(post_id, created_at);

alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;

-- Posts: all authenticated teachers can read
drop policy if exists "Auth read community posts" on public.community_posts;
create policy "Auth read community posts"
  on public.community_posts for select
  to authenticated
  using (true);

drop policy if exists "Users insert own community posts" on public.community_posts;
create policy "Users insert own community posts"
  on public.community_posts for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users update own community posts" on public.community_posts;
create policy "Users update own community posts"
  on public.community_posts for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own community posts" on public.community_posts;
create policy "Users delete own community posts"
  on public.community_posts for delete
  to authenticated
  using (auth.uid() = user_id or public.is_store_admin());

-- Comments
drop policy if exists "Auth read community comments" on public.community_comments;
create policy "Auth read community comments"
  on public.community_comments for select
  to authenticated
  using (true);

drop policy if exists "Users insert own community comments" on public.community_comments;
create policy "Users insert own community comments"
  on public.community_comments for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own community comments" on public.community_comments;
create policy "Users delete own community comments"
  on public.community_comments for delete
  to authenticated
  using (auth.uid() = user_id or public.is_store_admin());
