-- Avaliações reais importáveis e destaques editáveis do portfólio.
-- Execute no SQL Editor do Supabase antes de publicar a interface correspondente.

alter table public.site_settings
  add column if not exists hero_title_accent text not null default 'entra',
  add column if not exists satisfaction_title text not null default 'O cuidado também aparece na experiência.',
  add column if not exists satisfaction_intro text not null default 'Indicadores agregados e avaliações resumidas, extraídos de respostas reais de clientes.',
  add column if not exists satisfaction_title_accent text not null default 'cuidado';

alter table public.portfolio_works
  add column if not exists title_accent text not null default '';

create table if not exists public.portfolio_reviews (
  id uuid primary key default gen_random_uuid(),
  source_row integer,
  first_name text not null,
  full_name text,
  rating numeric(2,1) not null check (rating >= 0 and rating <= 5),
  enjoyed text,
  recommendation_reason text,
  expectation text,
  sentiment text,
  important_factors text,
  challenges text,
  suggestion text,
  summary text not null,
  is_visible boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.portfolio_reviews enable row level security;

drop policy if exists "public can read visible portfolio reviews" on public.portfolio_reviews;
create policy "public can read visible portfolio reviews"
on public.portfolio_reviews for select
using (is_visible = true);

drop policy if exists "admins manage portfolio reviews" on public.portfolio_reviews;
create policy "admins manage portfolio reviews"
on public.portfolio_reviews for all
using (public.is_portfolio_admin())
with check (public.is_portfolio_admin());

create or replace function public.set_portfolio_reviews_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_portfolio_reviews_updated_at on public.portfolio_reviews;
create trigger set_portfolio_reviews_updated_at
before update on public.portfolio_reviews
for each row execute function public.set_portfolio_reviews_updated_at();

alter table public.portfolio_reviews replica identity full;
do $$
begin
  if not exists (
    select 1
    from pg_publication_rel publication_relation
    join pg_publication publication on publication.oid = publication_relation.prpubid
    join pg_class relation on relation.oid = publication_relation.prrelid
    join pg_namespace schema_name on schema_name.oid = relation.relnamespace
    where publication.pubname = 'supabase_realtime'
      and schema_name.nspname = 'public'
      and relation.relname = 'portfolio_reviews'
  ) then
    alter publication supabase_realtime add table public.portfolio_reviews;
  end if;
end $$;

create unique index if not exists portfolio_reviews_source_row_key
on public.portfolio_reviews (source_row)
where source_row is not null;

insert into public.portfolio_reviews (
  source_row, first_name, full_name, rating, enjoyed, recommendation_reason,
  expectation, sentiment, important_factors, challenges, suggestion, summary,
  is_visible, position
) values
  (1, 'Thor', 'Thor Gambera', 5.0, 'Criatividade; Resultado', 'Pela criatividade e originalidade.', 'Superou minhas expectativas!', 'Profissionalismo e Confiança', 'Comunicação', 'Não tivemos desafios, o processo foi tranquilo.', 'Continue com o trabalho fera que você desenvolve!!', 'Destacou criatividade e resultado, relatando que o processo foi tranquilo.', true, 1),
  (2, 'Shirley', 'Shirley clarinda miranda da silva', 5.0, 'Resultado', 'Pelo bom atendimento e comunicação fácil.', 'Atendeu perfeitamente ao que eu esperava.', 'Profissionalismo e Confiança', 'Preço; Rapidez; Comunicação', 'Tivemos pequenos desafios, mas resolvemos bem.', 'Suce$$o', 'Valorizou o resultado e destacou o atendimento e a comunicação fáceis.', true, 2),
  (3, 'Marco', 'Marco Antônio Santos da Luz', 5.0, 'Criatividade; Agilidade; Resultado', 'Pela criatividade e originalidade.', 'Superou minhas expectativas!', 'Profissionalismo e Confiança', 'Preço; Qualidade; Rapidez; Comunicação', 'Não tivemos desafios, o processo foi tranquilo.', null, 'Citou criatividade, agilidade e resultado, com expectativa superada.', true, 3),
  (4, 'Victor', 'Victor Bittencourt', 5.0, 'Criatividade', 'Pela qualidade e atenção aos detalhes.', 'Atendeu perfeitamente ao que eu esperava.', 'Profissionalismo e Confiança', 'Qualidade', 'Não tivemos desafios, o processo foi tranquilo.', 'Continue assim!!', 'Ressaltou criatividade, qualidade e atenção aos detalhes.', true, 4)
on conflict (source_row) where source_row is not null do nothing;
