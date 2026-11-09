-- Poké-Agenda — vitrines publiques permanentes (étape V3.2).
-- À appliquer manuellement dans un projet Supabase. Ne jamais utiliser
-- la clé service_role dans le navigateur ou dans le dépôt GitHub.
-- Prérequis : Supabase Auth > Anonymous Sign-Ins = enabled.
--
-- Chaque utilisateur anonyme possède au maximum une vitrine.
-- Seul son identifiant authentifié peut la modifier (RLS).
-- La lecture publique se fait uniquement par ID via une fonction RPC :
-- impossible de lister les vitrines en interrogeant directement la table.

create table if not exists public.poke_showcases (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique default auth.uid() references auth.users(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_public_summary check (
    jsonb_typeof(payload) = 'object'
    and payload->>'v' = '1'
    and jsonb_typeof(payload->'rows') = 'array'
    and jsonb_array_length(payload->'rows') <= 100
    and octet_length(payload::text) <= 25000
  )
);

create index if not exists poke_showcases_updated_idx on public.poke_showcases(updated_at);

alter table public.poke_showcases enable row level security;
revoke all on table public.poke_showcases from public, anon, authenticated;
grant select, insert, update, delete on table public.poke_showcases to authenticated;

drop policy if exists "poke_showcase_owner_read" on public.poke_showcases;
create policy "poke_showcase_owner_read"
on public.poke_showcases for select to authenticated
using (owner_id = (select auth.uid()));

drop policy if exists "poke_showcase_owner_insert" on public.poke_showcases;
create policy "poke_showcase_owner_insert"
on public.poke_showcases for insert to authenticated
with check (owner_id = (select auth.uid()));

drop policy if exists "poke_showcase_owner_update" on public.poke_showcases;
create policy "poke_showcase_owner_update"
on public.poke_showcases for update to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

drop policy if exists "poke_showcase_owner_delete" on public.poke_showcases;
create policy "poke_showcase_owner_delete"
on public.poke_showcases for delete to authenticated
using (owner_id = (select auth.uid()));

create or replace function public.poke_showcase_touch_timestamp()
returns trigger language plpgsql set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
revoke all on function public.poke_showcase_touch_timestamp() from public, anon, authenticated;

drop trigger if exists poke_showcases_updated_at on public.poke_showcases;
create trigger poke_showcases_updated_at
before update on public.poke_showcases
for each row execute function public.poke_showcase_touch_timestamp();

-- Fonction de lecture limitée à une vitrine à la fois.
-- SECURITY DEFINER permet de ne PAS accorder SELECT sur la table aux visiteurs.
-- UUID non prédictible et aucune procédure de listing.
create or replace function public.get_poke_showcase(p_showcase_id uuid)
returns table (payload jsonb, updated_at timestamptz)
language sql stable security definer
set search_path = ''
as $$
  select s.payload, s.updated_at
  from public.poke_showcases s
  where s.id = p_showcase_id
  limit 1;
$$;
revoke all on function public.get_poke_showcase(uuid) from public, anon, authenticated;
grant execute on function public.get_poke_showcase(uuid) to anon, authenticated;

-- Contrôles recommandés avant publication :
-- 1. Un invité peut appeler get_poke_showcase(uuid), mais SELECT directement échoue.
-- 2. Le propriétaire peut créer, consulter, modifier et supprimer sa seule vitrine.
-- 3. Un second utilisateur anonyme ne peut PAS modifier la vitrine d'autrui.
-- 4. La table refuse deux vitrines pour le même owner_id.
-- 5. Les données envoyées ne contiennent ni notes ni listes de Pokémon.
-- 6. Configurer un CAPTCHA / anti-abus sur Anonymous Sign-Ins et les limites API.
