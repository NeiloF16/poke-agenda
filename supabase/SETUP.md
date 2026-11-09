# Poké-Agenda — Activer les vitrines permanentes

## État

Le **code du site est préparé** : une fois le projet Supabase configuré, le bouton « Activer ma vitrine permanente » publiera un lien de la forme `https://neilof16.github.io/poke-agenda/suivi.html?live=<UUID>`.

**Ne pas présenter cette fonctionnalité comme active tant que le déploiement SQL et les tests de sécurité ne sont pas terminés.** Le lien instantané `#v1=...` reste disponible sans serveur.

## Principe

- L'utilisateur choisit explicitement de publier. À cet instant, Supabase crée une session **anonyme** dans son navigateur. Il ne saisit aucun pseudo, mot de passe ni email.
- Une seule vitrine par session anonyme, avec un identifiant UUID stable. Le lien est permanent.
- Chaque modification du suivi local provoque (après ~1,4 seconde) la **synchronisation des statistiques publiques seulement** : jeu, nom de la partie, nombre d'espèces possédées du Dex régional et pourcentage d'objectifs.
- Les favoris, notes, Pokémon exacts cochés et contenus des sauvegardes **ne sont jamais envoyés** à la vitrine publique.
- Un visiteur qui connaît le lien voit la progression avec une vérification à l'ouverture puis toutes les **45 secondes** si la page reste ouverte. Il ne peut rien modifier.
- Le propriétaire peut **supprimer sa vitrine** sans perdre son suivi local.
- Le bouton « Lien instantané » reste disponible lorsque Supabase est indisponible.

## Mise en service (à faire une fois)

1. Créer un projet sur https://supabase.com.
2. Dans **Authentication > Providers / Sign In**, activer **Anonymous Sign-Ins**. Configurer la protection CAPTCHA et les limites contre la création massive de sessions anonymes (recommandé avant ouverture à tous).
3. Dans **SQL Editor**, exécuter le fichier `supabase/migrations/20261109_live_showcases.sql`.
4. Dans le tableau de bord du projet, récupérer **Project URL** et la **publishable key** (ou ancienne clé `anon`). **NE JAMAIS exposer `service_role`, `sb_secret_*` ou le mot de passe de la base.**
5. Éditer `assets/tracker/supabase-config.js` :
   ```js
   window.POKE_SUPABASE_CONFIG = {
     url: "https://VOTRE-PROJET.supabase.co",
     publishableKey: "sb_publishable_VOTRE_CLE"
   };
   ```
   La publishable key est conçue pour être publique. L'accès aux données est limité par RLS.
6. Publier le fichier de configuration sur la branche `main` et confirmer la fin du déploiement GitHub Pages.
7. **Tests obligatoires avant communication publique :**
   - Créer une vitrine depuis un navigateur A sans être connecté à un compte.
   - Cocher un Pokémon dans A. Depuis un navigateur B, ouvrir **le même lien** et constater le nouveau pourcentage (rafraîchissement ou moins de 45 s).
   - Vérifier que B n'a aucun contrôle d'édition et que le tableau `poke_showcases` n'est pas listable avec la clé publique.
   - Dans une seconde session anonyme, tenter de modifier le premier UUID via l'API : RLS doit le bloquer.
   - Supprimer la vitrine dans A : l'URL publique doit cesser de fonctionner, sans supprimer le Pokédex local.
   - Tester la coupure Internet : les coches locales doivent continuer à fonctionner ; la synchro reprend après reconnexion.
   - Vérifier le comportement mobile et la conservation du lien après fermeture puis réouverture du navigateur.

## Confidentialité / limitations importantes

- L'authentification anonyme est **liée à ce navigateur**. Si la personne efface ses données, se déconnecte ou change d'appareil, elle peut **perdre définitivement le contrôle de son ancienne vitrine**, même si elle possède une sauvegarde JSON de son Pokédex. Elle pourra en créer une nouvelle avec une nouvelle adresse, mais ne pourra pas modifier/supprimer l'ancienne sans retrouver la session. Proposer une authentification récupérable serait un projet distinct.
- Les noms des sauvegardes et les pourcentages sont visibles par **toute personne ayant le lien**. Utiliser des noms non sensibles.
- Seules les **statistiques publiques** sont synchronisées. Les données de suivi détaillées restent dans `localStorage` : continuer les exports JSON réguliers.
- Les sessions anonymes et appels API consomment les ressources de la formule Supabase. Vérifier les limites gratuites et prévoir une protection anti-abus.
- Les utilisateurs peuvent créer/supprimer leur vitrine, mais un partage envoyé précédemment peut être conservé sous forme de capture d'écran par un destinataire.

## Principes de sécurité

Le tableau `poke_showcases` autorise `SELECT/INSERT/UPDATE/DELETE` uniquement au rôle `authenticated`, avec politiques RLS contrôlant `auth.uid()`. Supabase Auth anonyme prend le rôle PostgreSQL `authenticated` et ne connaît pas la session d'autres utilisateurs.

La fonction `public.get_poke_showcase(UUID)` (SECURITY DEFINER) expose **uniquement les données de l'UUID demandé**. Le rôle `anon` n'a aucun droit de `SELECT` direct sur la table : il n'est pas possible d'énumérer le contenu en demandant toute la collection. Il reste nécessaire de tester les politiques sur le vrai projet.

## Références officielles

- https://supabase.com/docs/guides/auth/auth-anonymous
- https://supabase.com/docs/reference/javascript/auth-signinanonymously
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/reference/javascript/installing
