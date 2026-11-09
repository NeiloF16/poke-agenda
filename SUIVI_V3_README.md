# Poké-Agenda — Vitrine et suivi Pokémon

Poké-Agenda est un site statique public, accessible via GitHub Pages. Il sert de bibliothèque de guides illustrés et de vitrine des aventures Pokémon, en proposant un suivi de collection individuel, sans service social.

## Fonctionnalités

- `index.html` : calendrier, bibliothèque de 23 jeux/duos et 90 affiches historiques.
- `suivi.html` : suivi de 22 entrées de jeux principaux (Pokémon GO reste seulement dans le calendrier).
- Listes Pokédex régionales et nationales lorsqu'elles existent dans le jeu, noms français et icônes PokéAPI.
- Recherche et cases « possédé » communes au Dex régional/national d'une même sauvegarde.
- Plusieurs sauvegardes distinctes par version : Rouge et Bleu, par exemple, ne partagent pas leurs cases.
- Progression indépendante pour le Pokédex et pour les objectifs d'histoire/après-jeu, ainsi que les objectifs personnels.
- **Vitrine de sauvegardes** : aperçu des deux jauges par partie et export en page HTML statique, à partager volontairement.
- Exportation et importation des données de suivi en JSON.

## Comment fonctionne la vitrine ?

La vitrine intégrée à `suivi.html` résume toutes les parties enregistrées sur l'appareil courant. Le bouton **Exporter ma vitrine (HTML)** produit un fichier autonome avec les titres des jeux, le nom de chaque sauvegarde et les pourcentages de complétion. Ce document est en lecture seule et son contenu est figé à l'instant de l'export. Les illustrations y sont chargées depuis le site public.

Le fichier HTML peut être envoyé directement aux amis ou hébergé séparément par son propriétaire. Aucun contenu des sauvegardes n'est publié automatiquement sur le Poké-Agenda.

## Conservation de la progression

Le suivi et la bibliothèque stockent leurs coches, notes et favoris dans le stockage local de chaque navigateur. Les visiteurs conservent donc leurs propres données, et doivent exporter périodiquement une sauvegarde JSON : elles ne sont pas synchronisées entre plusieurs appareils. Le fichier HTML « vitrine » est une présentation, **pas une sauvegarde réimportable**.

## Limites et vérifications

La notion de « jeu à 100 % » repose sur les objectifs présentés dans la checklist éditoriale et les objectifs personnels ajoutés. Elle ne garantit pas une définition exhaustive et officielle de la complétion. Les Pokédex nationaux n'existent pas dans tous les jeux récents : seuls ceux qui correspondent au titre sont proposés.

La V3 reste une application statique. Aucun service d'authentification, aucune base de données partagée et aucune fonctionnalité d'amis n'est nécessaire à son fonctionnement.

## Sources et droits

- Données Pokédex : https://github.com/PokeAPI/pokeapi
- Sprites Pokémon : https://github.com/PokeAPI/sprites
- Licence PokéAPI : `assets/tracker/POKEAPI-LICENSE.md`

Pokémon et les marques associées appartiennent à leurs ayants droit. Poké-Agenda est un projet de fans non officiel.
