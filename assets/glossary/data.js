/* Poké Agenda — glossaire éditorial (23 jeux/duos).
 * Une entrée = fait sourcé, disponibilité, conditions. Aucune distribution
 * historique n'est annoncée comme récupérable actuellement.
 * Compléter les fiches sans effacer les sources ni les sauvegardes existantes.
 */
window.POKE_GLOSSARY = {
  "schema": 1,
  "updated": "2026-11-09",
  "references": {
    "calendar": "https://www.pokepedia.fr/Jours_de_la_semaine",
    "johto": "https://www.pokebip.com/page/jeux-video/pokemon-or-argent/evenements-quotidiens",
    "trades": "https://bulbapedia.bulbagarden.net/wiki/In-game_trade",
    "events": "https://www.pokebip.com/page/jeux-video/evendex/accueil",
    "wifi": "https://www.pokebip.com/page/jeux-video/evendex/event-moyens-de-distribution",
    "ranch": "https://www.pokebip.com/page/jeux-video/evendex/event-my-pokemon-ranch",
    "wishmkr": "https://www.pokebip.com/page/jeux-video/evendex/minidex-evenementiel/385-jirachi",
    "channel": "https://www.pokebip.com/page/jeux-video/evendex/minidex-evenementiel/385-jirachi",
    "shinyDiancie": "https://www.pokebip.com/page/jeux-video/evendex/minidex-evenementiel-chroma/719-diancie",
    "xy": "https://www.serebii.net/xy/dailyevent.shtml",
    "oras": "https://www.serebii.net/omegarubyalphasapphire/dailyevent.shtml",
    "platinum": "https://www.serebii.net/platinum/dailyevent.shtml",
    "bw": "https://www.serebii.net/blackwhite/dailyevent.shtml",
    "bw2": "https://serebii.net/black2white2/dailyevent.shtml",
    "swsh": "https://www.serebii.net/swordshield/dailyevent.shtml",
    "alola": "https://www.serebii.net/sunmoon/dailyevent.shtml",
    "za": "https://www.pokebip.com/page/jeux-video/legendes-pokemon-z-a/cycle-jour-nuit",
    "zadlc": "https://www.pokemon.com/fr/actualites/legendes-pokemon-z-a-nintendo-switch-2-edition-mega-dimension-est-maintenant-disponible",
    "zavivi": "https://www.pokemon.com/fr/actualites/recevez-un-peregrain-capable-devoluer-en-prismillon-au-motif-aleatoire-dans-legendes-pokemon-z-a",
    "go": "https://pokemongo.com/fr/news/choose-your-path-forever-forward-2026",
    "goguide": "https://scopelyexplore.helpshift.com/hc/en/5-pokemon-go/faq/1091-the-today-view/"
  },
  "games": {
    "1": {
      "intro": "Aux origines de Kanto : peu de rendez-vous liés à une horloge, mais une collection riche en échanges internes, fossiles et Pokémon fixes.",
      "entries": [
        {
          "type": "routines",
          "name": "Horloge et calendrier",
          "description": "Les versions originales ne proposent pas de semaine interne : les événements se déclenchent surtout par la progression de l'aventure et les prérequis.",
          "when": "Sans calendrier",
          "source": "trades",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Exploration à revisiter",
          "description": "Retourne aux zones débloquées avec Coupe, Surf et Force pour retrouver des objets et passages inaccessibles auparavant.",
          "when": "Permanent",
          "source": "trades",
          "scope": ""
        },
        {
          "type": "echanges",
          "name": "Échanges avec les PNJ de Kanto",
          "description": "Plusieurs habitants échangent un Pokémon précis contre une espèce demandée. Conserve la version et la langue du jeu : surnoms et dresseurs d'origine varient.",
          "when": "Permanent",
          "source": "trades",
          "scope": ""
        },
        {
          "type": "echanges",
          "name": "Pokémon fixes et fossiles",
          "description": "Fossile Dôme ou Nautile, Évoli, Ronflex et oiseaux légendaires constituent une collection complémentaire aux captures ordinaires.",
          "when": "Permanent",
          "source": "trades",
          "scope": ""
        },
        {
          "type": "distributions",
          "name": "Mew et distributions historiques",
          "description": "Les distributions officielles de Mew sont liées à des campagnes et supports précis selon le pays et la génération. Elles ne sont pas des Cadeaux Mystère encore actifs.",
          "when": "Historique",
          "source": "events",
          "scope": "Région et support d'origine déterminants"
        },
        {
          "type": "secrets",
          "name": "Exclusivités Rouge / Bleu",
          "description": "Les populations sauvages et certains échanges diffèrent selon la version. Enregistre les obtentions par cartouche plutôt que de fusionner les deux parcours.",
          "when": "Permanent",
          "source": "trades",
          "scope": ""
        }
      ]
    },
    "2": {
      "intro": "La version Pikachu propose des cadeaux de partenaires et des rencontres uniques, plus que des événements calendaires.",
      "entries": [
        {
          "type": "routines",
          "name": "Une aventure sans jours de semaine",
          "description": "Le contenu se déclenche surtout par les conditions de progression, les cadeaux et les mini-jeux : pas de calendrier hebdomadaire comparable à Johto.",
          "when": "Sans calendrier",
          "source": "trades",
          "scope": ""
        },
        {
          "type": "echanges",
          "name": "Les trois Pokémon de départ supplémentaires",
          "description": "Bulbizarre, Salamèche et Carapuce peuvent rejoindre l'équipe via des personnages de Kanto, sous conditions propres à Jaune.",
          "when": "Permanent",
          "source": "trades",
          "scope": ""
        },
        {
          "type": "echanges",
          "name": "Échanges internes de la version Jaune",
          "description": "Certains échanges PNJ et Pokémon disponibles diffèrent de Rouge/Bleu. Vérifie la table propre à ta version et à sa langue.",
          "when": "Permanent",
          "source": "trades",
          "scope": ""
        },
        {
          "type": "distributions",
          "name": "Cadeaux Mew de l'époque Game Boy",
          "description": "Mew a bien été distribué officiellement sur Rouge, Bleu et Jaune, notamment en France lors de campagnes en 2000 et 2002. Cela reste une distribution historique et non une capture normale dans Jaune.",
          "when": "Historique",
          "source": "events",
          "scope": ""
        },
        {
          "type": "secrets",
          "name": "Pikachu et le mini-jeu de surf",
          "description": "Le mini-jeu Pikachu Surfeur dépend de prérequis particuliers suivant le matériel et la version ; ne pas le confondre avec une activité quotidienne.",
          "when": "Conditionnel",
          "source": "trades",
          "scope": ""
        }
      ]
    },
    "3": {
      "intro": "Johto introduit l'heure et la semaine : baies, Noigrumes, rencontres et concours rythment la sauvegarde.",
      "entries": [
        {
          "type": "routines",
          "name": "Noigrumes et Baies",
          "description": "Récupère les ressources des arbres et reviens chez Fargas après son délai de fabrication. Les cycles sont suivis par l'horloge interne.",
          "when": "Chaque jour",
          "source": "johto",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Concours de capture d'insectes",
          "description": "Le Parc Naturel ouvre son concours certains jours : mardi, jeudi et samedi.",
          "when": "Mar., jeu., sam.",
          "source": "johto",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Lokhlass des Caves Jumelles",
          "description": "Une rencontre fixe peut revenir le vendredi, après avoir atteint la zone concernée.",
          "when": "Vendredi",
          "source": "johto",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Mélofée au Mont Sélénite",
          "description": "Le lundi soir, découvre la danse des Mélofée, accessible après avoir atteint Kanto.",
          "when": "Lundi soir",
          "source": "johto",
          "scope": ""
        },
        {
          "type": "echanges",
          "name": "La Fratrie des sept",
          "description": "Rencontre les membres selon le jour de la semaine pour récupérer leurs objets. Certains lieux nécessitent d'avancer dans Johto.",
          "when": "Hebdomadaire",
          "source": "calendar",
          "scope": ""
        },
        {
          "type": "echanges",
          "name": "Échanges de Johto",
          "description": "Les échanges internes proposent des Pokémon avec un DO et parfois un surnom déterminé ; distingue Or et Argent.",
          "when": "Permanent",
          "source": "trades",
          "scope": ""
        },
        {
          "type": "distributions",
          "name": "Celebi et ses distributions",
          "description": "Les moyens officiels d'obtenir Celebi ont dépendu du territoire, de l'édition et du support ; ils relèvent ici des archives historiques.",
          "when": "Historique",
          "source": "events",
          "scope": ""
        },
        {
          "type": "secrets",
          "name": "Cadeau Mystère infrarouge",
          "description": "Sur Game Boy Color compatible, la fonction Cadeau Mystère permet des échanges de cadeaux locaux selon les restrictions prévues par le jeu.",
          "when": "Fonction locale",
          "source": "calendar",
          "scope": ""
        }
      ]
    },
    "4": {
      "intro": "Cristal conserve le calendrier de Johto et ajoute plusieurs particularités historiques, notamment selon la région du jeu.",
      "entries": [
        {
          "type": "routines",
          "name": "Cycle des Noigrumes",
          "description": "Les ressources, les objets quotidiens et les jours particuliers de Johto restent utiles dans Cristal.",
          "when": "Chaque jour",
          "source": "johto",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Parc Naturel et Lokhlass",
          "description": "Le concours d'insectes revient mardi, jeudi et samedi ; Lokhlass apparaît le vendredi dans les Caves Jumelles.",
          "when": "Selon le jour",
          "source": "johto",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Radio de Buena",
          "description": "Suis les émissions et les récompenses de Buena, une activité propre au Pokématos et aux conditions du jeu.",
          "when": "Récurrent",
          "source": "calendar",
          "scope": ""
        },
        {
          "type": "echanges",
          "name": "Échanges et Pokémon fixes",
          "description": "Entre PNJ d'échange, Pokémon stationnaires et la quête de Suicune, Cristal offre des obtentions distinctes des autres versions.",
          "when": "Permanent",
          "source": "trades",
          "scope": ""
        },
        {
          "type": "distributions",
          "name": "GS Ball / Celebi",
          "description": "L'événement GS Ball de Cristal fut associé à des modes de distribution particuliers, notamment au Japon. Ne pas considérer sa réception comme native sur toutes les cartouches.",
          "when": "Historique régional",
          "source": "events",
          "scope": "Japon et autres ressorties : conditions différentes"
        },
        {
          "type": "secrets",
          "name": "Revanches et appels Pokématos",
          "description": "Les coordonnées et appels téléphoniques donnent accès à des rencontres et revanches sous des conditions spécifiques.",
          "when": "Récurrent",
          "source": "calendar",
          "scope": ""
        }
      ]
    },
    "5": {
      "intro": "Les cartouches GBA misent sur les routines internes et les connexions GameCube, non sur les jours de semaine.",
      "entries": [
        {
          "type": "routines",
          "name": "Loterie et cadeaux de Hoenn",
          "description": "Les rencontres avec certains habitants et les tirages de la Loterie sont liés au temps de jeu ou aux cycles journaliers.",
          "when": "Quotidien / conditionnel",
          "source": "events",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Île Mirage",
          "description": "La possibilité de voir l'Île Mirage dépend d'un contrôle interne propre à la sauvegarde et de conditions spécifiques, pas d'un jour fixe de la semaine.",
          "when": "Variable",
          "source": "events",
          "scope": ""
        },
        {
          "type": "echanges",
          "name": "Échanges PNJ de Hoenn",
          "description": "Recense les échanges internes, les Pokémon offerts et les rencontres uniques. Les différences entre Rubis et Saphir comptent pour une collection par version.",
          "when": "Permanent",
          "source": "trades",
          "scope": ""
        },
        {
          "type": "echanges",
          "name": "Jirachi WISHMKR du disque bonus Colosseum",
          "description": "Le disque bonus nord-américain de Pokémon Colosseum permet de transférer un Jirachi à une sauvegarde compatible de Rubis ou Saphir en anglais, une fois par sauvegarde.",
          "when": "Transfert historique encore réalisable avec matériel adapté",
          "source": "wishmkr",
          "scope": "Disque bonus nord-américain / sauvegarde anglaise"
        },
        {
          "type": "echanges",
          "name": "Jirachi de Pokémon Channel",
          "description": "La version européenne ou australienne de Pokémon Channel permet un Jirachi sur une cartouche Rubis ou Saphir compatible de même langue, sous conditions d'avancement.",
          "when": "Transfert local avec matériel compatible",
          "source": "channel",
          "scope": "Éditions PAL, sous conditions de langue"
        },
        {
          "type": "distributions",
          "name": "Eon Ticket et anciens objets événements",
          "description": "Les objets remis lors de campagnes de l'ère GBA ne sont pas des distributions en ligne aujourd'hui disponibles. Vérifie la région de la cartouche et le mode d'origine.",
          "when": "Historique",
          "source": "events",
          "scope": ""
        },
        {
          "type": "secrets",
          "name": "Connexions GameCube",
          "description": "Certains cadeaux et transferts dépendent d'un disque ou jeu GameCube, d'un câble GBA et de prérequis de sauvegarde.",
          "when": "Matériel spécifique",
          "source": "wishmkr",
          "scope": ""
        }
      ]
    },
    "6": {
      "intro": "Hoenn enrichi, avec les routines de Rubis/Saphir, la Zone de Combat et les distributions historiques très spécifiques.",
      "entries": [
        {
          "type": "routines",
          "name": "Baies et tirages de Hoenn",
          "description": "Fais la tournée des arbres, des habitants offrant des ressources et de la loterie lorsque ton horloge interne est opérationnelle.",
          "when": "Quotidien",
          "source": "events",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Île Mirage et télévision",
          "description": "Certains événements dépendent d'états internes et d'annonces télévisées plutôt que d'un vrai jour fixe.",
          "when": "Variable",
          "source": "events",
          "scope": ""
        },
        {
          "type": "echanges",
          "name": "Échanges et quêtes de Hoenn",
          "description": "La capture de Pokémon fixes, les échanges avec des PNJ et les Regis constituent autant de lignes à documenter pour un Living Dex.",
          "when": "Permanent",
          "source": "trades",
          "scope": ""
        },
        {
          "type": "distributions",
          "name": "Vieille Carte et Mew sur l'Île Lointaine",
          "description": "La Vieille Carte destinée à Émeraude a eu une distribution officielle japonaise. Ne pas présenter cet accès comme disponible naturellement dans toutes les régions.",
          "when": "Historique régional",
          "source": "events",
          "scope": "Distribution japonaise"
        },
        {
          "type": "distributions",
          "name": "Ticket Aurora et Deoxys",
          "description": "L'accès à Deoxys par objet événementiel est à distinguer des captures permanentes et de la réémission non officielle de tickets.",
          "when": "Historique",
          "source": "events",
          "scope": ""
        },
        {
          "type": "secrets",
          "name": "Zone de Combat",
          "description": "Après l'histoire, explore les sept installations et leurs symboles : c'est du contenu permanent propre à Émeraude.",
          "when": "Post Game",
          "source": "events",
          "scope": ""
        }
      ]
    },
    "7": {
      "intro": "Une aventure à Kanto prolongée par les îles Sevii, les échanges et des objets événementiels de l'époque GBA.",
      "entries": [
        {
          "type": "routines",
          "name": "Îles Sevii et revisites",
          "description": "Les îles débloquent des lieux, quêtes et rencontres annexes au fil de l'histoire ; aucune journée particulière n'est nécessaire.",
          "when": "Permanent",
          "source": "trades",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Objets et Pokémon des îles",
          "description": "Pense aux rencontres fixes et aux zones accessibles seulement après avoir avancé dans la quête des rubis et saphirs.",
          "when": "Post Game",
          "source": "trades",
          "scope": ""
        },
        {
          "type": "echanges",
          "name": "Échanges avec PNJ de Kanto",
          "description": "Ils possèdent souvent un DO ou surnom propre au jeu. Certaines espèces nécessitent aussi la version opposée.",
          "when": "Permanent",
          "source": "trades",
          "scope": ""
        },
        {
          "type": "distributions",
          "name": "Tickets Aurora et Mystik",
          "description": "Deoxys, Ho-Oh et Lugia ont notamment dépendu d'objets distribués lors d'opérations de l'époque GBA. Leur disponibilité officielle appartient aux archives.",
          "when": "Historique",
          "source": "events",
          "scope": ""
        },
        {
          "type": "secrets",
          "name": "Connexions avec Hoenn et GameCube",
          "description": "Certaines espèces et événements sont liés aux échanges entre versions GBA et aux transferts autorisés. Vérifie toujours la compatibilité du matériel.",
          "when": "Transfert local",
          "source": "trades",
          "scope": ""
        }
      ]
    },
    "8": {
      "intro": "Sinnoh introduit de nombreuses rencontres quotidiennes ; l'écosystème Wii et Pokémon Ranger ouvre aussi des cadeaux singuliers.",
      "entries": [
        {
          "type": "routines",
          "name": "Essaims de Sinnoh",
          "description": "Après déblocage approprié, une espèce d'essaim peut changer chaque jour : renseigne-toi auprès du personnage indicateur.",
          "when": "Quotidien",
          "source": "platinum",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Jardin Trophée",
          "description": "Le propriétaire du manoir annonce un Pokémon rare qui peut apparaître temporairement au jardin selon les conditions du jeu.",
          "when": "Quotidien",
          "source": "platinum",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Baudrive au Parc Éolien",
          "description": "Une rencontre de Baudrive est associée au vendredi, après avoir réglé les événements du parc.",
          "when": "Vendredi",
          "source": "platinum",
          "scope": ""
        },
        {
          "type": "echanges",
          "name": "Phione de My Pokémon Ranch",
          "description": "Après 250 Pokémon déposés dans Ranch, Eulalie peut proposer Phione contre un Phyllali. Nécessite le logiciel Wii et une connexion compatible.",
          "when": "Obtention spéciale",
          "source": "ranch",
          "scope": "My Pokémon Ranch / sauvegarde Diamant ou Perle"
        },
        {
          "type": "echanges",
          "name": "Mew de My Pokémon Ranch",
          "description": "Une fois 999 Pokémon déposés, Eulalie peut proposer Mew en échange d'un Œuf. Les versions et conditions de compatibilité du Ranch sont importantes.",
          "when": "Obtention spéciale",
          "source": "ranch",
          "scope": "My Pokémon Ranch / matériel compatible"
        },
        {
          "type": "echanges",
          "name": "Œuf de Manaphy (Pokémon Ranger)",
          "description": "Certains jeux Pokémon Ranger permettent de transférer un Œuf de Manaphy vers les jeux compatibles, sous conditions de mission et de sauvegarde.",
          "when": "Transfert spécifique",
          "source": "events",
          "scope": ""
        },
        {
          "type": "distributions",
          "name": "Membre Carte, Lettre de Chen, autres distributions",
          "description": "Sur Diamant et Perle originaux, la Carte Membre et la Lettre de Chen n'ont pas été distribuées officiellement pour accéder à Darkrai et Shaymin : les distributions d'objets concernent Platine. La Flûte Azur n'a jamais été distribuée officiellement sur les jeux DS.",
          "when": "Historique",
          "source": "events",
          "scope": ""
        },
        {
          "type": "secrets",
          "name": "Échanges PNJ et évolutions",
          "description": "Les échanges internes et les évolutions par échange forment deux listes distinctes : la seconde implique un autre joueur ou support.",
          "when": "Permanent",
          "source": "trades",
          "scope": ""
        }
      ]
    },
    "9": {
      "intro": "Platine modifie certains rendez-vous de Sinnoh et enrichit l'après-Ligue avec la Zone de Combat.",
      "entries": [
        {
          "type": "routines",
          "name": "Loterie, baies et troupeaux",
          "description": "La loterie de Féli-Cité, plusieurs dons de Baies et les essaims de Sinnoh se renouvellent au quotidien.",
          "when": "Quotidien",
          "source": "platinum",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Combats des Centres Pokémon",
          "description": "Certains dresseurs apparaissent et peuvent être combattus certains jours dans des Centres Pokémon.",
          "when": "Selon le jour",
          "source": "platinum",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Baudrive et rival",
          "description": "Baudrive réapparaît le vendredi ; le rival peut être affronté durant le week-end après avoir rempli les prérequis.",
          "when": "Vendredi / week-end",
          "source": "platinum",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Café des Dresseurs",
          "description": "Dans l'Aire de Survie, les Champions et partenaires proposent des revanches selon leur présence, après déblocage.",
          "when": "Post Game / quotidien",
          "source": "platinum",
          "scope": ""
        },
        {
          "type": "echanges",
          "name": "Échanges et cadeaux de Sinnoh",
          "description": "Les échanges avec les PNJ et les Pokémon fixes sont distincts des combats répétables. Note DO, langue et éventuel objet tenu.",
          "when": "Permanent",
          "source": "trades",
          "scope": ""
        },
        {
          "type": "distributions",
          "name": "Distributions de Darkrai et Shaymin",
          "description": "Les événements via Carte Membre et Lettre de Chen appartiennent à des campagnes de distribution datées.",
          "when": "Historique",
          "source": "events",
          "scope": ""
        },
        {
          "type": "secrets",
          "name": "Ranch Wii et compatibilité",
          "description": "Le Ranch standard était conçu pour Diamant/Perle ; la compatibilité Platine était liée à une mise à jour japonaise. Ne suppose pas qu'une édition PAL prend Platine en charge.",
          "when": "Dépend de la région",
          "source": "ranch",
          "scope": "Mise à jour japonaise spécifique"
        }
      ]
    },
    "10": {
      "intro": "Johto revisité avec des horaires, des numéros de Pokématos, des concours et des interactions quotidiennes.",
      "entries": [
        {
          "type": "routines",
          "name": "Concours d'insectes",
          "description": "Le concours du Parc Naturel revient certains jours de la semaine, comme dans les jeux de deuxième génération.",
          "when": "Mar., jeu., sam.",
          "source": "calendar",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Lokhlass et Mélofée",
          "description": "Lokhlass des Caves Jumelles revient le vendredi ; les Mélofée du Mont Sélénite dansent le lundi soir.",
          "when": "Vendredi / lundi soir",
          "source": "calendar",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Radio et Pokéathlon",
          "description": "Les émissions musicales et les rotations de récompenses constituent un calendrier à consulter en jouant.",
          "when": "Hebdomadaire",
          "source": "calendar",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Revanche des Champions",
          "description": "La collecte de numéros Pokématos et les conditions d'appel permettent de retrouver de nombreux Champions en combat.",
          "when": "Selon disponibilité",
          "source": "calendar",
          "scope": ""
        },
        {
          "type": "echanges",
          "name": "Échanges et rencontres de Johto",
          "description": "Liste les PNJ d'échange, cadeaux, rencontres fixes et différences de version sans mélanger HeartGold et SoulSilver.",
          "when": "Permanent",
          "source": "trades",
          "scope": ""
        },
        {
          "type": "distributions",
          "name": "Celebi et Pokémon chromatiques promotionnels",
          "description": "Des événements officiels ont permis des interactions supplémentaires, selon le cadeau reçu et la région de distribution.",
          "when": "Historique",
          "source": "events",
          "scope": ""
        },
        {
          "type": "secrets",
          "name": "Pokéwalker",
          "description": "Les routes et Pokémon obtenus via l'accessoire physique complètent la collection, avec des conditions distinctes du calendrier interne.",
          "when": "Accessoire",
          "source": "events",
          "scope": ""
        }
      ]
    },
    "11": {
      "intro": "Unys propose des événements journaliers, des essaims et des distributions historiques désormais archivées.",
      "entries": [
        {
          "type": "routines",
          "name": "Essaims d'Unys",
          "description": "Après les prérequis du Pokédex, les essaims peuvent changer au fil des jours ; les panneaux des portes indiquent les zones concernées.",
          "when": "Quotidien",
          "source": "bw",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Massage de Volucité",
          "description": "Un personnage propose un massage à un Pokémon selon le rythme propre à la version.",
          "when": "Quotidien",
          "source": "bw",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Stades de Méanville",
          "description": "Les dresseurs, équipes et sports disponibles varient selon le jour et les saisons du jeu.",
          "when": "Selon le jour",
          "source": "bw",
          "scope": ""
        },
        {
          "type": "echanges",
          "name": "Échanges internes et rencontres fixes",
          "description": "Certains Pokémon s'obtiennent par échange avec un PNJ, cadeau ou rencontre unique plutôt que dans les herbes.",
          "when": "Permanent",
          "source": "trades",
          "scope": ""
        },
        {
          "type": "distributions",
          "name": "Passe Liberté / Victini",
          "description": "Le Passe Liberté fut distribué pendant une fenêtre promotionnelle. Il donnait accès à une zone et une rencontre spécifiques.",
          "when": "Historique",
          "source": "events",
          "scope": ""
        },
        {
          "type": "distributions",
          "name": "Dream World et anciens services en ligne",
          "description": "Les fonctions historiques du Dream World ne sont pas actives sur les serveurs officiels d'origine. Éviter de les présenter comme disponibles aujourd'hui.",
          "when": "Service arrêté",
          "source": "wifi",
          "scope": ""
        },
        {
          "type": "secrets",
          "name": "Saisons et variations",
          "description": "Unys change de saison dans le jeu, ce qui influence des lieux et rencontres ; ce cycle ne correspond pas directement à la météo réelle.",
          "when": "Cycle interne",
          "source": "bw",
          "scope": ""
        }
      ]
    },
    "12": {
      "intro": "Les suites d'Unys ajoutent des modes annexes et des connexions à d'autres jeux DS et 3DS.",
      "entries": [
        {
          "type": "routines",
          "name": "Essaims et objets renouvelables",
          "description": "Les suites ont des espèces et récompenses changeantes. Vérifie les essaims, cadeaux de Ville et activités quotidiennes après déblocage.",
          "when": "Quotidien",
          "source": "bw2",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Volucité et massages",
          "description": "Une tournée de la ville peut inclure massages, objets et autres interactions répétables.",
          "when": "Quotidien",
          "source": "bw2",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Avenue Concorde",
          "description": "Développe les boutiques et retrouve les personnages ; l'activité dépend de la progression et des visiteurs.",
          "when": "Récurrent",
          "source": "bw2",
          "scope": ""
        },
        {
          "type": "echanges",
          "name": "Rencontres et échanges propres à Noir 2 / Blanc 2",
          "description": "Les versions possèdent leurs différences et des Pokémon de provenance spéciale. Note la langue, l'OT et les prérequis.",
          "when": "Permanent",
          "source": "trades",
          "scope": ""
        },
        {
          "type": "distributions",
          "name": "Clés, souvenirs et anciens cadeaux",
          "description": "Les liaisons Memory Link et les distributions historiques ne doivent pas être confondues avec des cadeaux actuels en ligne.",
          "when": "Historique / connexion",
          "source": "wifi",
          "scope": ""
        },
        {
          "type": "secrets",
          "name": "Pokémon Dream Radar",
          "description": "Le logiciel 3DS associé peut transférer des Pokémon vers Noir 2 et Blanc 2 avec les versions et consoles compatibles.",
          "when": "Connexion logicielle",
          "source": "events",
          "scope": ""
        },
        {
          "type": "secrets",
          "name": "Pokémon World Tournament",
          "description": "Un mode de combat post-Ligue réutilisable, indépendant des distributions événementielles.",
          "when": "Post Game",
          "source": "bw2",
          "scope": ""
        }
      ]
    },
    "13": {
      "intro": "Kalos propose boutiques changeantes, rubans, rencontres propres aux jours et distributions de la sixième génération.",
      "entries": [
        {
          "type": "routines",
          "name": "Boutiques de Kalos",
          "description": "Les vêtements des boutiques peuvent changer d'un jour à l'autre ; retourne voir les collections pour de nouvelles pièces.",
          "when": "Quotidien",
          "source": "xy",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Hôtels et rubans",
          "description": "Des personnages et donneurs de rubans apparaissent selon le jour ou l'hôtel ; garde une liste par ville.",
          "when": "Hebdomadaire",
          "source": "xy",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Activités d'Illumis",
          "description": "Services, petits boulots et rencontres conditionnelles constituent une tournée à compléter après déblocage.",
          "when": "Quotidien / conditionnel",
          "source": "xy",
          "scope": ""
        },
        {
          "type": "echanges",
          "name": "Échanges et cadeaux de Kalos",
          "description": "Différencie les Pokémon obtenus par PNJ, les cadeaux de scénario et les espèces exclusives X ou Y.",
          "when": "Permanent",
          "source": "trades",
          "scope": ""
        },
        {
          "type": "echanges",
          "name": "Safari des Amis",
          "description": "Les espèces accessibles dépendent des amis enregistrés et des conditions de connexion, pas d'un jour fixe.",
          "when": "Connexion / amis",
          "source": "xy",
          "scope": ""
        },
        {
          "type": "distributions",
          "name": "Diancie et autres Pokémon fabuleux",
          "description": "Les premières distributions de Diancie sont liées à des événements, dates et pays précis ; la simple présence du Pokédex ne donne pas accès au Pokémon.",
          "when": "Historique",
          "source": "events",
          "scope": ""
        },
        {
          "type": "secrets",
          "name": "Méga-Gemmes et horaires",
          "description": "Certaines Méga-Gemmes demandent d'avoir avancé l'après-Ligue et dépendent d'une plage horaire définie dans les jeux.",
          "when": "Conditionnel",
          "source": "xy",
          "scope": ""
        }
      ]
    },
    "14": {
      "intro": "Hoenn version 3DS : mirages quotidiens, Bases Secrètes, avantages hebdomadaires et distributions régionales.",
      "entries": [
        {
          "type": "routines",
          "name": "Lavandia : restauration et combats",
          "description": "Le Food Court, les massages et certains défis renouvellent leurs possibilités selon le jour.",
          "when": "Quotidien",
          "source": "oras",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Sites Mirage",
          "description": "Un nouveau site Mirage peut être disponible chaque jour lors de l'exploration céleste, avec des Pokémon ou objets particuliers.",
          "when": "Quotidien",
          "source": "oras",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Marché de Poivressel",
          "description": "Les vitamines font l'objet d'une vente promotionnelle le lundi au marché de Poivressel.",
          "when": "Lundi",
          "source": "oras",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Nénucrique et bases secrètes",
          "description": "Une vente d'objets de Base Secrète peut être organisée le samedi sur le toit du Centre Commercial.",
          "when": "Samedi",
          "source": "oras",
          "scope": ""
        },
        {
          "type": "echanges",
          "name": "Échanges et Pokémon fixes de Hoenn",
          "description": "Les échanges PNJ, rencontres uniques et cadeaux de scénario doivent être archivés version par version.",
          "when": "Permanent",
          "source": "trades",
          "scope": ""
        },
        {
          "type": "echanges",
          "name": "Passe Éon / StreetPass",
          "description": "Le Passe Éon permet une rencontre supplémentaire dans les jeux compatibles via une distribution historique et des mécanismes de transmission comme StreetPass.",
          "when": "Historique / transfert local",
          "source": "events",
          "scope": ""
        },
        {
          "type": "distributions",
          "name": "Diancie chromatique japonais",
          "description": "Diancie chromatique OT ポケセン (ID 12125) a été distribué au Japon du 12 au 31 décembre 2015, pour Rubis Oméga et Saphir Alpha. Ce n'est pas une distribution active.",
          "when": "12–31 déc. 2015 · Japon",
          "source": "shinyDiancie",
          "scope": "Japon seulement"
        },
        {
          "type": "distributions",
          "name": "Autres Cadeaux Mystère ROSA",
          "description": "Pour chaque événement, relever date, pays, version acceptée, mode de distribution, DO et numéro d'identification lorsque documentés.",
          "when": "Archives",
          "source": "events",
          "scope": ""
        },
        {
          "type": "secrets",
          "name": "Les différences entre les deux versions",
          "description": "Rubis Oméga et Saphir Alpha ne donnent pas les mêmes rencontres et légendaires. Les fiches de provenance doivent rester distinctes.",
          "when": "Permanent",
          "source": "oras",
          "scope": ""
        }
      ]
    },
    "15": {
      "intro": "Alola mêle les activités quotidiennes à un cycle de jours lié au Scanner des Îles.",
      "entries": [
        {
          "type": "routines",
          "name": "Scanner des Îles",
          "description": "Les codes QR accumulent des points pour déclencher le Scanner ; l'espèce rencontrée dépend notamment de l'île et du jour.",
          "when": "Selon le jour",
          "source": "alola",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Cafés et objets d'Alola",
          "description": "Les cafés de Centres Pokémon, les arbres à Baies et divers services offrent de petits avantages récurrents.",
          "when": "Quotidien",
          "source": "alola",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Poké Loisir",
          "description": "Les îlots permettent des activités liées au temps d'attente et aux ressources, distinctes d'un calendrier fixe.",
          "when": "Cycles internes",
          "source": "alola",
          "scope": ""
        },
        {
          "type": "echanges",
          "name": "Échanges et cadeaux d'Alola",
          "description": "Les échanges internes et les Pokémon fixes ont leurs propres conditions d'obtention, parfois différentes entre Soleil et Lune.",
          "when": "Permanent",
          "source": "trades",
          "scope": ""
        },
        {
          "type": "distributions",
          "name": "Marshadow et autres promotions 7G",
          "description": "Les événements de Marshadow et d'autres Pokémon fabuleux étaient limités à des campagnes et régions définies.",
          "when": "Historique",
          "source": "events",
          "scope": ""
        },
        {
          "type": "secrets",
          "name": "Fuseau horaire interne et versions",
          "description": "La version Lune inverse certaines périodes jour/nuit par rapport à Soleil : vérifier les horaires en jeu plutôt que son horloge personnelle.",
          "when": "Selon la version",
          "source": "alola",
          "scope": ""
        }
      ]
    },
    "16": {
      "intro": "Les versions Ultra enrichissent Alola avec l'Ultra-Brèche, les nouvelles activités et les anciens Cadeaux Mystère.",
      "entries": [
        {
          "type": "routines",
          "name": "Scanner des Îles",
          "description": "Utilise les codes QR et la rotation par jour et par île pour rechercher des Pokémon non rencontrés normalement.",
          "when": "Selon le jour",
          "source": "alola",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Quêtes et ressources quotidiennes",
          "description": "Les restaurants, ressources et services d'Alola méritent une tournée propre aux versions Ultra.",
          "when": "Quotidien",
          "source": "alola",
          "scope": ""
        },
        {
          "type": "echanges",
          "name": "Échanges et rencontres Ultra",
          "description": "Consigne les Pokémon de PNJ, les cadeaux et les rencontres des Ultra-Brèches comme des origines distinctes.",
          "when": "Permanent",
          "source": "trades",
          "scope": ""
        },
        {
          "type": "distributions",
          "name": "Zeraora et anciennes distributions",
          "description": "Zeraora a fait l'objet d'opérations promotionnelles dans des régions et périodes précises ; vérifier la fiche historique avant de l'ajouter au Living Dex.",
          "when": "Historique",
          "source": "events",
          "scope": ""
        },
        {
          "type": "secrets",
          "name": "Ultra-Brèches et légendaires",
          "description": "L'exploration interdimensionnelle donne accès à des rencontres particulières, parfois conditionnées par l'équipe ou la version.",
          "when": "Post Game",
          "source": "events",
          "scope": ""
        },
        {
          "type": "secrets",
          "name": "Surf Démanta",
          "description": "Les parcours et les récompenses de Surf Démanta restent des activités de jeu, non des distributions réseau.",
          "when": "Permanent",
          "source": "events",
          "scope": ""
        }
      ]
    },
    "17": {
      "intro": "Kanto modernisé : champions à réaffronter, interactions avec Pokémon GO et cadeaux liés à des accessoires.",
      "entries": [
        {
          "type": "routines",
          "name": "Revanches des Champions",
          "description": "Après l'aventure, certains Champions sont de nouveau affrontables, selon les conditions du jeu.",
          "when": "Récurrent",
          "source": "trades",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Objets et fossiles à retrouver",
          "description": "Revisite les zones de Kanto avec tes techniques secrètes pour collecter les espèces et objets non obtenus.",
          "when": "Permanent",
          "source": "trades",
          "scope": ""
        },
        {
          "type": "echanges",
          "name": "Pokémon GO Park",
          "description": "Certaines espèces peuvent être transférées de Pokémon GO vers Let's Go via un mécanisme dédié ; attention au caractère non réversible de ces transferts.",
          "when": "Transfert compatible",
          "source": "events",
          "scope": ""
        },
        {
          "type": "echanges",
          "name": "Mew et Poké Ball Plus",
          "description": "Un Mew pouvait être offert avec une Poké Ball Plus neuve selon les conditions prévues ; ce n'est pas une rencontre disponible à volonté.",
          "when": "Accessoire / achat initial",
          "source": "events",
          "scope": ""
        },
        {
          "type": "distributions",
          "name": "Distributions événementielles Let's Go",
          "description": "Les distributions liées à la période de sortie et à certains points de vente sont archivées, avec leur langue et leur mode de réception.",
          "when": "Historique",
          "source": "events",
          "scope": ""
        },
        {
          "type": "secrets",
          "name": "Échanges internes",
          "description": "Des PNJ de Kanto échangent des Pokémon et proposent notamment des formes régionales ; relever le lieu et l'espèce demandée.",
          "when": "Permanent",
          "source": "trades",
          "scope": ""
        }
      ]
    },
    "18": {
      "intro": "Galar multiplie les rendez-vous quotidiens et les activités connectées, sans confondre raids permanents et événements limités.",
      "entries": [
        {
          "type": "routines",
          "name": "Loto-ID",
          "description": "Les PC des Centres Pokémon proposent une loterie d'identifiants avec des récompenses selon les correspondances.",
          "when": "Quotidien",
          "source": "swsh",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Cafés Combat",
          "description": "Différents cafés de Galar proposent des combats dans la limite prévue par jour.",
          "when": "Quotidien",
          "source": "swsh",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Arbres à Baies",
          "description": "Les arbres à Baies se renouvellent et peuvent provoquer une rencontre ; penser à la tournée des routes.",
          "when": "Quotidien",
          "source": "swsh",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Antres de raids",
          "description": "Les antres et leurs apparitions sont gérés par le jeu ; les événements de raids en ligne suivent d'autres règles et périodes.",
          "when": "Récurrent / événementiel",
          "source": "swsh",
          "scope": ""
        },
        {
          "type": "echanges",
          "name": "Échanges internes et Pokémon offerts",
          "description": "Un PNJ peut proposer un échange, un don ou un Pokémon avec des caractéristiques fixées ; noter la version et la région.",
          "when": "Permanent",
          "source": "trades",
          "scope": ""
        },
        {
          "type": "distributions",
          "name": "Zarude et cadeaux en série",
          "description": "De nombreuses campagnes ont distribué des Pokémon avec un code et des fenêtres d'éligibilité. Les codes anciens ne restent pas valables indéfiniment.",
          "when": "Historique",
          "source": "events",
          "scope": ""
        },
        {
          "type": "secrets",
          "name": "Isolarmure et Couronneige",
          "description": "Les deux extensions ajoutent des quêtes, rencontres et ressources à documenter séparément, sans les confondre avec un événement limité.",
          "when": "DLC permanent",
          "source": "swsh",
          "scope": ""
        }
      ]
    },
    "19": {
      "intro": "Sinnoh refait sur Switch, avec les rendez-vous classiques et plusieurs événements internet à durée limitée.",
      "entries": [
        {
          "type": "routines",
          "name": "Baudrive le vendredi",
          "description": "Le rendez-vous du Parc Éolien revient le vendredi, après avoir rempli les prérequis de l'histoire.",
          "when": "Vendredi",
          "source": "platinum",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Essaims et Jardin Trophée",
          "description": "Les espèces disponibles changent selon les mécanismes quotidiens de Sinnoh.",
          "when": "Quotidien",
          "source": "platinum",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Baies, rubans et habitants",
          "description": "Les dons de Baies et certains rubans répondent à des jours ou cycles spécifiques.",
          "when": "Quotidien / hebdomadaire",
          "source": "calendar",
          "scope": ""
        },
        {
          "type": "echanges",
          "name": "Échanges internes",
          "description": "Documente les échanges PNJ et les Pokémon fixes des remakes ; leur disponibilité ne dépend pas d'une distribution internet.",
          "when": "Permanent",
          "source": "trades",
          "scope": ""
        },
        {
          "type": "distributions",
          "name": "Lettre de Chen et Carte Membre",
          "description": "Shaymin et Darkrai ont été associés à des cadeaux limités de 2022 pour ces remakes ; l'absence de l'objet empêche le déclenchement normal de ces événements.",
          "when": "Historique 2022",
          "source": "events",
          "scope": ""
        },
        {
          "type": "secrets",
          "name": "Parc Rosa Rugosa et connexions",
          "description": "Les légendaires et objets de progression du Parc Rosa Rugosa se débloquent par l'exploration et des conditions internes au jeu.",
          "when": "Post Game",
          "source": "events",
          "scope": ""
        },
        {
          "type": "secrets",
          "name": "Arceus et Légendes : Arceus",
          "description": "La rencontre d'Arceus sur BDSP demande une progression et une sauvegarde compatibles de Légendes : Arceus.",
          "when": "Conditionnel",
          "source": "events",
          "scope": ""
        }
      ]
    },
    "20": {
      "intro": "Hisui privilégie les cycles de jeu, les recherches, les missions et les rencontres particulières.",
      "entries": [
        {
          "type": "routines",
          "name": "Distorsions spatio-temporelles",
          "description": "Ces phénomènes apparaissent en exploration selon les mécanismes du jeu, avec espèces et ressources particulières.",
          "when": "Cycle de jeu",
          "source": "events",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Apparitions massives",
          "description": "Certaines apparitions changent après les voyages ou opérations ; consulter la carte avant chaque expédition.",
          "when": "Récurrent",
          "source": "events",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Ferme, artisanat et récoltes",
          "description": "Entre deux sorties, exploite les plantations, les ressources et le crafting pour maintenir le stock.",
          "when": "Récurrent",
          "source": "events",
          "scope": ""
        },
        {
          "type": "echanges",
          "name": "Manaphy et Phione",
          "description": "Une quête secondaire spécifique, La Légende des Mers, permet de rencontrer Manaphy et Phione après plusieurs conditions.",
          "when": "Quête unique",
          "source": "events",
          "scope": ""
        },
        {
          "type": "echanges",
          "name": "Shaymin et Darkrai via sauvegardes",
          "description": "Certaines missions se débloquent si des sauvegardes compatibles d'autres jeux Pokémon sont présentes sur la console.",
          "when": "Données d'autres jeux",
          "source": "events",
          "scope": ""
        },
        {
          "type": "distributions",
          "name": "Cadeaux et distributions de sortie",
          "description": "Les objets et cadeaux promotionnels de lancement avaient leurs propres périodes : conserver la date et le moyen d'origine.",
          "when": "Historique",
          "source": "events",
          "scope": ""
        },
        {
          "type": "secrets",
          "name": "Pokédex de recherche",
          "description": "Le niveau des tâches d'étude et les missions à remplir servent d'objectifs permanents distincts des récompenses d'événements internet.",
          "when": "Permanent",
          "source": "events",
          "scope": ""
        }
      ]
    },
    "21": {
      "intro": "Paldea alterne contenus permanents, raids et événements internet à durée déterminée, avec deux extensions.",
      "entries": [
        {
          "type": "routines",
          "name": "Raids Téracristal",
          "description": "Les raids ordinaires se renouvellent dans le jeu. Les raids 7★ et leurs Pokémon vedettes sont des événements réseau ponctuels.",
          "when": "Quotidien / événementiel",
          "source": "events",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Apparitions massives",
          "description": "Les populations de Pokémon et apparitions massives changent selon les cycles internes du jeu.",
          "when": "Quotidien",
          "source": "events",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Enchères de Porto Marinada",
          "description": "Les lots disponibles évoluent et certains objets nécessitent d'avoir rempli des prérequis particuliers.",
          "when": "Récurrent",
          "source": "events",
          "scope": ""
        },
        {
          "type": "echanges",
          "name": "Échanges internes et légendaires",
          "description": "Les cadeaux, échanges et rencontres fixes de Paldea et des DLC doivent être classés séparément des distributions reçues par code.",
          "when": "Permanent",
          "source": "trades",
          "scope": ""
        },
        {
          "type": "distributions",
          "name": "Raids événementiels et Cadeaux Mystère",
          "description": "Le Pokémon, le niveau et la durée des événements peuvent changer. Une fiche datée et une source officielle sont nécessaires avant d'annoncer une disponibilité.",
          "when": "Variable / daté",
          "source": "events",
          "scope": ""
        },
        {
          "type": "secrets",
          "name": "Masque Turquoise et Disque Indigo",
          "description": "Les extensions ajoutent des lieux, quêtes, échanges et espèces propres. Distingue les activités permanentes de l'actualité temporaire.",
          "when": "DLC permanent",
          "source": "events",
          "scope": ""
        }
      ]
    },
    "22": {
      "intro": "Illumis vit au rythme du jour et de la nuit ; la Méga-Dimension ajoute de nouvelles missions et rencontres.",
      "entries": [
        {
          "type": "routines",
          "name": "Jour, nuit et Royale Z-A",
          "description": "La journée et la nuit constituent des phases de jeu différentes. Les zones de combat du Royale Z-A sont liées au cycle nocturne.",
          "when": "Cycle jour/nuit interne",
          "source": "za",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Pokémon selon la période",
          "description": "Plusieurs espèces et missions ne se rencontrent qu'à certaines phases du jour ou de la nuit dans Illumis.",
          "when": "Selon le cycle",
          "source": "za",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Missions secondaires d'Illumis",
          "description": "Les quêtes et Pokémon associés se débloquent au fil des objectifs de l'aventure.",
          "when": "Progression",
          "source": "za",
          "scope": ""
        },
        {
          "type": "echanges",
          "name": "Échanges, cadeaux et Méga-Évolutions",
          "description": "Consigne les rencontres fixes, missions donnant des Pokémon et méthodes d'obtention des Méga-Gemmes séparément.",
          "when": "Permanent / conditionnel",
          "source": "events",
          "scope": ""
        },
        {
          "type": "distributions",
          "name": "Pérégrain événementiel d'automne 2026",
          "description": "Distribution officielle de Pérégrain annoncée le 29 octobre 2026, avec réception possible jusqu'au 19 novembre 2026 à 01:59 UTC.",
          "when": "29 oct.–19 nov. 2026",
          "source": "zavivi",
          "scope": "Disponibilité à vérifier selon l'heure UTC"
        },
        {
          "type": "secrets",
          "name": "Méga-Dimension et Hoopa",
          "description": "Le contenu additionnel Méga-Dimension ajoute des missions et explorations autour d'Hoopa, distinctes du Royale Z-A.",
          "when": "DLC",
          "source": "zadlc",
          "scope": ""
        }
      ]
    },
    "23": {
      "intro": "Un agenda vivant : les saisons, études, raids et distributions changent. Vérifier l'état présent avant d'annoncer un événement.",
      "entries": [
        {
          "type": "routines",
          "name": "Séries de capture et PokéStops",
          "description": "Les récompenses quotidiennes encouragent à capturer au moins un Pokémon et à faire tourner un PokéStop chaque jour.",
          "when": "Quotidien",
          "source": "goguide",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Études de terrain",
          "description": "Des missions peuvent être obtenues via les PokéStops ; vérifier la découverte et les tâches dans l'onglet Aujourd'hui.",
          "when": "Quotidien",
          "source": "goguide",
          "scope": ""
        },
        {
          "type": "routines",
          "name": "Études et bonus saisonniers",
          "description": "Les bonus hebdomadaires, raids et études sont révisés par la saison : ne pas fixer un calendrier permanent sans source actuelle.",
          "when": "Variable",
          "source": "go",
          "scope": ""
        },
        {
          "type": "echanges",
          "name": "Échanges entre joueurs",
          "description": "Les échanges requièrent des conditions de proximité, d'amitié et de ressources, différentes d'un échange automatique avec un PNJ.",
          "when": "Selon conditions",
          "source": "goguide",
          "scope": ""
        },
        {
          "type": "echanges",
          "name": "Meltan et connexion Let's Go / HOME",
          "description": "Certaines interactions avec des jeux liés ou Pokémon HOME ont joué un rôle dans l'obtention de Meltan ; vérifier le mécanisme actuellement proposé.",
          "when": "Connexion entre jeux",
          "source": "events",
          "scope": ""
        },
        {
          "type": "distributions",
          "name": "Community Days et événements temporaires",
          "description": "Les horaires, bonus et espèces des événements Pokémon GO changent régulièrement et sont annoncés via les canaux officiels.",
          "when": "Calendrier dynamique",
          "source": "go",
          "scope": ""
        },
        {
          "type": "secrets",
          "name": "Raids, Routes et études spéciales",
          "description": "Ces contenus coexistent avec les événements limités ; vérifier dans l'application ce qui est permanent, disponible ou expiré.",
          "when": "Selon disponibilité",
          "source": "goguide",
          "scope": ""
        }
      ]
    }
  },
  "audit": {
    "method": "Édition fondée sur une sélection de faits historiques avec sources prioritaires Pokébip. Les 153 notices d'origine ne constituent pas un relevé complet et toutes leurs affirmations n'ont pas été auditées individuellement.",
    "reviewedAt": "2026-11-09",
    "coverage": "partielle"
  }
};
