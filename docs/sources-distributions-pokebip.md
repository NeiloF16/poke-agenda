# Poké Agenda — vérification des distributions avec Pokébip

Dernière vérification ciblée : **9 novembre 2026**.

## Périmètre exact

Poké Agenda compte **23 jeux / duos** et **38 versions individuelles dans le suivi**. Le glossaire comporte 153 premières notices générales. Nous avons maintenant ajouté un **répertoire distinct des distributions** avec :

- des liens vers les inventaires historiques de Pokébip pour les **8 premières générations** (France, et dossiers régionaux ou spéciaux complémentaires) ;
- des liens vers les actualités et dossiers Pokébip pour la **9G et Pokémon GO**, dont les distributions continuent de changer ;
- **68 notices d'événements sélectionnés, documentés et reliés à une source**, avec dates, moyen, zone et DO/ID lorsqu'ils sont établis.

**Important : 68 notices ne signifient pas 68 distributions existantes ni un catalogue exhaustif.** Les archives consultables via les liens couvrent beaucoup plus de fiches. Les 153 notices de la version précédente n'ont pas été toutes revérifiées individuellement : leur statut éditorial reste « vérification en cours ». Le lien Evendex est la référence pour les détails, objets, movesets, ID et variantes manquantes.

## Sources prioritaires

- [Evendex : encyclopédie mondiale Pokébip](https://www.pokebip.com/page/jeux-video/evendex/accueil)
- [Moyens et conditions de distribution](https://www.pokebip.com/page/jeux-video/evendex/event-moyens-de-distribution)
- [Distributions françaises 1G](https://www.pokebip.com/page/jeux-video/evendex/event-distributions-en-france-depuis-1996-1g)
- [Distributions françaises 2G](https://www.pokebip.com/page/jeux-video/evendex/event-distributions-en-france-depuis-1996-2g)
- [Distributions françaises 3G](https://www.pokebip.com/page/jeux-video/evendex/event-distributions-en-france-depuis-1996-3g)
- [Distributions françaises 4G](https://www.pokebip.com/page/jeux-video/evendex/event-distributions-en-france-depuis-1996-4g)
- [Distributions françaises 5G](https://www.pokebip.com/page/jeux-video/evendex/event-distributions-en-france-depuis-1996-5g)
- [Distributions françaises 6G](https://www.pokebip.com/page/jeux-video/evendex/event-distributions-en-france-depuis-1996-6g)
- [Distributions françaises 7G](https://www.pokebip.com/page/jeux-video/evendex/event-distributions-en-france-depuis-1996-7g)
- [Distributions françaises 8G](https://www.pokebip.com/page/jeux-video/evendex/event-distributions-en-france-depuis-1996-8g)

Ces pages indiquent notamment la date, le moyen, les versions compatibles, le DO/ID et la provenance. En revanche, **une page d'archive d'une génération ne garantit pas que chaque événement est compatible avec tous ses jeux**.

## Dossiers spécifiques

Dans `assets/glossary/distribution-archives.js`, les références spéciales renvoient notamment aux pages Pokébip sur My Pokémon Ranch (20 échanges courants, Mew et Phione), les divers Jirachi, Diancie chromatique, la Banque Pokémon, les codes QR, les distributions liées à des effets en jeu, et les événements récents de Légendes Z-A.

### Corrections issues de la vérification

- Mew France 2000 et 2002 sur Rouge/Bleu/Jaune, avec DO/ID connus pour l'événement de 2002.
- Celebi Tour français de 2001 sur Or/Argent.
- 10ANNIV de la 3G ; la réception par ticket pour le Roc Nombri et l'Île du Sud est une opération historique.
- Distribution officielle de la Clé Secrète pour Motisma sur **Platine** ; pas de Lettre de Chen ou Carte Membre officiellement distribuée sur **Diamant/Perle originaux** pour les rencontres concernées.
- Mew et Phione de Ranch ainsi que les 20 échanges classiques, avec nécessité du logiciel et matériel compatibles.
- Jirachi WISHMKR (Colosseum) et CHANNEL (Pokémon Channel), deux origines différentes.
- Genesect Plasma 2012 sur Noir 2 / Blanc 2.
- Diancie chromatique 2015 au Japon sur ROSA : DO ポケセン et ID 12125.
- Pokémon de l'année des légendaires 2018 : **vérifier la version de réception** avant de cocher la distribution.
- Pour Z-A : dates de fin explicites lorsque confirmées, et aucune annonce de « distribution active » sans nouvelle vérification.

## Fichiers à modifier

- `assets/glossary/distribution-archives.js` : index des sources Pokébip et exemples structurés ;
- `assets/glossary/data.js` : texte du glossaire général et références par jeu ;
- `assets/glossary/app.js` : interface de recherche et affichage des sources ;
- `assets/glossary/style.css` : présentation des cartes et répertoires ;
- `jeu.html` : ordre de chargement et structure.

Pour ajouter une notice, renseigner au minimum : jeu(x), espèce ou objet, méthode, période, région, version(s) compatible(s) et **lien source Pokébip exact**. Ne pas inventer les données absentes ; utiliser une note « information non vérifiée » dans une revue avant publication.

Les anciens liens du suivi, comptes Discord et sauvegardes Supabase ne changent pas.

## Limites et droits

Les faits historiques, dates, DO/ID et noms peuvent être résumés et cités. **Ne pas copier intégralement** les articles, tableaux, illustrations ou milliers de fiches de Pokébip. Le site propose des synthèses originales avec des liens vers leurs sources détaillées.

La couverture des 9G/GO et des distributions récentes est par nature évolutive ; vérifier les actualités officielles et Pokébip au moment de la consultation.

## Vérifier avant publication

```bash
node scripts/build-calendar-data.mjs --check
node --test tests/*.test.mjs
```
