# Poké-Agenda V3 — Suivi des Pokédex, sauvegardes et objectifs

## Ce qui fonctionne sans backend

- Une page \`suivi.html\` pour les **22 entrées de jeux principaux** (Pokémon GO est exclu du suivi).
- Les images de bannière sont reprises du catalogue actuel.
- Les Pokédex régionaux (et nationaux lorsqu'ils existent dans le jeu) sont fournis en français par les données CSV de PokéAPI.
- X/Y : Kalos central, littoral, monts et total régional ; SWSH et EV : sections DLC ; Z-A : Illumis et extradimensionnel.
- Icônes Pokémon chargées depuis le dépôt PokeAPI/sprites avec solution de repli.
- Cases cochées par espèce, partagées entre le régional et le national **à l'intérieur de la même sauvegarde**.
- Plusieurs sauvegardes et versions pour chaque jeu : par exemple une partie Rouge indépendante de Bleu.
- Une jauge Pokédex et une jauge d'objectifs distinctes, plus des objectifs personnels ajoutables.
- Sauvegarde locale dans localStorage ; exportation/importation JSON (sans affecter les anciennes données V2).

**Important :** les objectifs de jeu sont une sélection éditoriale à affiner avec les retours des joueurs. Le 100 % représente les cases de la checklist affichée, pas une définition canonique ou une certification officielle de « tout faire ». Les Pokédex nationaux n'existent plus en jeu pour certains titres modernes : le suivi ne doit pas en inventer.

## Publication et sécurité

Les nouvelles pages utilisent GitHub Pages et ne nécessitent pas de serveur pour la partie locale.
Ne jamais stocker de mots de passe dans du JavaScript, dans un dépôt GitHub ou dans localStorage.

## Dimension sociale : seconde phase

GitHub Pages ne fournit pas de comptes ni de base de données en écriture.
Pour permettre **pseudo + mot de passe sans email obligatoire**, deux options :

1. **Clerk + Supabase** (hébergement géré). Configurer Clerk pour utiliser un identifiant de connexion de type username et le mot de passe, sans exiger email ou SMS si les paramètres du plan le permettent. Activer ensuite l'intégration de connexion tierce de Clerk dans Supabase. La base Supabase gère progression et abonnements, avec RLS.
2. **PocketBase** (serveur privé). Une collection d'authentification peut rendre le champ email optionnel et utiliser un champ username unique comme identité de connexion. Cette option exige un serveur sécurisé et persistant à héberger et maintenir : GitHub Pages seul ne suffit pas.

Le fichier \`backend/social-schema.sql\` propose un schéma RLS pour la première option. Il n'est **pas** exécuté automatiquement.

### Besoins à finaliser avant lancement des comptes

- Confirmation de la disponibilité d'un identifiant « username + password » seul dans l'instance de production.
- Paramétrage d'une application d'authentification et d'un projet Supabase par l'administrateur.
- Vue « Mon profil », pseudo unique, visibilité privée par défaut, recherche de pseudos, demande d'ami et acceptation.
- Synchronisation des Pokémon possédés et des objectifs par utilisateur, gestion des conflits et reprise des sauvegardes locales existantes.
- Test de sécurité des règles RLS avec deux comptes (dont un non autorisé), blocage des mots de passe faibles et tentatives répétées.
- Suppression de compte et de données ; récupération de compte. **Sans email, le mot de passe perdu risque d'être irrécupérable** : prévoir des codes de secours ou un email facultatif.
- Mentions de confidentialité et traitement des données requis pour les utilisateurs en France / UE.
- Limites des offres gratuites : l'hébergement peut nécessiter une montée de gamme selon le trafic.

### Sources

- PokéAPI : https://github.com/PokeAPI/pokeapi
- PokéAPI sprites : https://github.com/PokeAPI/sprites
- Clerk : https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options
- Intégration Supabase / Clerk : https://supabase.com/docs/guides/auth/third-party/clerk
- PocketBase : https://pocketbase.io/docs/authentication/

Pokémon, noms et images associés restent la propriété de leurs ayants droit. Réutiliser les images d'un dépôt de sprites n'accorde pas automatiquement une licence sur les personnages ou illustrations. Le site doit éviter de suggérer un partenariat officiel.
