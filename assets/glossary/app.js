/* Poké Agenda — affichage des guides écrits.
 * Les anciennes PNG ne sont pas chargées ; seules les couvertures restent.
 * Les clefs de favoris/notes/marquages sont celles de la V4 pour compatibilité.
 */
"use strict";
(function(){
  const root=document.getElementById("glossaryApp");
  const games=window.POKE_AGENDA_GAMES||[];
  const database=window.POKE_GLOSSARY;
  const versions=window.POKE_TRACKER_RULES?.DEX_DEFS||{};
  const params=new URLSearchParams(location.search);
  const game=games.find(g=>g.id===Number(params.get("game")))||null;
  const escapeHtml=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const urlOk=v=>typeof v==="string"&&/^https:\/\/(?:www\.)?(?:serebii\.net|pokepedia\.fr|pokebip\.com|bulbapedia\.bulbagarden\.net|nintendo\.com|pokemon\.com|pokemongo\.com|scopelyexplore\.helpshift\.com|fr-americas-support\.nintendo\.com|en-americas-support\.nintendo\.com)\//.test(v);
  const localKey=name=>"poke-v2-"+name;
  function local(name,fallback){try{const value=JSON.parse(localStorage.getItem(localKey(name)));return value===null?fallback:value}catch{return fallback}}
  function store(name,data){try{localStorage.setItem(localKey(name),JSON.stringify(data))}catch{}}
  const labels={
    routines:["Activités régulières","Calendrier, journées, cycles internes et activités à revisiter."],
    echanges:["Échanges & Pokémon spéciaux","Échanges PNJ, transferts, cadeaux, Pokémon fixes et obtentions conditionnelles."],
    distributions:["Distributions & événements datés","Archives régionales et informations de disponibilité. Une ancienne distribution ne redevient pas active."],
    secrets:["Secrets, connexions & Post Game","Quêtes, DLC, matériel spécifique et autres particularités de chaque version."]
  };
  const order=["routines","echanges","distributions","secrets"];
  if(!database||!Array.isArray(games)||!game||!database.games?.[game.id]){
    root.innerHTML='<div class="empty">Ce jeu est introuvable. <a href="./">Retour à la bibliothèque</a>.</div>';return;
  }
  const data=database.games[game.id];
  const entries=Array.isArray(data.entries)?data.entries:[];
  const sources=database.references||{};
  let filter="";
  const grouped=Object.fromEntries(order.map(id=>[id,entries.filter(e=>e.type===id)]));
  const escaped=escapeHtml;
  const chapterCount=id=>grouped[id].length;
  function card(entry){
    const source=sources[entry.source];
    const historical=entry.type==="distributions"||/historique|arrêté|2015|2022|2014|2026/i.test(entry.when||"");
    return '<article class="entry" data-historical="'+historical+'"><div class="entry-tags">'+
      '<span class="tag">'+escaped(entry.when||"À consulter")+'</span>'+
      (entry.scope?'<span class="tag scope">'+escaped(entry.scope)+'</span>':'')+'</div>'+
      '<h3>'+escaped(entry.name)+'</h3><p>'+escaped(entry.description)+'</p>'+
      '<div class="entry-foot">'+(urlOk(source)?'<a href="'+escaped(source)+'" target="_blank" rel="noopener noreferrer">Source / approfondir ↗</a>':'')+
      '<span class="source-note">'+(historical?'Archive ou événement daté':'Information à vérifier selon la version')+'</span></div></article>';
  }

  const archive=window.POKE_DIST_ARCHIVES||null;
  const archiveRecords=archive?.records?.filter(item=>
    Array.isArray(item.games)&&item.games.includes(game.id))||[];
  const archiveMatches=item=>!filter||[
    item.name,item.period,item.region,item.method,item.detail,item.ot,item.tid
  ].some(value=>String(value||"").toLocaleLowerCase("fr").includes(filter));
  function archiveRecordCard(record){
    const source=archive.sources?.[record.source];
    return '<article class="archive-record">'+
      '<div class="entry-tags"><span class="tag">'+escaped(record.region)+'</span>'+
      '<span class="tag scope">'+escaped(record.method)+'</span></div>'+
      '<h3>'+escaped(record.name)+'</h3>'+
      '<p>'+escaped(record.detail)+'</p>'+
      '<div class="archive-facts"><span>Dates : <strong>'+escaped(record.period)+'</strong></span>'+
      (record.ot?'<span>DO : <strong>'+escaped(record.ot)+'</strong></span>':'')+
      (record.tid?'<span>ID : <strong>'+escaped(record.tid)+'</strong></span>':'')+
      '</div>'+
      (source&&urlOk(source.url)?'<a class="archive-link" href="'+escaped(source.url)+
        '" target="_blank" rel="noopener noreferrer">Vérifier sur Pokébip ↗</a>':'')+
      '</article>';
  }
  function archivePanel(){
    if(!archive)return '';
    const refs=(archive.perGame?.[game.id]||[])
      .map(key=>archive.sources?.[key]).filter(source=>source&&urlOk(source.url));
    const examples=archiveRecords.filter(archiveMatches);
    const links=refs.map(source=>
      '<a class="archive-source" href="'+escaped(source.url)+
      '" target="_blank" rel="noopener noreferrer"><span>↗</span><strong>'+
      escaped(source.title)+'</strong></a>').join('');
    if(filter&&!examples.length&&!refs.some(source=>source.title.toLocaleLowerCase('fr').includes(filter)))return '';
    return '<section class="archive-section" id="archives">'+
      '<div class="archive-heading"><div class="kicker">ARCHIVES · SOURCES PRIORITAIRES</div>'+
      '<h2>Inventaire des distributions Pokémon</h2>'+
      '<p>Répertoires de référence Pokébip pour consulter les événements officiels, y compris les distributions françaises, japonaises et mondiales. Les archives couvrent des générations entières : vérifie la compatibilité exacte de chaque jeu.</p></div>'+
      '<div class="archive-warning"><strong>Couverture éditoriale :</strong> '+escaped(archive.notice)+
      ' Références revues le '+escaped(archive.verifiedAt)+'.</div>'+
      '<h3 class="archive-subheading">Répertoires complets à consulter</h3>'+
      '<div class="archive-sources">'+links+'</div>'+
      '<div class="archive-heading" style="margin-top:28px">'+
      '<div class="kicker">EXEMPLES HISTORIQUES VÉRIFIÉS</div>'+
      '<h3>'+examples.length+' dossier'+(examples.length>1?'s':'')+' mis en avant pour ce jeu</h3>'+
      '<p>Cette sélection ne reprend pas toutes les fiches de Pokébip. Les liens ci-dessus mènent aux listes détaillées avec les autres distributions, DO, ID et caractéristiques.</p></div>'+
      (examples.length?'<div class="archive-record-grid">'+examples.map(archiveRecordCard).join('')+'</div>':
      '<div class="empty">Aucun exemple vérifié ne correspond à cette recherche. Consulte les répertoires de référence pour la liste détaillée.</div>')+
      '</section>';
  }
  function chapter(id){
    const matches=grouped[id].filter(e=>!filter||[e.name,e.description,e.when,e.scope].some(t=>String(t||"").toLocaleLowerCase("fr").includes(filter)));
    if(!matches.length&&filter)return "";
    return '<section class="chapter" id="'+id+'"><div class="chapter-head"><div class="kicker">CHAPITRE · '+chapterCount(id)+' ENTRÉES</div><h2>'+labels[id][0]+'</h2><p>'+labels[id][1]+'</p></div>'+
      '<div class="entry-grid">'+matches.map(card).join('')+'</div></section>';
  }
  function showChapters(){
    const html=order.map(id=>id==="distributions"?chapter(id)+archivePanel():chapter(id)).join("");
    document.getElementById("chapters").innerHTML=html||'<div class="empty">Aucun résultat. Essaie un autre mot-clé.</div>';
    const total=entries.filter(e=>!filter||[e.name,e.description,e.when,e.scope].some(t=>String(t||"").toLocaleLowerCase("fr").includes(filter))).length;
    const archiveHits=archiveRecords.filter(archiveMatches).length;
    document.getElementById("searchCount").textContent=(total+archiveHits)+" résultat"+(total+archiveHits>1?"s":"");
  }
  const editionLinks=(versions[game.id]?.versions||[]).map(name=>
    '<a class="btn secondary" href="suivi.html?game='+game.id+'&amp;version='+encodeURIComponent(name)+'">☑ Suivi '+escaped(name)+'</a>').join("");
  root.innerHTML=
    '<section class="hero"><img src="'+escaped(game.cover)+'" alt="" loading="eager"><div>'+
    '<div class="kicker">GLOSSAIRE POKÉMON · GÉNÉRATION '+Number(game.gen)+' · '+escaped(game.region)+'</div>'+
    '<h1>'+escaped(game.name)+'</h1><p>'+escaped(data.intro)+'</p>'+
    '<div class="hero-meta"><span>'+entries.length+' articles</span><span>Sources consultables</span><span>Disponibilités distinguées</span></div></div></section>'+
    '<div class="guide-actions"><select class="guide-picker" id="switchGame" aria-label="Choisir un jeu">'+
      games.map(g=>'<option value="'+g.id+'" '+(g.id===game.id?'selected':'')+'>'+escaped(g.name)+'</option>').join('')+
    '</select><button type="button" class="btn" id="favoriteToggle">♡ Favori</button>'+
    '<button type="button" class="btn" id="todayToggle">✓ Consulté aujourd’hui</button>'+editionLinks+'</div>'+
    '<div class="guidance"><span aria-hidden="true">⚠</span><div><strong>Information historique ≠ distribution active.</strong> Les conditions, dates, langues et régions importent. Notre base locale ne contient qu’une sélection des événements : consulte aussi les inventaires Pokébip liés dans chaque jeu.</div></div>'+
    '<nav class="jump" aria-label="Chapitres">'+order.map(id=>'<a href="#'+id+'">'+labels[id][0]+' <span>'+chapterCount(id)+'</span></a>').join('')+'</nav>'+
    '<div class="search-panel"><label for="guideSearch">Rechercher dans ce jeu</label><input type="search" id="guideSearch" placeholder="Ex. : Mew, échange, vendredi, Japon…"><output id="searchCount"></output></div>'+
    '<div id="chapters"></div>'+
    '<section class="notes"><h2>Mes notes sur '+escaped(game.name)+'</h2><p>Enregistrées localement, comme dans l’ancien lecteur. Elles sont conservées lors du passage aux guides écrits.</p><textarea id="guideNotes" maxlength="15000" placeholder="Ex. : Jirachi reçu sur Rubis, ticket encore manquant, échange à faire…"></textarea></section>'+
    '<section class="resources"><h2>Contribuer au glossaire</h2><p>Tu connais un échange oublié, une distribution française ou japonaise, un DO, une date ou un Pokémon de connexion GameCube ? <a href="https://github.com/NeiloF16/poke-agenda/issues" target="_blank" rel="noopener noreferrer">Propose l’ajout avec une source</a>. Chaque jeu a sa propre archive vérifiable.</p></section>';
  showChapters();
  const today=()=>new Date().getFullYear()+"-"+String(new Date().getMonth()+1).padStart(2,"0")+"-"+String(new Date().getDate()).padStart(2,"0");
  function updateControls(){
    const f=local("favorites",[]);
    const yes=Array.isArray(f)&&f.includes(game.id);
    document.getElementById("favoriteToggle").textContent=yes?"♥ Dans mes favoris":"♡ Ajouter aux favoris";
    document.getElementById("favoriteToggle").classList.toggle("active",yes);
    const checked=local("checks",{});
    const done=Array.isArray(checked[today()])&&checked[today()].includes(game.id);
    document.getElementById("todayToggle").textContent=done?"✓ Consulté aujourd’hui":"✓ Marquer consulté";
    document.getElementById("todayToggle").classList.toggle("active",done);
  }
  document.getElementById("switchGame").addEventListener("change",e=>{
    location.href="jeu.html?game="+Number(e.target.value);
  });
  document.getElementById("favoriteToggle").addEventListener("click",()=>{
    let fav=local("favorites",[]);if(!Array.isArray(fav))fav=[];
    fav=fav.includes(game.id)?fav.filter(x=>x!==game.id):[...fav,game.id];store("favorites",fav);updateControls();
  });
  document.getElementById("todayToggle").addEventListener("click",()=>{
    const checked=local("checks",{});
    const list=Array.isArray(checked[today()])?checked[today()]:[];
    checked[today()]=list.includes(game.id)?list.filter(x=>x!==game.id):[...list,game.id];
    store("checks",checked);updateControls();
  });
  document.getElementById("guideSearch").addEventListener("input",e=>{filter=e.target.value.trim().toLocaleLowerCase("fr");showChapters()});
  const allNotes=local("notes",{});
  document.getElementById("guideNotes").value=typeof allNotes[game.id]==="string"?allNotes[game.id]:"";
  document.getElementById("guideNotes").addEventListener("input",e=>{
    const saved=local("notes",{});saved[game.id]=e.target.value;store("notes",saved);
  });
  store("last",{id:game.id,page:0});
  updateControls();
})();
