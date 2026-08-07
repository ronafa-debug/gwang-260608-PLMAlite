-- Store MVP Phase 1: products, orders, school shipping profile

alter table public.profiles
  add column if not exists role text not null default 'teacher',
  add column if not exists school_name text,
  add column if not exists shipping_address text,
  add column if not exists shipping_contact text,
  add column if not exists admin_office_note text;

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('teacher', 'admin'));

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('stock', 'custom')),
  name text not null,
  description text not null default '',
  category text not null default '소모품',
  unit_price integer not null check (unit_price >= 0),
  image_url text,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'submitted'
    check (status in (
      'submitted',
      'in_production',
      'shipped',
      'invoiced',
      'paid',
      'cancelled'
    )),
  school_name text not null default '',
  shipping_address text not null default '',
  shipping_contact text not null default '',
  teacher_name text not null default '',
  subtotal integer not null default 0 check (subtotal >= 0),
  note text,
  invoice_number text,
  submitted_at timestamptz not null default now(),
  shipped_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_type text not null check (product_type in ('stock', 'custom')),
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0),
  line_total integer not null check (line_total >= 0),
  student_id uuid references public.students(id) on delete set null,
  print_image_path text,
  print_label text,
  options jsonb not null default '{}'::jsonb,
  preview_confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_products_active on public.products(is_active);
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_submitted_at on public.orders(submitted_at desc);
create index if not exists idx_order_items_order_id on public.order_items(order_id);

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Authenticated read active products" on public.products;
create policy "Authenticated read active products"
  on public.products for select
  to authenticated
  using (is_active = true);

drop policy if exists "Users manage own orders select" on public.orders;
drop policy if exists "Users manage own orders insert" on public.orders;
drop policy if exists "Users manage own orders update" on public.orders;

create policy "Users manage own orders select"
  on public.orders for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users manage own orders insert"
  on public.orders for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users manage own orders update"
  on public.orders for update
  to authenticated
  using (
    auth.uid() = user_id
    and status in ('submitted', 'in_production')
  )
  with check (auth.uid() = user_id);

drop policy if exists "Users manage own order items select" on public.order_items;
drop policy if exists "Users manage own order items insert" on public.order_items;

create policy "Users manage own order items select"
  on public.order_items for select
  to authenticated
  using (
    order_id in (select id from public.orders where user_id = auth.uid())
  );

create policy "Users manage own order items insert"
  on public.order_items for insert
  to authenticated
  with check (
    order_id in (select id from public.orders where user_id = auth.uid())
  );

-- Seed catalog (idempotent: only when empty)
insert into public.products (type, name, description, category, unit_price, is_active)
select * from (values
  ('stock'::text, '색종이 세트 (100매)', '수업·미술 활동용 혼합 색종이', '소모품', 4500, true),
  ('stock', '풀 스틱 10본', '고체 풀, 교실 공용', '소모품', 3200, true),
  ('stock', '가위 (안전형 5자)', '초등 안전 가위', '소모품', 2800, true),
  ('stock', '연필 B 1타', 'HB/B 혼합 연필', '소모품', 3500, true),
  ('stock', '지우개 20개', '부드러운 지우개', '소모품', 2500, true),
  ('stock', '색연필 12색', '기본 색연필 세트', '미술용품', 4800, true),
  ('stock', '크레파스 12색', '어린이 크레파스', '미술용품', 4200, true),
  ('stock', '사인펜 12색', '수성 사인펜', '미술용품', 5500, true),
  ('stock', '도화지 A4 100매', '백색 도화지', '미술용품', 6000, true),
  ('stock', '풀칠 보드 10장', '활동 제작용 두꺼운 보드', '소모품', 7000, true),
  ('stock', '스티커 보상 세트', '강화용 스티커 혼합', '소모품', 3900, true),
  ('stock', '자 15cm 10개', '투명 자', '소모품', 2200, true),
  ('custom', '학생 얼굴 머그컵', '사진 인쇄 맞춤 머그 (시안 확인 후 제작)', '맞춤 굿즈', 18000, true),
  ('custom', '학생 티셔츠', '사진·이름 인쇄 티셔츠 (시안 확인 후 제작)', '맞춤 굿즈', 22000, true)
) as v(type, name, description, category, unit_price, is_active)
where not exists (select 1 from public.products limit 1);
