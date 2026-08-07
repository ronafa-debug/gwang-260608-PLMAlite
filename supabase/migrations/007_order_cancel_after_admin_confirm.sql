-- Teacher cancel only while awaiting admin confirmation (submitted).
-- After admin "주문확인(접수)" → in_production, teacher cannot cancel.

drop policy if exists "Users manage own orders update" on public.orders;
drop policy if exists "Teachers cancel own submitted orders" on public.orders;

create policy "Users manage own orders update"
  on public.orders for update
  to authenticated
  using (
    auth.uid() = user_id
    and status = 'submitted'
  )
  with check (
    auth.uid() = user_id
    and status = 'cancelled'
  );
