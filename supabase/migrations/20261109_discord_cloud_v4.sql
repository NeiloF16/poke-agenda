-- Poké Agenda V4 — profils Discord et sauvegardes privées
-- Exécuter dans Supabase > SQL Editor APRES l'activation du fournisseur Discord.
-- La V3 et ses anciens liens ?live= restent inchangés.
--
-- Une collection complète = une ligne par auth.uid().
-- Seul le propriétaire authentifié peut la lire ou la modifier (RLS).
-- Les vitrines ne révèlent qu'un résumé et les éléments publics de Discord.

create table if not exists public.poke_cloud_collections (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  version integer not null default 1 check (version between 1 and 2147483647),
  updated_at timestamptz not null default now(),
  constraint poke_cloud_data_safe check ((
    jsonb_typeof(data) = 'object'
    and data->>'version' = '3'
    and jsonb_typeof(data->'games') = 'object'
    and octet_length(data::text) <= 800000
  ) is true)
);
alter table public.poke_cloud_collections enable row level security;
revoke all on public.poke_cloud_collections from public, anon, authenticated;
grant select, insert, update, delete on public.poke_cloud_collections to authenticated;

drop policy if exists "poke_cloud_owner_select" on public.poke_cloud_collections;
create policy "poke_cloud_owner_select"
on public.poke_cloud_collections for select to authenticated
using (user_id = (select auth.uid()));
drop policy if exists "poke_cloud_owner_insert" on public.poke_cloud_collections;
create policy "poke_cloud_owner_insert"
on public.poke_cloud_collections for insert to authenticated
with check (user_id = (select auth.uid()));
drop policy if exists "poke_cloud_owner_update" on public.poke_cloud_collections;
create policy "poke_cloud_owner_update"
on public.poke_cloud_collections for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));
drop policy if exists "poke_cloud_owner_delete" on public.poke_cloud_collections;
create policy "poke_cloud_owner_delete"
on public.poke_cloud_collections for delete to authenticated
using (user_id = (select auth.uid()));

create table if not exists public.poke_discord_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  discord_id text not null unique,
  display_name text not null check (char_length(display_name) between 1 and 80),
  username text not null check (char_length(username) between 1 and 80),
  avatar_url text,
  banner_url text,
  accent_color text,
  public_progress jsonb not null default '{"v":1,"rows":[]}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint poke_profile_discord_id_valid check (discord_id ~ '^[0-9]{16,22}$'),
  constraint poke_profile_public_summary_valid check ((
    jsonb_typeof(public_progress) = 'object'
    and public_progress->>'v' = '1'
    and jsonb_typeof(public_progress->'rows') = 'array'
    and jsonb_array_length(public_progress->'rows') <= 100
    and octet_length(public_progress::text) <= 25000
  ) is true)
);
alter table public.poke_discord_profiles enable row level security;
revoke all on public.poke_discord_profiles from public, anon, authenticated;
-- Les données du profil ne sont insérées que par la fonction vérifiant l'identité Discord.
grant select on public.poke_discord_profiles to authenticated;
grant update(public_progress) on public.poke_discord_profiles to authenticated;

drop policy if exists "poke_profile_owner_select" on public.poke_discord_profiles;
create policy "poke_profile_owner_select"
on public.poke_discord_profiles for select to authenticated
using (user_id = (select auth.uid()));
drop policy if exists "poke_profile_owner_update" on public.poke_discord_profiles;
create policy "poke_profile_owner_update"
on public.poke_discord_profiles for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create or replace function public.poke_v4_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
revoke all on function public.poke_v4_updated_at() from public, anon, authenticated;

drop trigger if exists poke_cloud_updated_at on public.poke_cloud_collections;
create trigger poke_cloud_updated_at before update on public.poke_cloud_collections
for each row execute function public.poke_v4_updated_at();
drop trigger if exists poke_profiles_updated_at on public.poke_discord_profiles;
create trigger poke_profiles_updated_at before update on public.poke_discord_profiles
for each row execute function public.poke_v4_updated_at();

-- L'ID Discord provient de auth.identities et NON d'une valeur fournie par le navigateur.
-- Le navigateur obtient noms / images par le scope "identify"; ils restent non sensibles
-- et ne doivent jamais servir à attribuer des privilèges.
create or replace function public.upsert_poke_discord_profile(
  p_display_name text, p_username text, p_avatar_url text default null,
  p_banner_url text default null, p_accent_color text default null
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  owner_uuid uuid := auth.uid();
  verified_discord_id text;
begin
  if owner_uuid is null then
    raise exception 'Connexion nécessaire';
  end if;
  select i.provider_id into verified_discord_id
  from auth.identities i
  where i.user_id = owner_uuid and i.provider = 'discord'
  order by i.created_at desc limit 1;
  if verified_discord_id is null then
    raise exception 'Connexion Discord requise';
  end if;
  if length(trim(coalesce(p_display_name,''))) not between 1 and 80
    or length(trim(coalesce(p_username,''))) not between 1 and 80 then
    raise exception 'Pseudo Discord invalide';
  end if;
  -- Les images de profil doivent correspondre à l'ID Discord vérifié,
  -- et non à l'ID d'un autre utilisateur.
  if p_avatar_url is not null and p_avatar_url !~
     ('^https://cdn\.discordapp\.com/(avatars/' || verified_discord_id ||
      '/[A-Za-z0-9_]+|embed/avatars/[0-9]+)\.(png|webp|gif)
  if p_accent_color is not null and p_accent_color !~ '^#[0-9A-Fa-f]{6}$' then
    raise exception 'Couleur Discord invalide';
  end if;

  insert into public.poke_discord_profiles
    (user_id, discord_id, display_name, username, avatar_url, banner_url, accent_color)
  values (owner_uuid, verified_discord_id, trim(p_display_name), trim(p_username),
          p_avatar_url, p_banner_url, p_accent_color)
  on conflict (user_id) do update
  set discord_id = excluded.discord_id,
      display_name = excluded.display_name,
      username = excluded.username,
      avatar_url = coalesce(excluded.avatar_url, poke_discord_profiles.avatar_url),
      banner_url = coalesce(excluded.banner_url, poke_discord_profiles.banner_url),
      accent_color = coalesce(excluded.accent_color, poke_discord_profiles.accent_color);
  return owner_uuid;
end;
$$;
revoke all on function public.upsert_poke_discord_profile(text,text,text,text,text)
from public, anon, authenticated;
grant execute on function public.upsert_poke_discord_profile(text,text,text,text,text)
to authenticated;

-- Une vitrine est consultable par son UUID seulement : aucune liste publique ni
-- aucun accès à la table des sauvegardes privées.
create or replace function public.get_poke_discord_profile(p_user_id uuid)
returns table (
  user_id uuid, discord_id text, display_name text, username text,
  avatar_url text, banner_url text, accent_color text,
  public_progress jsonb, updated_at timestamptz
)
language sql stable security definer set search_path = '' as $$
  select p.user_id, p.discord_id, p.display_name, p.username,
         p.avatar_url, p.banner_url, p.accent_color,
         p.public_progress, p.updated_at
  from public.poke_discord_profiles p
  where p.user_id = p_user_id
  limit 1;
$$;
revoke all on function public.get_poke_discord_profile(uuid)
from public, anon, authenticated;
grant execute on function public.get_poke_discord_profile(uuid) to anon, authenticated;

-- Contrôles avant fusion :
-- 1. Un invité NE peut pas lire poke_cloud_collections ni poke_discord_profiles.
-- 2. Deux comptes Discord différents ne peuvent pas modifier les données d'autrui.
-- 3. Un lecteur anonyme peut invoquer get_poke_discord_profile(uuid).
-- 4. Un compte anonyme sans identité Discord ne peut pas créer un profil.
-- 5. La clé sb_secret / service_role ne doit JAMAIS être dans les fichiers GitHub.
) then
    raise exception 'Avatar Discord invalide';
  end if;
  if p_banner_url is not null and p_banner_url !~
     ('^https://cdn\.discordapp\.com/banners/' || verified_discord_id ||
      '/[A-Za-z0-9_]+\.(png|webp|gif)
  if p_accent_color is not null and p_accent_color !~ '^#[0-9A-Fa-f]{6}$' then
    raise exception 'Couleur Discord invalide';
  end if;

  insert into public.poke_discord_profiles
    (user_id, discord_id, display_name, username, avatar_url, banner_url, accent_color)
  values (owner_uuid, verified_discord_id, trim(p_display_name), trim(p_username),
          p_avatar_url, p_banner_url, p_accent_color)
  on conflict (user_id) do update
  set discord_id = excluded.discord_id,
      display_name = excluded.display_name,
      username = excluded.username,
      avatar_url = coalesce(excluded.avatar_url, poke_discord_profiles.avatar_url),
      banner_url = coalesce(excluded.banner_url, poke_discord_profiles.banner_url),
      accent_color = coalesce(excluded.accent_color, poke_discord_profiles.accent_color);
  return owner_uuid;
end;
$$;
revoke all on function public.upsert_poke_discord_profile(text,text,text,text,text)
from public, anon, authenticated;
grant execute on function public.upsert_poke_discord_profile(text,text,text,text,text)
to authenticated;

-- Une vitrine est consultable par son UUID seulement : aucune liste publique ni
-- aucun accès à la table des sauvegardes privées.
create or replace function public.get_poke_discord_profile(p_user_id uuid)
returns table (
  user_id uuid, discord_id text, display_name text, username text,
  avatar_url text, banner_url text, accent_color text,
  public_progress jsonb, updated_at timestamptz
)
language sql stable security definer set search_path = '' as $$
  select p.user_id, p.discord_id, p.display_name, p.username,
         p.avatar_url, p.banner_url, p.accent_color,
         p.public_progress, p.updated_at
  from public.poke_discord_profiles p
  where p.user_id = p_user_id
  limit 1;
$$;
revoke all on function public.get_poke_discord_profile(uuid)
from public, anon, authenticated;
grant execute on function public.get_poke_discord_profile(uuid) to anon, authenticated;

-- Contrôles avant fusion :
-- 1. Un invité NE peut pas lire poke_cloud_collections ni poke_discord_profiles.
-- 2. Deux comptes Discord différents ne peuvent pas modifier les données d'autrui.
-- 3. Un lecteur anonyme peut invoquer get_poke_discord_profile(uuid).
-- 4. Un compte anonyme sans identité Discord ne peut pas créer un profil.
-- 5. La clé sb_secret / service_role ne doit JAMAIS être dans les fichiers GitHub.
) then
    raise exception 'Bannière Discord invalide';
  end if;
  if p_accent_color is not null and p_accent_color !~ '^#[0-9A-Fa-f]{6}$' then
    raise exception 'Couleur Discord invalide';
  end if;

  insert into public.poke_discord_profiles
    (user_id, discord_id, display_name, username, avatar_url, banner_url, accent_color)
  values (owner_uuid, verified_discord_id, trim(p_display_name), trim(p_username),
          p_avatar_url, p_banner_url, p_accent_color)
  on conflict (user_id) do update
  set discord_id = excluded.discord_id,
      display_name = excluded.display_name,
      username = excluded.username,
      avatar_url = coalesce(excluded.avatar_url, poke_discord_profiles.avatar_url),
      banner_url = coalesce(excluded.banner_url, poke_discord_profiles.banner_url),
      accent_color = coalesce(excluded.accent_color, poke_discord_profiles.accent_color);
  return owner_uuid;
end;
$$;
revoke all on function public.upsert_poke_discord_profile(text,text,text,text,text)
from public, anon, authenticated;
grant execute on function public.upsert_poke_discord_profile(text,text,text,text,text)
to authenticated;

-- Une vitrine est consultable par son UUID seulement : aucune liste publique ni
-- aucun accès à la table des sauvegardes privées.
create or replace function public.get_poke_discord_profile(p_user_id uuid)
returns table (
  user_id uuid, discord_id text, display_name text, username text,
  avatar_url text, banner_url text, accent_color text,
  public_progress jsonb, updated_at timestamptz
)
language sql stable security definer set search_path = '' as $$
  select p.user_id, p.discord_id, p.display_name, p.username,
         p.avatar_url, p.banner_url, p.accent_color,
         p.public_progress, p.updated_at
  from public.poke_discord_profiles p
  where p.user_id = p_user_id
  limit 1;
$$;
revoke all on function public.get_poke_discord_profile(uuid)
from public, anon, authenticated;
grant execute on function public.get_poke_discord_profile(uuid) to anon, authenticated;

-- Contrôles avant fusion :
-- 1. Un invité NE peut pas lire poke_cloud_collections ni poke_discord_profiles.
-- 2. Deux comptes Discord différents ne peuvent pas modifier les données d'autrui.
-- 3. Un lecteur anonyme peut invoquer get_poke_discord_profile(uuid).
-- 4. Un compte anonyme sans identité Discord ne peut pas créer un profil.
-- 5. La clé sb_secret / service_role ne doit JAMAIS être dans les fichiers GitHub.
