-- Poké-Agenda V3 : schéma préparatoire pour la phase sociale.
-- Non déployé : à appliquer uniquement APRÈS configuration de Clerk
-- comme fournisseur d'authentification tiers sur Supabase.
-- Ne jamais exposer de clé service_role au navigateur.

create table if not exists public.poke_profiles (
 user_id text primary key,
 username text not null check (username ~ '^[a-zA-Z0-9_]{4,32}$'),
 bio text not null default '' check (char_length(bio) <= 240),
 is_public boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create unique index if not exists poke_profiles_username_ci on public.poke_profiles (lower(username));

create table if not exists public.poke_saves (
 id uuid primary key default gen_random_uuid(),
 user_id text not null references public.poke_profiles(user_id) on delete cascade,
 game_id integer not null check (game_id between 1 and 22),
 version text not null check (char_length(version) <= 60),
 label text not null check (char_length(label) <= 80),
 owned integer[] not null default '{}',
 objectives jsonb not null default '{}'::jsonb,
 custom_goals jsonb not null default '[]'::jsonb,
 updated_at timestamptz not null default now()
);
create index if not exists poke_saves_owner on public.poke_saves(user_id);

create table if not exists public.poke_follows (
 follower_id text not null references public.poke_profiles(user_id) on delete cascade,
 following_id text not null references public.poke_profiles(user_id) on delete cascade,
 status text not null default 'pending' check (status in ('pending','accepted')),
 created_at timestamptz not null default now(),
 primary key (follower_id, following_id),
 check (follower_id <> following_id)
);
create index if not exists poke_follows_target on public.poke_follows(following_id,status);

alter table public.poke_profiles enable row level security;
alter table public.poke_saves enable row level security;
alter table public.poke_follows enable row level security;

-- On laisse chacun voir les profils publics, ses propres données
-- et celles des personnes qui l'ont autorisé à les suivre.
create policy "Profils visibles selon choix du membre"
 on public.poke_profiles for select to authenticated
 using (
  is_public
  or user_id = (select auth.jwt()->>'sub')
  or exists (
   select 1 from public.poke_follows f
   where f.following_id = poke_profiles.user_id
     and f.follower_id = (select auth.jwt()->>'sub')
     and f.status = 'accepted'
  )
 );
create policy "Creer son profil" on public.poke_profiles
 for insert to authenticated with check (user_id = (select auth.jwt()->>'sub'));
create policy "Modifier son profil" on public.poke_profiles
 for update to authenticated
 using (user_id = (select auth.jwt()->>'sub'))
 with check (user_id = (select auth.jwt()->>'sub'));
create policy "Supprimer son profil" on public.poke_profiles
 for delete to authenticated using (user_id = (select auth.jwt()->>'sub'));

-- Progression privée tant que le profil n'est pas public / suivi accepté.
create policy "Voir ses sauvegardes ou celles autorisees"
 on public.poke_saves for select to authenticated
 using (
  user_id = (select auth.jwt()->>'sub')
  or exists (
    select 1 from public.poke_profiles p
    where p.user_id = poke_saves.user_id
      and (p.is_public or exists (
          select 1 from public.poke_follows f
          where f.following_id = poke_saves.user_id
            and f.follower_id = (select auth.jwt()->>'sub')
            and f.status = 'accepted'
      ))
  )
 );
create policy "Creer ses sauvegardes" on public.poke_saves
 for insert to authenticated with check(user_id = (select auth.jwt()->>'sub'));
create policy "Modifier ses sauvegardes" on public.poke_saves
 for update to authenticated using(user_id = (select auth.jwt()->>'sub'))
 with check(user_id = (select auth.jwt()->>'sub'));
create policy "Supprimer ses sauvegardes" on public.poke_saves
 for delete to authenticated using(user_id = (select auth.jwt()->>'sub'));

create policy "Voir demandes recues et envoyees" on public.poke_follows
 for select to authenticated
 using (follower_id = (select auth.jwt()->>'sub') or following_id = (select auth.jwt()->>'sub'));
create policy "Demander a suivre" on public.poke_follows
 for insert to authenticated
 with check(follower_id = (select auth.jwt()->>'sub') and status='pending');
create policy "Accepter ou refuser demande" on public.poke_follows
 for update to authenticated
 using (following_id = (select auth.jwt()->>'sub'))
 with check (following_id = (select auth.jwt()->>'sub') and status='accepted');
create policy "Retirer ou refuser suivi" on public.poke_follows
 for delete to authenticated
 using (follower_id = (select auth.jwt()->>'sub') or following_id = (select auth.jwt()->>'sub'));

-- TODO avant mise en service : tests RLS avec deux comptes, gestion des doublons,
-- suppression du compte Clerk et nettoyage des données, anti-spam et limites de débit.
