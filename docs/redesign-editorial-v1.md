# Poké Agenda — Design éditorial V1

**Date :** 9 novembre 2026  
**Nom :** Édition Encyclopédie  
**Idée :** rendre Poké Agenda plus proche des codes de lecture d'un portail encyclopédique Pokémon, notamment Pokébip, sans copier ses logos, images ou feuilles de style.

## Avant / après

- **Avant :** interface sombre, fond bleu-noir, cartes sombres, disposition très « application gaming ».
- **V1 :** fond clair, cartes blanches, typographie lisible, navigation bleu marine, liens bleus, accents verts et étiquettes de statut contrastées.
- Le bandeau illustré de l'accueil et les bannières Pokémon des versions sont conservés, avec un contraste adapté.
- Les trois sections sont harmonisées : accueil et bibliothèque, suivi Pokédex avec Discord, pages de glossaire.
- La navigation ajoute des liens « Événements » et « Glossaires » sur les sous-pages.
- Le CSS a des règles pour ordinateurs, tablettes, téléphones et réduction des animations.

## Fichiers modifiés

Le design réside dans **un seul fichier autonome** :
- assets/theme/editorial-v1.css

Ce fichier est inclus **après** les feuilles de style existantes, dans :
- index.html
- suivi.html
- jeu.html

Les pages portent des attributs \`data-design="editorial-v1"\` et \`data-page="home|tracker|guide"\` qui isolent le thème. Toutes les fonctions JavaScript, les événements, les bannières, les données Pokédex, les profils Discord et les sauvegardes restent inchangés.

## Rollback : comment revenir au design précédent

**Sauvegarde vérifiée, créée avant la V1 :**
- Branche : [backup/avant-redesign-20261109](https://github.com/NeiloF16/poke-agenda/tree/backup/avant-redesign-20261109)
- Commit : \`c9ad67aab3934033dbf44beb582efca956a0edb4\`

**Méthode recommandée après publication :** ouvrir la pull request de la V1 puis utiliser **Revert** dans GitHub (ou créer un commit de revert du commit de fusion). Cette méthode retire uniquement les modifications de design, sans réinitialiser l'historique des changements qui auraient eu lieu entre-temps.

**Alternative si Revert n'est pas proposé :** créer une branche corrective depuis \`main\` et restaurer exactement les fichiers \`index.html\`, \`suivi.html\` et \`jeu.html\` depuis la branche de sauvegarde ; supprimer ou laisser inutilisé \`assets/theme/editorial-v1.css\`. Une nouvelle pull request pourra publier cette restauration.

**Éviter :** \`git reset --hard\` puis force push vers \`main\`, car cela pourrait écraser les commits plus récents.

## Qualité et vérification

- \`node --test tests/*.test.mjs\` : non-régression et test de structure du thème.
- \`node scripts/build-calendar-data.mjs --check\` : le catalogue Pokémon reste synchronisé.
- Revoir sur desktop et mobile les trois pages : **Accueil**, **Suivi** et **Glossaire**.
- Tester l'ouverture du menu mobile, la recherche, les événements, la sélection des Dex, la connexion Discord et les notes du glossaire.
- Contrôler dans GitHub Actions que la publication Pages porte le commit de fusion.

## Personnalisation rapide

Couleurs centrales, dans \`assets/theme/editorial-v1.css\` :
- \`--pa-navy: #103554\` — barre latérale et navigation
- \`--pa-blue: #1767a7\` — liens, boutons, onglets
- \`--pa-green: #138b67\` — catégorie et progression
- \`--pa-bg: #eef3f7\` — fond du site
- \`--pa-white: #ffffff\` — articles et cartes

Le thème est une version à tester en situation réelle, pas une copie de l'apparence de Pokébip.
