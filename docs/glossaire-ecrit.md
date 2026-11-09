# Poké Agenda — glossaire écrit (édition du 9 novembre 2026)

Le calendrier utilise désormais **23 glossaires écrits**, un par jeu ou duo de la bibliothèque, et **153 entrées éditoriales** initiales. Le suivi reste séparé en 38 versions, avec ses propres sauvegardes et bannières. L'objectif est un **catalogue vivant d'activités et d'événements historiques**, pas une liste trompeuse de Cadeaux Mystère supposément actifs.

## Parcours du joueur

- Depuis `index.html` : une carte ouvre `jeu.html?game=14` (par exemple Rubis Oméga / Saphir Alpha).
- Chaque page contient des chapitres indépendants : **Activités régulières**, **Échanges & Pokémon spéciaux**, **Distributions & événements datés**, **Secrets, connexions & Post Game**.
- Recherche textuelle au sein du jeu, sources consultables et mentions de disponibilité/région.
- Les anciennes fiches PNG (90 images) ont été **conservées intégralement dans Git**, sur la branche [archive/fiches-png-avant-allegement-20261109](https://github.com/NeiloF16/poke-agenda/tree/archive/fiches-png-avant-allegement-20261109/assets/pages). Elles ne sont plus expédiées à GitHub Pages pour éviter une archive de déploiement disproportionnée. Les glossaires écrits restent le guide principal. Le catalogue conserve leur liste comme historique éditorial.
- Les boutons du suivi continuent de distinguer les versions, par exemple `suivi.html?game=14&version=Rubis%20Om%C3%A9ga`.
- Favoris, marquage « consulté aujourd'hui » et notes conservent les mêmes clés de `localStorage` qu'avant.

## Modifier les textes

| Élément | Fichier |
| --- | --- |
| Tous les faits, descriptions, sources, conditions des 23 jeux | `assets/glossary/data.js` |
| Mise en page de la fiche écrite et couleurs | `assets/glossary/style.css` |
| Boutons, filtres, recherche, lecture et liens de la fiche | `assets/glossary/app.js` |
| Structure HTML de la fiche | `jeu.html` |
| Vitrine générale, menus, cartes et agenda | `assets/calendar/app.js` et `index.html` |
| Noms, générations et couvertures | `catalogue.json` puis générer `assets/calendar/games.js` |
| Suivi Pokédex et sauvegardes Discord | `assets/tracker/` — inchangé |

### Ajouter une entrée dans data.js

Le fichier contient `window.POKE_GLOSSARY` au format JSON : `games["14"].entries` correspond à ROSA, `games["8"].entries` à Diamant/Perle.

Chaque entrée a ces champs :

- `type` : `routines`, `echanges`, `distributions` ou `secrets` ;
- `name` : titre affiché ;
- `description` : texte rédigé, qui explique **quoi, comment, où et/ou pourquoi**, sans promettre une obtention impossible ;
- `when` : heure, périodicité, période de distribution ou mention « Historique » ;
- `source` : clé de la liste `references` au début du fichier ;
- `scope` : éventuellement région, langue, matériel ou version.

Chaque source doit être une adresse fiable, idéalement un guide vérifié ou une annonce officielle. Le lien sera proposé à côté de l'entrée.

Le calendrier utilise les entrées `routines` : un événement à jour fixe est affiché selon `when`, une activité quotidienne peut apparaître dans la sélection du jour. Évite d'inventer une date ou une disponibilité.

## Politique éditoriale

1. Toujours distinguer « disponible en jouant normalement », « obtenable par connexion matérielle historique », « distribution officielle terminée » et « service arrêté ».
2. Identifier la **langue, la région, la version, le DO/ID, les dates et les supports** quand cette information est pertinente et vérifiable.
3. Ne jamais assimiler un événement japonais de 2015 à une distribution française actuelle.
4. Privilégier une source officielle ; les bases communautaires (Poképédia, Bulbapedia, Serebii) complètent pour les détails historiques.
5. L'archive n'est pas exhaustive : chaque entrée supplémentaire doit être vérifiée et sourcée.
6. Ne pas reproduire intégralement le texte des encyclopédies ou les images de leurs pages.

### Exemples présents dès cette édition

- **Diamant / Perle :** Phione (250 Pokémon dans My Pokémon Ranch, échange d'un Phyllali) et Mew (999 Pokémon et échange d'un Œuf) — compatibilité matérielle à vérifier.
- **Rubis / Saphir :** Jirachi WISHMKR via disque bonus Colosseum nord-américain, et Jirachi via Pokémon Channel PAL.
- **Rubis Oméga / Saphir Alpha :** Diancie chromatique du Japon, 12–31 décembre 2015.
- **Légendes Z-A :** cycle jour/nuit, Méga-Dimension et distribution Pérégrain datée de 2026.

## Compatibilité et vérification

```bash
node scripts/build-calendar-data.mjs --check
node --test tests/*.test.mjs
```

Aucune migration SQL, aucune modification des profils publics ou des sauvegardes. Le contenu HTML/CSS du glossaire est public et ne doit jamais contenir de secrets Discord ou Supabase.
