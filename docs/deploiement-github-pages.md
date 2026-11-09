# Déploiement GitHub Pages — dépannage

Poké Agenda est un site statique. Les fichiers publiés proviennent de la branche `main`.

## Contrôles habituels

1. Vérifier les tests `Vérifications Poké Agenda V4.1` : Node 22, catalogue généré et fichiers JavaScript.
2. Vérifier `pages build and deployment` : les tâches `build` et `report-build-status` doivent réussir, puis `deploy`.
3. Si `deploy` échoue avec `Current status: syncing_files` puis `Timeout reached, aborting!`, le blocage se situe à l'étape **GitHub Pages**, et non dans la compilation du JavaScript.
4. Ne pas réexécuter indéfiniment le même déploiement annulé : une nouvelle tentative du même SHA peut échouer avec `Deployment cancelled`.
5. Une publication sur un **nouveau commit** permet de demander une nouvelle tentative avec un identifiant de déploiement distinct, mais ne garantit pas la résolution d'un incident du service GitHub Pages.
6. Si le problème persiste, conserver les liens vers les runs et les journaux, puis consulter https://www.githubstatus.com/ et https://github.com/orgs/community/discussions avant d'envisager un autre hébergement.

## V4.1 — problème constaté le 9 novembre 2026

Le commit `7f2417259fd6d96ee9e692e29b99f297101bffc1` a passé les vérifications et la compilation, mais GitHub Pages est resté bloqué sur `syncing_files` et a atteint son délai maximal. Une relance de la tâche `deploy` pour ce même commit a affiché `Deployment cancelled`.

- Déploiement concerné : https://github.com/NeiloF16/poke-agenda/actions/runs/42621455048
- Pull request V4.1 : https://github.com/NeiloF16/poke-agenda/pull/5

Aucune modification de la base Supabase, de la configuration Discord ou des sauvegardes n'est nécessaire pour résoudre une erreur de synchronisation de GitHub Pages.
