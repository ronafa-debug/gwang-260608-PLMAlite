-- Phase 3: admin order management + invoice support

create or replace function public.is_store_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_store_admin() to authenticated;

drop policy if exists "Users manage own orders select" on public.orders;
create policy "Users manage own orders select"
  on public.orders for select
  to authenticated
  using (auth.uid() = user_id or public.is_store_admin());

drop policy if exists "Admins update all orders" on public.orders;
create policy "Admins update all orders"
  on public.orders for update
  to authenticated
  using (public.is_store_admin())
  with check (public.is_store_admin());

drop policy if exists "Users manage own order items select" on public.order_items;
create policy "Users manage own order items select"
  on public.order_items for select
  to authenticated
  using (
    order_id in (select id from public.orders where user_id = auth.uid())
    or public.is_store_admin()
  );

-- Admins may read all print assets for fulfillment
drop policy if exists "Admins read all print assets" on storage.objects;
create policy "Admins read all print assets"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'store-print-assets'
    and public.is_store_admin()
  );

-- Optional store billing settings (single row pattern not required; use seed defaults in app)
create table if not exists public.store_billing_settings (
  id int primary key default 1 check (id = 1),
  company_name text not null default 'PLMA Lite',
  bank_name text not null default '국민은행',
  bank_account text not null default '000000-00-000000',
  bank_holder text not null default 'PLMA',
  payment_due_note text not null default '행정실 후불 정산 · 청구서 수령 후 계좌이체 부탁드립니다.',
  updated_at timestamptz not null default now()
);

insert into public.store_billing_settings (id)
values (1)
on conflict (id) do nothing;

alter table public.store_billing_settings enable row level security;

drop policy if exists "Authenticated read billing settings" on public.store_billing_settings;
create policy "Authenticated read billing settings"
  on public.store_billing_settings for select
  to authenticated
  using (true);

drop policy if exists "Admins update billing settings" on public.store_billing_settings;
create policy "Admins update billing settings"
  on public.store_billing_settings for update
  to authenticated
  using (public.is_store_admin())
  with check (public.is_store_admin());
