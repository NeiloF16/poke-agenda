# Poké Agenda — événements français, archive des dates et activités

Révision documentaire initiale : **9 novembre 2026**.

## Ce qui est publié

- `assets/calendar/timed-events.js` : événements dont la fenêtre de réception a été confirmée avec Pokébip ou une annonce officielle. Au 9 novembre, quelques exemples concernent **Pérégrain, Prismillon, les raids 7★ d'Écarlate/Violet et Pokémon GO**.
- `assets/calendar/event-engine.js` : les classe dans **En cours / Terminés / À venir** selon la date de France ; la fin à l'heure UTC est prise en compte lorsqu'elle est documentée.
- `assets/glossary/distribution-archives.js` : **68 notices historiques locales** et 30 références répertoriant des archives plus étendues de Pokébip (1G–8G et nouveautés 9G). Ces 68 notices sont **une sélection**, pas la totalité des distributions.
- `assets/glossary/daily-weekly.js` : **130 activités documentées** (104 quotidiennes, 26 liées au jour de semaine) à consulter directement par jeu et via le calendrier.
- `assets/calendar/news-watch.js` : extrait de secours des annonces récentes.
- `assets/calendar/news-watch.json` : titres, dates de publication et liens des annonces ; possibilité de veille automatisée.

**Aucun site ne peut annoncer une couverture exhaustive du patrimoine français sans comparer systématiquement chaque fiche et ses variantes par version, année et région.** Cette édition structure l'inventaire, publie les faits réellement vérifiés et conserve le lien vers les répertoires complets.

## Source principale

[Evendex — Pokébip](https://www.pokebip.com/page/jeux-video/evendex/accueil). Les archives historiques français 1G à 8G sont reliées sur chaque page du glossaire.

Guides des rendez-vous récurrents :
- [Or, Argent, Cristal](https://www.pokebip.com/page/jeux-video/pokemon-or-argent/evenements-quotidiens)
- [Diamant / Perle](https://www.pokebip.com/page/jeux-video/pokemon-diamant-perle/evenements)
- [Platine](https://www.pokebip.com/page/jeux-video/pokemon-platine/evenements)
- [HeartGold / SoulSilver](https://www.pokebip.com/page/jeux-video/pokemon-heartgold-soulsilver/evenements-lies-au-temps)
- [Noir / Blanc](https://www.pokebip.com/page/jeux-video/pokemon-noir-blanc/evenements-temps)
- [Noir 2 / Blanc 2](https://www.pokebip.com/page/jeux-video/pokemon-noir-2-blanc-2/evenements-temps)
- [X / Y](https://www.pokebip.com/page/jeux-video/pokemon-x-y/evenements-temps)
- [Rubis Oméga / Saphir Alpha](https://www.pokebip.com/page/jeux-video/pokemon-rubis-omega-saphir-alpha/activites-quotidiennes)
- [Épée / Bouclier](https://www.pokebip.com/page/jeux-video/pokemon-epee-bouclier/activites-quotidiennes)
- [Écarlate / Violet](https://www.pokebip.com/page/jeux-video/pokemon-ecarlate-violet/activites-quotidiennes)

La rubrique des rendez-vous n'invente pas de quête journalière dans Rouge/Bleu/Jaune ; les jeux sans tâche liée à une vraie date disposent de leurs autres activités dans le glossaire.

## Dates utiles à PKHeX

- Afficher des dates de **début et de fin de distribution vérifiées**, et non une date reconstruite à partir de souvenirs.
- Les dates de début/fin d'une campagne sont distinctes de la **validité d'un code** et d'une date d'obtention ou de rencontre inscrite en sauvegarde.
- Vérifier **DO, ID, rubans, PID, carte miracle, méthode, région, langue, console et jeu d'origine** dans l'archive détaillée ; ne pas considérer qu'un intervalle chronologique « rend légal » un Pokémon.
- Les champs sans date de fin confirmée sont **séparés**, jamais annoncés comme des événements actifs automatiques.
- Les événements Pokémon GO ne produisent pas nécessairement un Cadeau Mystère injectable en sauvegarde principale. Ils sont marqués comme événements de jeu.

## Veille des nouvelles annonces

Le flux public [Pokébip RSS](https://www.pokebip.com/news.rss) est prévu pour le suivi des **titres, dates de publication et liens** uniquement. Le script `scripts/sync-pokebip-news.mjs` et la tâche `.github/workflows/pokebip-news.yml` peuvent actualiser ce cache quotidiennement dans le dépôt.

Le navigateur peut lire le JSON du dépôt GitHub via une URL publique, sans attendre la propagation de GitHub Pages. Si le réseau est indisponible, la page conserve sa copie locale. L'automatisation **ne déduit pas une fenêtre de réception depuis le simple titre d'une news** : un rédacteur doit vérifier les dates et ajouter une entrée au registre.

La tâche nécessite l'autorisation GitHub Actions **Contents: write** pour pousser un commit. Les dépôts qui bloquent ce droit conserveront le dernier cache valide.

## Pour ajouter une nouvelle distribution

Ajouter une entrée avec au minimum : `id` unique, `gameIds`, `type`, `title`, `start`, `end`, `method`, `region`, `description` et `source`. Pour une échéance précise en UTC, ajouter `endHourUTC`. Pour un événement avec dates seulement approximatives, privilégier une notice d'archive au lieu de fabriquer des dates ISO.

Les événements français d'une génération ne s'appliquent **pas nécessairement à tous les jeux de cette génération**. Contrôler systématiquement la compatibilité dans la fiche Pokébip.

## Tests

```bash
node scripts/build-calendar-data.mjs --check
node --test tests/*.test.mjs
```

Cette refonte ne modifie ni Supabase ni les comptes Discord, les 38 suivis de version, les bannières personnelles ou les anciennes données locales.
