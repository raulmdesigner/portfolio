-- Controles de experiência pública: raspadinha, faixas e atalhos flutuantes.
-- Execute esta migração após 20260819_003_reviews_and_highlights.sql.

alter table public.site_settings
  add column if not exists section_visibility jsonb not null default '{"hero":true,"about":true,"reviews":true,"work":true,"process":true,"approach":true,"scratch":false,"contact":true}'::jsonb,
  add column if not exists rail_menu_items jsonb not null default '[{"id":"about","label":"Quem sou eu","target":"#quem-sou","visible":true},{"id":"work","label":"Trabalhos","target":"#trabalhos","visible":true},{"id":"process","label":"Conheça o processo","target":"#processo","action":"process","visible":true},{"id":"contact","label":"Contato","target":"#contato","visible":true},{"id":"email","label":"E-mail","target":"mailto:raulmirandadesign@outlook.com","visible":true,"cta":true}]'::jsonb,
  add column if not exists scratch_enabled boolean not null default false,
  add column if not exists scratch_heading text not null default 'Raspe para revelar um benefício.',
  add column if not exists scratch_instruction text not null default 'Passe a moeda sobre o cartão e descubra uma condição especial para seu próximo projeto.',
  add column if not exists scratch_benefit text not null default 'Benefício especial configurável',
  add column if not exists scratch_code text not null default 'FREQUENCIA',
  add column if not exists scratch_whatsapp_message text not null default 'Olá, Raul. Raspei o cartão no seu portfólio e quero usar o código {codigo} para {beneficio}.';

alter table public.portfolio_events drop constraint if exists portfolio_events_event_name_check;
alter table public.portfolio_events add constraint portfolio_events_event_name_check
  check (event_name in ('page_view', 'category_open', 'work_view', 'contact_click', 'process_open', 'scratch_start', 'scratch_complete', 'scratch_redeem'));

drop policy if exists events_public_insert on public.portfolio_events;
create policy events_public_insert on public.portfolio_events for insert with check (
  event_name in ('page_view', 'category_open', 'work_view', 'contact_click', 'process_open', 'scratch_start', 'scratch_complete', 'scratch_redeem')
  and (source_host is null or char_length(source_host) <= 255)
);

-- A rotina de restauração é redefinida para preservar todos os ajustes
-- acumulados em site_settings, inclusive a experiência pública.
create or replace function public.restore_portfolio_backup_as_admin(
  p_backup_id uuid,
  p_actor_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  source_snapshot jsonb;
  safety_snapshot jsonb;
begin
  if not exists (select 1 from public.portfolio_admins where id = p_actor_id) then
    raise exception 'Acesso administrativo necessário.' using errcode = '42501';
  end if;

  select snapshot into source_snapshot
  from public.content_backups
  where id = p_backup_id;

  if source_snapshot is null then
    raise exception 'Backup não encontrado.' using errcode = 'P0002';
  end if;

  safety_snapshot := jsonb_build_object(
    'settings', (select to_jsonb(settings) from public.site_settings settings where id = true),
    'categories', coalesce((select jsonb_agg(to_jsonb(category)) from public.portfolio_categories category), '[]'::jsonb),
    'works', coalesce((select jsonb_agg(to_jsonb(work)) from public.portfolio_works work), '[]'::jsonb),
    'media', coalesce((select jsonb_agg(to_jsonb(media)) from public.work_media media), '[]'::jsonb),
    'process', coalesce((select jsonb_agg(to_jsonb(step)) from public.process_steps step), '[]'::jsonb)
  );

  insert into public.content_backups (label, snapshot, created_by)
  values ('Backup automático antes de restauração', safety_snapshot, p_actor_id);

  delete from public.work_media;
  delete from public.portfolio_works;
  delete from public.portfolio_categories;
  delete from public.process_steps;

  if jsonb_typeof(source_snapshot->'settings') = 'object' then
    insert into public.site_settings
    select * from jsonb_populate_record(
      null::public.site_settings,
      coalesce((select to_jsonb(settings) from public.site_settings settings where id = true), '{}'::jsonb) || source_snapshot->'settings'
    )
    on conflict (id) do update set
      site_name = excluded.site_name,
      brand_name = excluded.brand_name,
      brand_mark_url = excluded.brand_mark_url,
      brand_mark_path = excluded.brand_mark_path,
      logo_alt = excluded.logo_alt,
      hero_eyebrow = excluded.hero_eyebrow,
      hero_title = excluded.hero_title,
      hero_title_accent = excluded.hero_title_accent,
      hero_text = excluded.hero_text,
      hero_image_url = excluded.hero_image_url,
      hero_image_path = excluded.hero_image_path,
      portrait_url = excluded.portrait_url,
      portrait_path = excluded.portrait_path,
      manifesto_text = excluded.manifesto_text,
      manifesto_statement = excluded.manifesto_statement,
      satisfaction_title = excluded.satisfaction_title,
      satisfaction_intro = excluded.satisfaction_intro,
      satisfaction_title_accent = excluded.satisfaction_title_accent,
      whatsapp_number = excluded.whatsapp_number,
      contact_email = excluded.contact_email,
      instagram_handle = excluded.instagram_handle,
      accent_orange = excluded.accent_orange,
      accent_blue = excluded.accent_blue,
      background_beige = excluded.background_beige,
      ink_color = excluded.ink_color,
      section_visibility = excluded.section_visibility,
      rail_menu_items = excluded.rail_menu_items,
      scratch_enabled = excluded.scratch_enabled,
      scratch_heading = excluded.scratch_heading,
      scratch_instruction = excluded.scratch_instruction,
      scratch_benefit = excluded.scratch_benefit,
      scratch_code = excluded.scratch_code,
      scratch_whatsapp_message = excluded.scratch_whatsapp_message;
  end if;

  insert into public.portfolio_categories
  select * from jsonb_populate_recordset(null::public.portfolio_categories, coalesce(source_snapshot->'categories', '[]'::jsonb));

  insert into public.portfolio_works
  select * from jsonb_populate_recordset(null::public.portfolio_works, coalesce(source_snapshot->'works', '[]'::jsonb));

  insert into public.work_media
  select * from jsonb_populate_recordset(null::public.work_media, coalesce(source_snapshot->'media', '[]'::jsonb));

  insert into public.process_steps
  select * from jsonb_populate_recordset(null::public.process_steps, coalesce(source_snapshot->'process', '[]'::jsonb));
end;
$$;
