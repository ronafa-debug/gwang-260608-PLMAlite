-- 그림일기 스티커 이미지 저장

alter table public.diary_materials
  add column if not exists sticker_images jsonb not null default '[]'::jsonb;
