# Poké Agenda — où modifier les textes ?

Guide pratique pour modifier les textes directement depuis le site GitHub, sans toucher à Discord ou Supabase.

## Les deux grandes pages

| Ce que tu veux changer | Fichier à modifier |
| --- | --- |
| **Accueil, barre de navigation et structure du calendrier** | `index.html` |
| Textes générés automatiquement sur l'accueil, « Voir la fiche », filtres, calendrier, favoris, boutons, messages | `assets/calendar/app.js` |
| **Noms des jeux**, générations, sous-titres des cartes, régions et titres des pages des guides | `catalogue.json` |
| **Présentation du suivi**, gros titre « Ta collection Pokémon, en vitrine », texte de présentation, bas de page | `suivi.html` |
| **Textes dynamiques du suivi**, boutons, « Post Game et défis », jauges, messages de la vitrine et profil public | `assets/tracker/tracker.js` |
| **Objectifs par jeu**, scénarios, défis Post Game, versions et Pokédex | `assets/tracker/game-rules.js` |
| Connexion Discord et messages techniques de synchronisation | `assets/tracker/cloud.js` |
| Anciennes vitrines V3, messages techniques de partage | `assets/tracker/live.js` |

## Les fichiers de présentation

| Visuel à modifier | Fichier |
| --- | --- |
| Couleurs, mise en page de l'accueil et des guides | `assets/calendar/calendar.css` |
| Couleurs, taille et disposition du suivi, cartes et profil Discord | `assets/tracker/tracker.css` |
| Couvertures et bannières des jeux | `assets/covers/` |
| Les **90 guides illustrés** | `assets/pages/` |
| Noms français des Pokémon et index des Pokédex | `assets/tracker/dex-data.js` (snapshot issu de PokéAPI, **à ne pas modifier à la légère**) |

Les phrases qui sont **dessinées dans les images PNG** des guides ne sont pas des textes HTML : il faut modifier l'image correspondante dans `assets/pages/`.

## Attention aux données générées

`assets/calendar/games.js` est **généré** à partir de `catalogue.json`. Modifier uniquement `catalogue.json` **ne change pas immédiatement le site** : il faut régénérer `games.js` avec `node scripts/build-calendar-data.mjs`. Une autre personne peut le faire lors de la revue d'une pull request.

Ne modifie pas directement `assets/calendar/games.js`, car une génération suivante écraserait tes changements.

Pour le suivi, en revanche, une correction du libellé d'un objectif dans `assets/tracker/game-rules.js` est immédiatement prise en compte par le site, sans toucher au moteur de suivi. **Ne change pas l'ordre des objectifs** ou les identifiants : les cases cochées existantes utilisent leurs positions.

## Modifier directement sur GitHub

1. Ouvre le dépôt : https://github.com/NeiloF16/poke-agenda
2. Va dans le fichier souhaité.
3. Clique sur l'icône **crayon** (Edit this file).
4. Recherche le texte à remplacer avec `Ctrl + F` dans le navigateur ou `Ctrl + H` dans l'éditeur selon le mode.
5. Remplace uniquement les mots visibles, **sans supprimer les apostrophes, guillemets, accents, symboles de code ou balises HTML**.
6. Enregistre avec **Commit changes**.
7. Vérifie que l'action GitHub Pages se termine en vert, puis recharge la page (`Ctrl + F5`).

Si tu changes un JavaScript déjà chargé auparavant, une mise à jour du paramètre de version dans `index.html` ou `suivi.html` (ex. `?v=4.1.2`) peut aider à rafraîchir le cache des visiteurs.

## Exemples concrets

- Remplacer « Post Game et défis » → `assets/tracker/tracker.js`.
- Renommer un objectif de Pokémon HeartGold → `assets/tracker/game-rules.js`.
- Remplacer le sous-titre d'un jeu dans la bibliothèque → `catalogue.json`, puis régénérer `assets/calendar/games.js`.
- Changer « Rejoins le Discord Poké Agenda ! » sur la **vitrine publique** → `assets/tracker/tracker.js`.
- Changer le texte du pied de page du suivi → `suivi.html`.
- Changer l'invitation Discord → elle apparaît dans `suivi.html` **et** `assets/tracker/tracker.js`.

**Ne publie jamais de mot de passe, de clé secrète Discord ou de clé `sb_secret_` dans GitHub.**

Pour les modifications plus complexes, ouvre une pull request plutôt que de modifier directement `main` : les tests et la prévisualisation sont plus faciles à contrôler.
