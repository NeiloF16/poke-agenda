# Poké Agenda V4.1 — architecture et maintenance

Cette étape réorganise les fichiers **sans migration des données** et sans modifier les URL publiques, les noms de sauvegardes ni le fonctionnement Supabase / OAuth Discord.

## Architecture

| Zone | Fichier(s) | Rôle |
| --- | --- | --- |
| Bibliothèque | `index.html` | Structure HTML, accessibilité et composants de page |
| Présentation bibliothèque | `assets/calendar/calendar.css` | Mise en page, couleurs, responsive, zoom |
| Données bibliothèque | `catalogue.json` | **Source canonique** des 23 jeux, 90 guides et couvertures |
| Snapshot bibliothèque | `assets/calendar/games.js` | **Généré** depuis le JSON ; chargement immédiat, hors connexion |
| Comportement bibliothèque | `assets/calendar/app.js` | Calendrier, navigation, favoris, notes, visualiseur, contrôle des mises à jour |
| Suivi collection | `suivi.html` + `assets/tracker/tracker.css` | Structure et présentation du suivi |
| Données Pokémon | `assets/tracker/dex-data.js` | Snapshot sous licence des noms français et Dex historiques (PokéAPI CSV) |
| Règles des jeux | `assets/tracker/game-rules.js` | Liste des versions, Pokédex disponibles, objectifs / Post Game |
| Suivi interactif | `assets/tracker/tracker.js` | Coche des espèces, objectifs, vitrine et import / export JSON |
| Identité et sauvegarde | `assets/tracker/cloud.js` | Discord OAuth, Supabase, synchronisation et contrôle des conflits |
| Anciennes vitrines V3 | `assets/tracker/live.js` | Lecture des liens V3 existants, conservée pour compatibilité |
| Supabase public | `assets/tracker/supabase-config.js` | URL projet et **publishable key**, pas de secret |
| Migrations SQL | `supabase/migrations/` | Tables, RPC et politiques RLS |

### Mettre à jour un jeu ou un guide

1. Modifier `catalogue.json` (label, page, titre, image dans `assets/pages/` ou `assets/covers/`).
2. Régénérer la version statique : `node scripts/build-calendar-data.mjs` (Node 22 recommandé).
3. Vérifier le résultat : `node scripts/build-calendar-data.mjs --check`.
4. Soumettre les deux fichiers (`catalogue.json` et `assets/calendar/games.js`) dans le même commit.

Une valeur `?v=...` après la couverture peut forcer le renouvellement du cache sans changer le fichier d'image.

### Modifier les Pokémon ou les objectifs d'un jeu

- La correspondance version ↔ Pokédex et les objectifs (histoire / Post Game / défis) résident dans `assets/tracker/game-rules.js`.
- Les noms français et les Dex statiques résident dans `assets/tracker/dex-data.js`.
- Les identifiants internes des objectifs, jeux, versions et Pokémon **ne doivent pas être renumérotés** : des sauvegardes V3/V4 les utilisent déjà.
- Le moteur de sauvegarde ne doit pas être modifié pour une simple reformulation d'objectif.

### Pourquoi pas une requête PokéAPI sur chaque page ?

Les Pokémon de chaque jeu constituent des listes historiques stables : pour Rouge Feu, Platine, etc., une nouvelle génération ne change pas le Pokédex du jeu. Un snapshot local facilite l'affichage instantané, l'utilisation hors ligne et la préservation des sauvegardes. PokéAPI est une référence en amont pour **mettre à jour le snapshot**, pas une condition réseau lors de chaque affichage.

Les icônes Pokémon viennent déjà de PokéAPI Sprites. Elles sont demandées à l'affichage, avec une image alternative si le sprite choisi est absent.

### Sécurité et confidentialité

- Le HTML / JavaScript du site GitHub Pages est public.
- Les sauvegardes complètes vivent dans `poke_cloud_collections` avec RLS propriétaire dans Supabase.
- La vitrine n'expose que le profil Discord public et des jauges résumées.
- Le `Client Secret` Discord et les clés `sb_secret_` / `service_role` **ne doivent jamais être intégrés au dépôt**.
- L'export JSON reste le secours recommandé lors des changements d'appareil.

### Vérifier avant publication

```bash
node scripts/build-calendar-data.mjs --check
node --test tests/architecture.test.mjs
```

Ces commandes utilisent uniquement Node standard. La vérification GitHub Actions reprend ces deux commandes pour chaque pull request vers `main`.

Les tests automatisés vérifient la structure et la cohérence statique. Ils ne remplacent pas un test manuel des parcours utilisateurs : jeu → sauvegarde → cases → connexion Discord → synchronisation → vitrine sur un autre navigateur.

### Compatibilité

- Aucune migration SQL.
- Les clés `localStorage` existantes ne changent pas.
- Les liens `suivi.html?profil=...`, `?live=...` et les liens instantanés restent identiques.
- Le site reste hébergé sous `/poke-agenda/` sur GitHub Pages.
- Les noms et fichiers de bannières/affiches ne sont pas modifiés.
