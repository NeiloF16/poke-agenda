# Poké-Agenda — Vitrine et suivi Pokémon

Poké-Agenda est un site statique public, accessible via GitHub Pages. Il sert de bibliothèque de guides illustrés et de vitrine des aventures Pokémon, en proposant un suivi de collection individuel, sans service social.

## Fonctionnalités

- `index.html` : calendrier, bibliothèque de 23 jeux/duos et 90 affiches historiques.
- `suivi.html` : suivi de 22 entrées de jeux principaux (Pokémon GO reste seulement dans le calendrier).
- Listes Pokédex régionales et nationales lorsqu'elles existent dans le jeu, noms français et icônes PokéAPI.
- Recherche et cases « possédé » communes au Dex régional/national d'une même sauvegarde.
- Plusieurs sauvegardes distinctes par version : Rouge et Bleu, par exemple, ne partagent pas leurs cases.
- Progression indépendante pour le Pokédex et pour les objectifs d'histoire/Post Game, ainsi que les objectifs personnels.
- **Vitrine de sauvegardes** : aperçu des deux jauges par partie et liens partageables directement sur le site.
- Exportation et importation des données de suivi en JSON.

## Comment fonctionne le partage de la vitrine ?

Le bouton **« Copier le lien de ma vitrine »** produit un lien `suivi.html#v1=...`. Les données sont codées directement dans la partie après `#` : GitHub Pages ne reçoit donc pas la progression sous forme d'une sauvegarde serveur.

- Le lien récapitule uniquement le jeu, le nom de chaque sauvegarde, le nombre d'espèces cochées au Pokédex régional et le pourcentage d'objectifs accomplis.
- Ni les notes personnelles, ni les listes détaillées des Pokémon cochés, ni les données d'import/export ne sont incluses.
- Le visiteur voit une **vitrine en lecture seule**, avec les bannières existantes et les jauges.
- Le lien est un **instantané**, pas une progression synchronisée. Générer un nouveau lien après avoir coché des événements.
- Il ne dépend pas d'un compte. Il ne nécessite pas de fichier HTML à envoyer.
- En cas de très nombreuses sauvegardes, la longueur du lien peut dépasser les limites de certains services de messagerie ; le bouton **« Lien de cette partie »** fournit alors une version plus courte.
- Toute personne recevant le lien peut lire les informations résumées qui y figurent : ne renseignez pas d'informations sensibles dans les noms des sauvegardes.

## Conservation de la progression

Le suivi et la bibliothèque stockent leurs coches, notes et favoris dans le stockage local de chaque navigateur. Les visiteurs conservent donc leurs propres données, et doivent exporter périodiquement une sauvegarde JSON : elles ne sont pas synchronisées entre plusieurs appareils. Le lien de partage est une présentation, **pas une sauvegarde réimportable**.

## Limites et vérifications

La notion de « jeu à 100 % » repose sur les objectifs présentés dans la checklist éditoriale et les objectifs personnels ajoutés. Elle ne garantit pas une définition exhaustive et officielle de la complétion. Les Pokédex nationaux n'existent pas dans tous les jeux récents : seuls ceux qui correspondent au titre sont proposés.

La V3 reste une application statique : les données de progression sont conservées par chaque navigateur, sans service externe.

## Sources et droits

- Données Pokédex : https://github.com/PokeAPI/pokeapi
- Sprites Pokémon : https://github.com/PokeAPI/sprites
- Licence PokéAPI : `assets/tracker/POKEAPI-LICENSE.md`

Pokémon et les marques associées appartiennent à leurs ayants droit. Poké-Agenda est un projet de fans non officiel.

## Vitrines permanentes (option avec Supabase)

Une nouvelle fonctionnalité permet une adresse de partage stable, du type `suivi.html?live=<uuid>`, dont les statistiques évoluent automatiquement à chaque progression. Le site GitHub Pages reste identique et les sauvegardes détaillées restent locales. Les données publiques ne contiennent que les noms des parties, les nombres d'espèces cochées dans le Pokédex régional et les pourcentages d'objectifs. Les visiteurs ne peuvent pas éditer cette vitrine.

La mise en service nécessite **un projet Supabase** avec authentification anonyme activée, migration SQL et clés publiques configurées. Elle reste **désactivée tant que ces étapes ne sont pas réalisées**. Le partage par lien instantané demeure utilisable sans Supabase.

Configuration, contrôles RLS, révocation et limites : voir `supabase/SETUP.md`.
