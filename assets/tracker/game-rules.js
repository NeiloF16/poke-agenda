/* Poké Agenda V4.1 — règles des jeux et objectifs de progression.
 * Modifier les listes ici sans toucher au moteur d'affichage ou à la sauvegarde cloud.
 * Les clés et identifiants sont conservés pour ne pas invalider les JSON V3/V4.
 */
window.POKE_TRACKER_RULES = (() => {
  "use strict";
const DEX_DEFS = {
  1:{versions:["Rouge","Bleu"],dex:[["Kanto",2]]},
  2:{versions:["Jaune"],dex:[["Kanto",2]]},
  3:{versions:["Or","Argent"],dex:[["Johto",3]]},
  4:{versions:["Cristal"],dex:[["Johto",3]]},
  5:{versions:["Rubis","Saphir"],dex:[["Hoenn",4],["National",386]]},
  6:{versions:["Émeraude"],dex:[["Hoenn",4],["National",386]]},
  7:{versions:["Rouge Feu","Vert Feuille"],dex:[["Kanto",2],["National",386]]},
  8:{versions:["Diamant","Perle"],dex:[["Sinnoh",5],["National",493]]},
  9:{versions:["Platine"],dex:[["Sinnoh étendu",6],["National",493]]},
  10:{versions:["HeartGold","SoulSilver"],dex:[["Johto",7],["National",493]]},
  11:{versions:["Noir","Blanc"],dex:[["Unys",8],["National",649]]},
  12:{versions:["Noir 2","Blanc 2"],dex:[["Unys étendu",9],["National",649]]},
  13:{versions:["X","Y"],dex:[["Kalos · régional",[12,13,14]],["Kalos centre",12],["Kalos littoral",13],["Kalos monts",14],["National",721]]},
  14:{versions:["Rubis Oméga","Saphir Alpha"],dex:[["Hoenn étendu",15],["National",721]]},
  15:{versions:["Soleil","Lune"],dex:[["Alola",16]]},
  16:{versions:["Ultra-Soleil","Ultra-Lune"],dex:[["Alola étendu",21]]},
  17:{versions:["Let's Go Pikachu","Let's Go Évoli"],dex:[["Kanto · Let's Go",26]]},
  18:{versions:["Épée","Bouclier"],dex:[["Galar",27],["Isolarmure · DLC",28],["Couronneige · DLC",29]]},
  19:{versions:["Diamant Étincelant","Perle Scintillante"],dex:[["Sinnoh",5],["National",493]]},
  20:{versions:["Légendes : Arceus"],dex:[["Hisui",30]]},
  21:{versions:["Écarlate","Violet"],dex:[["Paldea",31],["Septentria · DLC",32],["Institut Myrtille · DLC",33]]},
  22:{versions:["Légendes : Z-A"],dex:[["Illumis",34],["Extradimension · DLC",35]]}
};
const KANTO_GYM=["Badge Roche — Pierre","Badge Cascade — Ondine","Badge Foudre — Major Bob","Badge Prisme — Erika","Badge Âme — Koga","Badge Marais — Morgane","Badge Volcan — Auguste","Badge Terre — Giovanni"];
const JOHTO_GYM=["Badge Zéphyr — Albert","Badge Essaim — Hector","Badge Plaine — Blanche","Badge Brume — Mortimer","Badge Choc — Chuck","Badge Minéral — Jasmine","Badge Glacier — Frédo","Badge Lever — Sandra"];
const HOENN_GYM=["Badge Roche — Roxanne","Badge Poing — Bastien","Badge Dynamo — Voltère","Badge Chaleur — Adriane","Badge Balancier — Norman","Badge Plume — Alizée","Badge Esprit — Lévy et Tatia"];
const SINNOH_GYM=["Badge Charbon — Pierrick","Badge Forêt — Flo","Badge Pavé — Mélina","Badge Palustre — Lovis","Badge Fantôme — Kiméra","Badge Mine — Charles","Badge Glaçon — Gladys","Badge Phare — Tanguy"];
const EIGHT_BADGES=Array.from({length:8},(_,i)=>"Obtenir le badge n° "+(i+1));
const TASKS={
 1:{story:[...KANTO_GYM,"Vaincre la Ligue Pokémon et devenir Maître"],extra:["Capturer Artikodin","Capturer Électhor","Capturer Sulfura","Capturer Mewtwo","Explorer entièrement le Parc Safari","Compléter les échanges exclusifs de version"]},
 2:{story:[...KANTO_GYM,"Devenir Maître de la Ligue"],extra:["Capturer les trois oiseaux légendaires","Capturer Mewtwo","Obtenir les trois Pokémon de départ disponibles","Terminer le mini-jeu de Pikachu Surfeur (si accessible)"]},
 3:{story:[...JOHTO_GYM,"Battre le Conseil 4","Obtenir les 8 badges de Kanto","Battre Red au Mont Argent"],extra:["Capturer les légendaires de Johto","Capturer Lokhlass aux Caves Jumelles","Compléter les rencontres de la Fratrie des sept","Terminer les énigmes des Ruines d'Alpha"]},
 4:{story:[...JOHTO_GYM,"Battre le Conseil 4","Obtenir les 8 badges de Kanto","Battre Red au Mont Argent"],extra:["Rencontrer et capturer Suicune","Capturer les autres légendaires accessibles","Terminer les énigmes des Ruines d'Alpha","Obtenir les récompenses du jeu de Buena","Explorer le Club des Dresseurs de Jadielle"]},
 5:{story:[...HOENN_GYM,"Badge Pluie — Marc","Vaincre la Ligue Pokémon"],extra:["Capturer le légendaire de la version","Capturer Rayquaza","Résoudre les énigmes des trois Regis","Atteindre un objectif personnel à la Tour de Combat","Remporter un Concours Pokémon rang Master","Terminer toutes les épreuves de la Maison des Pièges"]},
 6:{story:[...HOENN_GYM,"Badge Pluie — Juan","Vaincre la Ligue Pokémon"],extra:["Capturer Rayquaza","Capturer les légendaires accessibles","Débloquer la Zone de Combat","Obtenir les 7 symboles argentés de la Zone de Combat","Obtenir les 7 symboles dorés de la Zone de Combat","Remporter un Concours rang Master","Terminer la Maison des Pièges"]},
 7:{story:[...KANTO_GYM,"Devenir Maître de la Ligue","Débloquer les Îles Sevii et le Pokédex national"],extra:["Terminer les quêtes des îles Sevii","Récupérer le Rubis et le Saphir pour Célio","Capturer les trois oiseaux légendaires","Capturer Mewtwo","Explorer la Grotte Azurée","Remporter les défis de la Tour Dresseurs"]},
 8:{story:[...SINNOH_GYM,"Vaincre la Ligue Pokémon","Obtenir le Pokédex national"],extra:["Visiter les trois lacs et rencontrer leurs légendaires","Capturer Dialga ou Palkia","Capturer Heatran","Capturer Giratina","Accéder au Parc des Combats","Remporter une série à la Tour de Combat","Explorer entièrement le Souterrain"]},
 9:{story:[...SINNOH_GYM,"Vaincre la Ligue Pokémon","Obtenir le Pokédex national"],extra:["Capturer Giratina dans le Monde Distorsion","Capturer Dialga et Palkia","Capturer Heatran","Débloquer la Zone de Combat","Obtenir les 5 photos argent de la Zone de Combat","Obtenir les 5 photos couleur de la Zone de Combat","Affronter tous les Champions au Café Combat","Compléter les concours Super Pokémon"]},
 10:{story:[...JOHTO_GYM,"Vaincre le Conseil 4","Obtenir les huit badges de Kanto","Vaincre Red au Mont Argent"],extra:["Capturer Ho-Oh et Lugia","Capturer les trois fauves légendaires","Débloquer la Zone de Combat","Obtenir les cinq symboles argent de la Zone de Combat","Obtenir les cinq symboles couleur de la Zone de Combat","Obtenir les records du Pokéathlon","Obtenir les numéros de tous les Champions d'Arène"]},
 11:{story:[...EIGHT_BADGES,"Vaincre N","Vaincre Ghetis","Vaincre Goyah (après l'histoire)"],extra:["Capturer Reshiram ou Zekrom","Capturer Kyurem","Capturer les trois génies des nuages accessibles","Affronter Cynthia à Vaguelone","Explorer toutes les zones après la Ligue","Terminer le Métro de Combat","Terminer les quêtes de la Ville Noire / Forêt Blanche"]},
 12:{story:[...EIGHT_BADGES,"Arrêter la Team Plasma","Vaincre la Ligue Pokémon"],extra:["Capturer le Kyurem de l'histoire","Capturer les légendaires accessibles","Remporter les principaux tournois du Pokémon World Tournament","Terminer l'Arbre Creux / Gratte-Ciel Noir","Débloquer les boutiques de l'Avenue Concorde","Explorer toutes les Antres Cachés","Vaincre les Boss du Métro de Combat"]},
 13:{story:[...EIGHT_BADGES,"Vaincre la Ligue Pokémon","Débloquer le Pokédex national"],extra:["Terminer l'histoire de Beladonis","Capturer Xerneas ou Yveltal","Capturer Zygarde","Capturer Mewtwo","Compléter la collecte des Méga-Gemmes disponibles","Gagner 50 combats consécutifs à la Maison de Combat","Atteindre le rang maximum au Château de Combat"]},
 14:{story:[...HOENN_GYM,"Badge Pluie","Vaincre la Ligue Pokémon","Terminer l'Épisode Delta"],extra:["Capturer Rayquaza et Deoxys","Débloquer l'Atoll de Combat","Remporter 50 combats consécutifs à la Maison de Combat","Explorer les zones Mirage","Obtenir toutes les Méga-Gemmes disponibles","Remporter des concours de rang Master","Créer une Super Base Secrète complète"]},
 15:{story:["Terminer les quatre Grandes Épreuves d'Alola","Réussir toutes les Épreuves insulaires","Devenir le premier Maître de la Ligue d'Alola"],extra:["Capturer Solgaleo ou Lunala","Capturer les quatre Gardiens","Vaincre Red ou Blue à l'Arbre de Combat","Obtenir 50 victoires consécutives à l'Arbre de Combat","Terminer les quêtes des Ultra-Chimères","Obtenir tous les Cristaux Z disponibles"]},
 16:{story:["Terminer les quatre Grandes Épreuves d'Alola","Réussir toutes les Épreuves insulaires","Vaincre Ultra-Necrozma","Remporter la Ligue Pokémon"],extra:["Terminer l'épisode Team Rainbow Rocket","Capturer les quatre Gardiens","Capturer les Ultra-Chimères accessibles","Atteindre 50 victoires à l'Arbre de Combat","Terminer toutes les planches de Surf Démanta","Compléter les missions du Scanner des Îles"]},
 17:{story:[...KANTO_GYM,"Battre la Ligue Pokémon"],extra:["Capturer Mewtwo","Vaincre Green, puis Red si accessible","Remporter les revanches des huit Champions","Obtenir les titres de Maître Pokémon pour les espèces disponibles","Obtenir les 153 entrées du Pokédex Let's Go (selon disponibilité)","Compléter une chaîne de captures de 31"]},
 18:{story:[...EIGHT_BADGES,"Remporter le Tournoi des Champions contre Tarak"],extra:["Terminer l'histoire des légendaires","Capturer Zacian ou Zamazenta","Terminer l'arc de Wushours (DLC Isolarmure)","Terminer la quête de Sylveroy (DLC Couronneige)","Terminer les expéditions avec les trois oiseaux de Galar","Capturer les Regis disponibles en Couronneige","Remporter le Tournoi des Stars de Galar","Terminer une série difficile à la Tour de Combat"]},
 19:{story:[...SINNOH_GYM,"Vaincre la Ligue Pokémon","Obtenir le Pokédex national"],extra:["Capturer Dialga ou Palkia","Capturer Giratina","Capturer Heatran","Explorer le Parc Rosa Rugosa et les légendaires accessibles","Remporter les revanches contre les huit Champions","Vaincre Cynthia lors d'une revanche avancée","Obtenir les records de la Tour de Combat","Terminer les Concours Pokémon"]},
 20:{story:["Terminer les missions principales du Groupe Galaxie","Rencontrer les Pokémon des cinq régions","Vaincre le dernier adversaire de l'histoire","Rencontrer et capturer Arceus"],extra:["Atteindre le niveau de recherche 10 pour chaque espèce","Compléter les entrées Pokédex au niveau Parfait","Terminer les quêtes secondaires","Débloquer toutes les Mégapparitions","Remporter le Défi Onirique","Capturer tous les Pokémon Barons disponibles"]},
 21:{story:["Obtenir les huit badges d'Arène","Battre les cinq Dominants","Vaincre les cinq bases Team Star","Terminer La Voie du Maître","Terminer le scénario du Cratère de Paldea"],extra:["Remporter le Tournoi de l'Académie","Terminer le Masque Turquoise (DLC)","Capturer Ogerpon (DLC)","Terminer le Disque Indigo (DLC)","Capturer Terapagos (DLC)","Terminer l'épilogue de Septentria","Compléter les quêtes Myrtille et invitations","Vaincre les raids Téracristal six étoiles","Terminer la quête des quatre Fléaux de Paldea"]},
 22:{story:["Terminer les missions principales à Illumis","Atteindre le rang A du Royale Z-A","Terminer l'histoire principale","Débloquer les Zones Sauvages disponibles"],extra:["Compléter la recherche de Méga-Gemmes","Capturer tous les Pokémon d'Illumis","Relever les défis du Royale Z-A infini","Terminer les quêtes secondaires d'Illumis","Terminer le scénario Méga-Dimension (DLC)","Compléter les expéditions d'Extra Illumis (DLC)","Compléter le Pokédex extradimensionnel (DLC)"]}
};
  return {DEX_DEFS,TASKS};
})();
