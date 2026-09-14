-- Student list custom order (▲▼ reorder in settings)

alter table public.students
  add column if not exists sort_order integer not null default 0;

-- Backfill: older students first within each teacher
with ranked as (
  select
    id,
    (row_number() over (
      partition by coalesce(user_id::text, id::text)
      order by created_at asc, id asc
    ) - 1)::integer as rn
  from public.students
)
update public.students s
set sort_order = ranked.rn
from ranked
where s.id = ranked.id;

create index if not exists idx_students_user_sort
  on public.students (user_id, sort_order);
