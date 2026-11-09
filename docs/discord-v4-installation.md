# Poké Agenda V4 — Discord + Cloud

La V4 est préparée sur la branche `feat/discord-cloud-v4`, sans toucher au site actuellement publié par GitHub Pages (`main`).

## 1. Créer l'application Discord

1. Ouvrir https://discord.com/developers/applications et créer **Poké Agenda**.
2. Dans **OAuth2 → Redirects**, ajouter exactement :
   `https://seqqgmznfbthwewtffxv.supabase.co/auth/v1/callback`
3. Enregistrer, puis copier **Client ID** et **Client Secret**.
4. **Ne publier le Client Secret nulle part** : il va exclusivement dans Supabase.

Le site ne demande que le scope Discord **identify** (pseudo, avatar, bannière si disponible). Aucune permission de bot, accès serveur ou lecture des messages n'est nécessaire.

## 2. Configurer Supabase

1. Dans le projet Supabase existant, ouvrir **Authentication → Sign In / Providers → Discord**.
2. Activer le fournisseur, coller **Client ID** et **Client Secret**, enregistrer.
3. Dans **Authentication → URL Configuration**, mettre :
   - Site URL : `https://neilof16.github.io/poke-agenda/`
   - Redirect URLs : `https://neilof16.github.io/poke-agenda/suivi.html`
4. Dans **SQL Editor**, exécuter **toute** la migration :
   `supabase/migrations/20261109_discord_cloud_v4.sql`.

Ne pas supprimer l'ancienne migration `20261109_live_showcases.sql` ni la table V3 : les anciennes vitrines `?live=...` continuent d'être consultables. La V4 utilise des tables séparées.

## 3. Ce qui change

- Connexion Discord sans mot de passe Poké Agenda.
- Les **sauvegardes complètes** (espèces cochées, objectifs, parties, noms de sauvegardes) sont stockées dans `poke_cloud_collections` avec **RLS propriétaire**.
- Les **éléments publics** (pseudo, avatar, bannière Discord, jauges résumées) sont stockés séparément dans `poke_discord_profiles`.
- Vitrine partageable au format `suivi.html?profil=<uuid>` (lecture seule et sans compte).
- Bouton du serveur communautaire : https://discord.gg/4FX9PDmYzG
- L'export/import JSON reste disponible. Une copie locale est conservée pour les périodes hors connexion.
- Pour éviter les écrasements entre appareils, la collection possède un compteur de version : un conflit **bloque** la sauvegarde cloud au lieu de remplacer silencieusement l'autre version.

### Première connexion

Si une progression locale existe et qu'aucune collection cloud n'existe encore, le site propose de l'importer. Sinon, il démarre avec une collection vide. Une copie locale d'avant transition est conservée dans le navigateur quand elle contient une progression ; il reste recommandé de télécharger un export JSON.

### Notes de confidentialité

- Les noms des parties, chiffres de Pokédex et % d'objectifs **sont publics** sur la vitrine.
- Les listes détaillées de Pokémon, cases individuelles et objectifs personnalisés restent **privés** dans la table cloud.
- Le profil ne publie ni adresse e-mail, ni jeton OAuth, ni identifiant de session.
- Supabase requiert une **publishable key publique** dans le JavaScript. Aucune clé `service_role` / `sb_secret` ne doit y figurer.
- Le navigateur reçoit un jeton Discord temporaire pendant le retour OAuth pour demander le profil `/users/@me`. Il n'est pas ajouté aux vitrines ni au JSON exporté.
- Les noms et images issus du navigateur sont décoratifs : seul l'identifiant Discord provenant de `auth.identities` est vérifié côté serveur. Ils ne doivent pas être traités comme une preuve indépendante d'identité.

## 4. Vérifications avant ouverture

- [ ] La migration SQL s'exécute sans erreur.
- [ ] La connexion Discord redirige sur `suivi.html` et le pseudo apparaît.
- [ ] Cocher un Pokémon → attendre le statut **synchronisé**.
- [ ] Ouvrir le profil `?profil=...` en navigation privée : avatar, bannière (si présente), jauges et invitation Discord.
- [ ] Se connecter sur un autre navigateur avec le **même Discord** : toutes les sauvegardes reviennent.
- [ ] Modifier deux navigateurs **avant de synchroniser** : la protection de version empêche l'écrasement.
- [ ] Vérifier que la lecture REST directe des tables privées sans session est refusée.
- [ ] Vérifier qu'un autre utilisateur Discord ne peut pas modifier les données du premier.
- [ ] Vérifier l'affichage et les performances sur mobile.
- [ ] Conserver un export JSON avant une migration importante.

## 5. Fusion et mise en ligne

Quand les étapes Supabase et Discord sont prêtes et que les tests sont concluants, fusionner la branche V4 vers `main` afin que GitHub Pages publie les nouveaux fichiers. **Ne pas fusionner avant l'exécution de la migration SQL**, faute de quoi la partie cloud affichera un message d'erreur.

## Ressources

- https://supabase.com/docs/guides/auth/social-sign-in/auth-discord
- https://supabase.com/docs/guides/auth/redirect-urls
- https://discord.com/developers/docs/resources/user
