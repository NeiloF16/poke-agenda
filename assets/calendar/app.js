/* Poké Agenda V4.1 — application calendrier, recherches, guides et favoris.
 * Les données des jeux sont fournies par games.js (pas de requête API à chaque visite).
 */
const GAMES = window.POKE_AGENDA_GAMES;
if (!Array.isArray(GAMES) || !GAMES.length) {
  throw new Error("Catalogue Poké Agenda manquant : assets/calendar/games.js");
}

const TOTAL_ARTICLES=Object.values(window.POKE_GLOSSARY?.games||{}).reduce((n,g)=>n+(g.entries?.length||0),0);
const GEN_NAMES={1:'Kanto',2:'Johto',3:'Hoenn',4:'Sinnoh',5:'Unys',6:'Kalos',7:'Alola',8:'Galar & Hisui',9:'Paldea & Illumis'};
const ic=name=>`<span class="icon"><svg><use href="#i-${name}"/></svg></span>`;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const byId=id=>GAMES.find(g=>g.id===Number(id));
const DATE_KEY=()=>{const n=new Date();return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;};
function getLocal(k,def){try{const x=localStorage.getItem('poke-v2-'+k);return x===null?def:JSON.parse(x);}catch{return def;}}
function setLocal(k,v){try{localStorage.setItem('poke-v2-'+k,JSON.stringify(v))}catch{}}
let favorites=getLocal('favorites',[]), checked=getLocal('checks',{}), notes=getLocal('notes',{}), last=getLocal('last',null);
let requestedView=new URLSearchParams(location.search).get('view');
let view=['library','events','calendar'].includes(requestedView)?requestedView:'dashboard',
  genFilter=0,searchQuery='',weekDay=new Date().getDay(),eventTab='active',routineGameId=0;
function todayChecked(){return checked[DATE_KEY()]||[];}
function isDone(id){return todayChecked().includes(id);}
function mark(id){let all=todayChecked().slice();all=all.includes(id)?all.filter(x=>x!==id):[...all,id];checked[DATE_KEY()]=all;setLocal('checks',checked);render();refreshReader();}
function isFav(id){return favorites.includes(id)}
function toggleFav(id){favorites=isFav(id)?favorites.filter(x=>x!==id):[...favorites,id];setLocal('favorites',favorites);render();refreshReader();}
// Les rendez-vous affichés dans le calendrier viennent désormais du glossaire
// écrit. Il n'y a plus de listes doublonnées entre affiches et fiches.
const GLOSSARY_GAMES = window.POKE_GLOSSARY?.games || {};
const WEEKDAY_TOKENS = [
 ['dimanche','dim.'], ['lundi','lun.'], ['mardi','mar.'],
 ['mercredi','mer.'], ['jeudi','jeu.'], ['vendredi','ven.'],
 ['samedi','sam.']
];
function guideRoutine(gameId,entry){
  return {id:Number(gameId),title:entry.name,text:entry.description,when:entry.when};
}
function timedRoutines(day){
  const words=WEEKDAY_TOKENS[day]||[];
  const result=[];
  for(const [gameId,guide] of Object.entries(GLOSSARY_GAMES)){
    for(const entry of guide.entries||[]){
      if(entry.type!=='routines')continue;
      const when=norm(entry.when);
      if(words.some(token=>when.includes(token)))result.push(guideRoutine(gameId,entry));
    }
  }
  return result;
}
function routineEvents(){
  const result=[];
  for(const [gameId,guide] of Object.entries(GLOSSARY_GAMES)){
    for(const entry of guide.entries||[]){
      if(entry.type==='routines'&&/quotidien|chaque jour|recurrent|cycle de jeu/i.test(norm(entry.when))){
        result.push(guideRoutine(gameId,entry));
      }
    }
  }
  return result;
}
const DAYS=['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
const MONTHS=new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long'});
function trackerVersionLinks(game){
  const versions=window.POKE_TRACKER_RULES?.DEX_DEFS?.[game.id]?.versions||[];
  return '<div class="tracker-version-links">'+versions.map(version=>
    '<a class="go-tracker" href="suivi.html?game='+Number(game.id)+
    '&amp;version='+encodeURIComponent(version)+'">☑ '+esc(version)+' →</a>'
  ).join('')+'</div>';
}
function gameCard(g){return `<article class="game-card"><div class="game-cover" data-open="${g.id}" role="button" tabindex="0" aria-label="Ouvrir ${esc(g.name)}"><img src="${g.cover}" alt="Paysage pixel-art : ${esc(g.region)}" loading="lazy"><span class="gen-pill">GEN ${g.gen}</span><button class="fav ${isFav(g.id)?'active':''}" aria-label="${isFav(g.id)?'Retirer des favoris':'Ajouter aux favoris'}" data-favorite="${g.id}">${ic('heart')}</button></div><div class="game-body"><div class="game-region">${esc(g.region)}</div><h3 data-open="${g.id}">${esc(g.name)}</h3><div class="game-sub">${esc(g.subtitle)}</div><div class="game-bottom"><span class="page-count">${ic('book')} ${window.POKE_GLOSSARY?.games?.[g.id]?.entries?.length||0} articles</span><button class="go-card" data-open="${g.id}">Lire le glossaire →</button></div>${Number(g.id)<23?trackerVersionLinks(g):""}${isDone(g.id)?`<span class="status-chip">${ic('check')} Fait aujourd’hui</span>`:''}</div></article>`}
function eventCard(e,i){let g=byId(e.id);return `<article class="event-card"><div class="event-tag">${ic('spark')} ${esc(g.name)} · ${esc(g.region)}</div><h3>${esc(e.title)}</h3><p>${esc(e.text)}</p><div class="event-foot"><span>${esc(e.when||'À consulter')}</span><button class="event-link" data-open="${g.id}" data-page="${e.page??0}">Lire le glossaire →</button></div></article>`;}
function gameSection(title,desc,items,limit=0){let arr=limit?items.slice(0,limit):items;return `<section class="section"><div class="section-head"><div><div class="section-kicker">BIBLIOTHÈQUE</div><h2>${title}</h2><p class="section-sub">${desc}</p></div>${limit?'<button class="link-button" data-view="library">Voir les 23 jeux →</button>':''}</div>${arr.length?`<div class="games-grid">${arr.map(gameCard).join('')}</div>`:`<div class="empty"><h3>Aucun jeu trouvé</h3><p>Essaye un autre filtre ou ajoute des favoris.</p></div>`}</section>`}
function dailyEvents(){
  const scheduled=timedRoutines(new Date().getDay());
  const daily=routineEvents();
  const offset=(new Date().getDate()*3)%Math.max(1,daily.length);
  return [...scheduled.slice(0,3),...daily.slice(offset).concat(daily.slice(0,offset))].slice(0,4);
}
function hero(){return `<section class="hero"><div><div class="eyebrow">${ic('spark')} POKÉ-AGENDA</div><h1>Chaque jour,<br><span>une nouvelle aventure.</span></h1><p>Retrouve les événements quotidiens et hebdomadaires des jeux Pokémon dans une bibliothèque de glossaires écrits et sourcés. Explore les régions et organise tes visites.</p><div class="hero-actions"><button class="solid-btn" data-view="library">${ic('book')} Explorer le glossaire ${ic('arrow')}</button><button class="ghost-btn" data-action="random">${ic('random')} Choix surprise</button><a class="solid-btn" href="suivi.html">${ic('check')} Suivre mes Pokémon</a></div></div><div class="hero-miku" title="Hatsune Miku, mascotte pixel-art"><img src="assets/miku.webp?v=2" alt="Hatsune Miku en pixel-art" loading="eager" decoding="async" onload="this.parentElement.classList.add('ready')" onerror="this.parentElement.classList.remove('ready');const n=+(this.dataset.retries||0);if(n<12){this.dataset.retries=n+1;const img=this;setTimeout(()=>{if(img.isConnected)img.src='assets/miku.webp?retry='+Date.now()},4000)}"><span>♪ MIKU</span></div><div class="hero-mini"><div class="mini-label">Progression du jour</div><div class="mini-number">${todayChecked().length}<span> / ${GAMES.length}</span></div><div class="meter"><div style="width:${todayChecked().length/GAMES.length*100}%"></div></div><div class="mini-foot">Une petite aventure à la fois. ${todayChecked().length===23?'Bravo, collection complète !':'Coche les jeux consultés aujourd’hui.'}</div></div></section>`}
function metrics(){return `<div class="metric-row"><div class="metric"><div class="metric-symbol">${ic('book')}</div><div><strong>${GAMES.length}</strong><small>jeux</small></div></div><div class="metric"><div class="metric-symbol">${ic('image')}</div><div><strong>${TOTAL_ARTICLES}</strong><small>articles du glossaire</small></div></div></div>`}
const EVENT_ENGINE=window.POKE_EVENT_ENGINE;
const ARCHIVE_SOURCES=window.POKE_DIST_ARCHIVES?.sources||{};
const FULL_ARCHIVES=window.POKE_DIST_ARCHIVES?.records||[];
const EVENT_DAY_NAMES=['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
function linkSafe(url) {
  return typeof url==='string'&&/^https:\/\/(?:www\.)?(?:pokebip\.com|pokemon\.com|legends\.pokemon\.com)\//.test(url)?url:'';
}
function datedEventCard(event) {
  const status=EVENT_ENGINE?.classify(event)||'unknown';
  const labels={active:'En cours',past:'Terminé',upcoming:'À venir',unknown:'Date à vérifier'};
  const name=(event.gameIds||[]).map(id=>byId(id)?.name).filter(Boolean).join(' · ');
  const start=EVENT_ENGINE?.formatDate(event.start)||event.start;
  const end=EVENT_ENGINE?.formatDate(event.end)||event.end;
  const note=event.endHourUTC?' · fin '+esc(event.endHourUTC)+' UTC':'';
  return '<article class="live-event-card"><div class="live-event-top"><span class="live-status '+status+'">'+
    esc(labels[status])+'</span><span class="live-kind">'+esc(event.type||'Événement')+'</span></div>'+
    '<div class="live-game">'+esc(name)+'</div><h3>'+esc(event.title)+'</h3>'+
    '<p>'+esc(event.description||'')+'</p>'+
    '<div class="live-event-period"><strong>Du '+esc(start)+' au '+esc(end)+note+'</strong></div>'+
    '<div class="live-event-bottom">'+
    (event.code?'<span class="live-code">Code : '+esc(event.code)+'</span>':'')+
    (linkSafe(event.source)?'<a href="'+esc(event.source)+'" target="_blank" rel="noopener noreferrer">Source vérifiée ↗</a>':'')+
    (event.gameIds?.[0]?'<a href="jeu.html?game='+Number(event.gameIds[0])+'#archives">Voir le jeu →</a>':'')+
    '</div></article>';
}
function archiveEventCard(record) {
  const id=record.games?.[0];
  const link=record.directSource||ARCHIVE_SOURCES[record.source]?.url||'';
  return '<article class="live-event-card archive-item"><div class="live-game">'+
    esc((record.games||[]).map(id=>byId(id)?.name).filter(Boolean).join(' · '))+
    '</div><h3>'+esc(record.name)+'</h3><p>'+esc(record.detail)+'</p>'+
    '<div class="live-event-period">Période documentée : <strong>'+esc(record.period||'À préciser')+'</strong>'+
    '<div>'+esc(record.region||'')+' · '+esc(record.method||'')+'</div></div>'+
    (record.ot||record.tid?'<div class="live-event-period">'+(record.ot?'DO : '+esc(record.ot)+' ':'')+
      (record.tid?'· ID : '+esc(record.tid):'')+'</div>':'')+
    '<div class="live-event-bottom">'+
    (linkSafe(link)?'<a href="'+esc(link)+'" target="_blank" rel="noopener noreferrer">Archive Pokébip ↗</a>':'')+
    (id?'<a href="jeu.html?game='+Number(id)+'#archives">Glossaire →</a>':'')+
    '</div></article>';
}
function pokebipNewsPanel(max=4){
  const latest=window.POKE_EVENT_NEWS?.items||[];
  const selection=latest.filter(item=>linkSafe(item.url)).filter(item=>
    !searchQuery||norm(item.title).includes(norm(searchQuery))).slice(0,max);
  return '<section class="section"><div class="section-head"><div>'+
    '<div class="section-kicker">VEILLE DES ACTUALITÉS POKÉBIP</div>'+
    '<h2>Annonces à vérifier</h2><p class="section-sub">Titres et liens du flux RSS. Une annonce n’est pas automatiquement une distribution en cours.</p>'+
    '</div><a class="link-button" href="https://www.pokebip.com/news" target="_blank" rel="noopener noreferrer">Voir Pokébip ↗</a></div>'+
    '<div class="news-list">'+(selection.length?selection.map(item=>
      '<a class="news-row" href="'+esc(item.url)+'" target="_blank" rel="noopener noreferrer">'+
      '<span class="news-row-date">'+esc(item.date)+'</span><strong>'+esc(item.title)+'</strong><span>↗</span></a>'
    ).join(''):'<div class="empty">Aucune annonce récente disponible dans le cache.</div>')+
    '</div><p class="section-sub">Dernière synchronisation des titres : '+esc(window.POKE_EVENT_NEWS?.updatedAt||"inconnue")+
    '. Les événements actifs au-dessus disposent de dates vérifiées séparément.</p></section>';
}
function hubPreview(){
  const now=EVENT_ENGINE?.current()||[];
  const past=(EVENT_ENGINE?.past()||[]).slice().sort((a,b)=>b.end.localeCompare(a.end)).slice(0,2);
  const body=now.length?now.slice(0,4).map(datedEventCard).join(''):
    '<div class="empty">Aucun événement actuellement confirmé dans les périodes documentées. Consulte Pokébip pour les nouveautés.</div>';
  return '<section class="section" id="actualites"><div class="section-head"><div>'+
    '<div class="section-kicker">DISTRIBUTIONS ET ÉVÉNEMENTS · FRANCE</div>'+
    '<h2>En cours maintenant <span class="live-counter">'+now.length+'</span></h2>'+
    '<p class="section-sub">Fenêtres de réception vérifiées au '+esc(EVENT_ENGINE?.reviewedAt||'non renseigné')+
    '. Le statut évolue automatiquement avec la date.</p></div>'+
    '<button class="link-button" data-view="events">Tout l’historique →</button></div>'+
    '<div class="live-event-grid">'+body+'</div>'+
    (past.length?'<div class="section-head" style="margin-top:22px"><div>'+
      '<div class="section-kicker">POUR LA COLLECTION ET PKHEX</div>'+
      '<h2>Récemment terminés</h2><p class="section-sub">Les périodes restent consultables après expiration.</p></div></div>'+
      '<div class="live-event-grid">'+past.map(datedEventCard).join('')+'</div>':'')+
    '</section>';
}
function eventDesk(){
  const active=EVENT_ENGINE?.current()||[];
  const past=EVENT_ENGINE?.past()||[];
  const upcoming=EVENT_ENGINE?.upcoming()||[];
  const unknown=EVENT_ENGINE?.undated()||[];
  let values=eventTab==='active'?active:eventTab==='past'?past:eventTab==='upcoming'?upcoming:[...active,...upcoming,...past];
  const search=norm(searchQuery);
  values=values.filter(e=>!search||norm(e.title+' '+e.description+' '+e.region).includes(search));
  const historical=(eventTab==='past'||eventTab==='all')?FULL_ARCHIVES.filter(r=>
    !search||norm(r.name+' '+r.detail+' '+r.region+' '+r.period+' '+r.ot+' '+r.tid).includes(search)):[];
  return '<section class="section"><div class="section-kicker">ARCHIVES FRANÇAISES · POKÉ AGENDA</div>'+
    '<h2>Événements Pokémon et distributions</h2>'+
    '<p class="section-sub">Périodes de distribution et raids en cours, à venir ou expirés. Les anciennes distributions provenant de l’Evendex restent consultables pour la collection et PKHeX.</p>'+
    '<p class="live-disclaimer">Les dates affichées sont les fenêtres documentées, pas une garantie de légalité PKHeX. Contrôle aussi DO/ID, version, carte miracle, provenance et éventuels changements de date de console.</p>'+
    '<div class="live-tabs">'+[
      ['active','En cours · '+active.length],['past','Terminés · '+(past.length+FULL_ARCHIVES.length)],['upcoming','À venir · '+upcoming.length],['all','Tout consulter']
    ].map(([key,label])=>'<button class="chip '+(eventTab===key?'selected':'')+
      '" data-event-tab="'+key+'">'+esc(label)+'</button>').join('')+'</div>'+
    '<p class="section-sub">Source principale : <a href="https://www.pokebip.com/page/jeux-video/evendex/accueil" target="_blank" rel="noopener noreferrer">Evendex Pokébip ↗</a>. '+esc(unknown.length)+
      ' dossiers sans date de fin certaine ne sont pas considérés automatiquement comme actifs.</p>'+
    '<div class="live-event-grid">'+(values.length?values.map(datedEventCard).join(''):
      '<div class="empty">Aucun événement daté pour ce filtre.</div>')+'</div>'+
    (historical.length?'<div class="section-head" style="margin-top:35px"><div><div class="section-kicker">ARCHIVES HISTORIQUES</div>'+
      '<h2>'+historical.length+' dossiers avec période conservée</h2>'+
      '<p class="section-sub">Notices locales sélectionnées ; consulte la source Pokébip pour toutes les variantes, dates et régions.</p>'+
      '</div></div><div class="live-event-grid">'+historical.map(archiveEventCard).join('')+'</div>':'')+
    (unknown.length?'<div class="section-head" style="margin-top:32px"><div><h2>Événements sans fin annoncée</h2>'+
      '<p class="section-sub">Statut à vérifier en jeu : ils ne sont pas annoncés comme actifs sans contrôle.</p></div></div>'+
      '<div class="live-event-grid">'+unknown.map(e=>archiveEventCard({games:e.gameIds,name:e.title,detail:e.description,
        period:'Sans date de fin confirmée',region:e.region,method:e.method,directSource:e.source})).join('')+'</div>':'')+
    '</section>'+pokebipNewsPanel(25);
}
function routineDayCard(entry) {
  return '<article class="event-card"><div class="event-tag">'+esc((entry.games||[]).map(id=>byId(id)?.name).filter(Boolean).join(' / '))+
    '</div><h3>'+esc(entry.title)+'</h3><p>'+esc(entry.detail)+'</p>'+
    '<div class="event-foot"><span>'+esc(entry.place)+' · '+(entry.freq==='daily'?'Chaque jour':'Jour de semaine')+'</span>'+
    '<a class="event-link" href="'+esc(linkSafe(entry.source))+'" target="_blank" rel="noopener noreferrer">Pokébip ↗</a></div></article>';
}
function dashboard(){const entries=dailyEvents();return `${hero()}${metrics()}${hubPreview()}${pokebipNewsPanel()}<section class="section"><div class="section-head"><div><div class="section-kicker">LE CALENDRIER</div><h2>À découvrir aujourd’hui <span style="color:var(--acid)">✦</span></h2><p class="section-sub">${MONTHS.format(new Date())} </p></div><button class="link-button" data-view="calendar">Voir la semaine →</button></div><div class="today-grid">${entries.map(eventCard).join('')}</div></section>${last&&byId(last.id)?`<section class="section" style="margin-top:26px"><button class="ghost-btn" data-open="${last.id}" data-page="${last.page}">${ic('book')} Reprendre : ${esc(byId(last.id).name)} ${ic('arrow')}</button></section>`:''}${gameSection('Toutes les générations au même endroit','Explore les régions et retrouve les articles écrits et sourcés de chaque jeu.',GAMES,6)}`}
function genChips(){let ary=[{id:0,name:'Toutes'},...Array.from({length:9},(_,i)=>({id:i+1,name:`${i+1}G · ${GEN_NAMES[i+1]}`}))];return `<div class="filterbar">${ary.map(x=>`<button class="chip ${genFilter===x.id?'selected':''}" data-gen="${x.id}">${esc(x.name)}</button>`).join('')}<span class="filter-end">${GAMES.filter(g=>(genFilter===0||g.gen===genFilter)&&norm(g.name+' '+g.region+' '+g.subtitle).includes(norm(searchQuery))).length} résultats</span></div>`}
function library(favesOnly=false){let items=GAMES.filter(g=>(!favesOnly||isFav(g.id))&&(genFilter===0||g.gen===genFilter)&&norm(g.name+' '+g.region+' '+g.subtitle).includes(norm(searchQuery)));return `<section class="section" style="margin-top:6px"><div class="section-head"><div><div class="section-kicker">${favesOnly?'FAVORIS':'TOUTES LES GÉNÉRATIONS'}</div><h2>${favesOnly?'Tes favoris':'Glossaire par jeu'}</h2><p class="section-sub">${favesOnly?'Les jeux que tu souhaites retrouver rapidement.':'23 jeux ou duos · rendez-vous réguliers · distributions et Pokémon spéciaux.'}</p></div><button class="small-btn" data-action="random">${ic('random')} Surprends-moi</button></div>${genChips()}${items.length?`<div class="games-grid">${items.map(gameCard).join('')}</div>`:`<div class="empty"><h3>${favesOnly?'Pas encore de favoris':'Aucun résultat'}</h3><p>${favesOnly?'Clique sur le cœur des jeux pour les retrouver ici.':'Modifie la recherche ou le filtre de génération.'}</p></div>`}</section>`}
function calendar(){let today=new Date().getDay(),events=(EVENT_ENGINE?.routineDay(weekDay,routineGameId)||[]);return `<section class="section" style="margin-top:5px"><div class="section-kicker">RENDEZ-VOUS HEBDOMADAIRES</div><h2>Le calendrier Pokémon</h2><p class="section-sub">Choisis un jour et un jeu pour afficher tous les rendez-vous documentés, avec leur source Pokébip.</p><div class="calendar-game-picker"><label for="routineGameFilter">Afficher les activités de</label><select id="routineGameFilter"><option value="0">Tous les jeux</option>${GAMES.filter(g=>Number(g.id)!==23).map(g=>'<option value="'+g.id+'" '+(routineGameId===g.id?'selected':'')+'>'+esc(g.name)+'</option>').join('')}</select><span class="section-sub">${events.length} activité(s) documentée(s)</span></div><div style="margin-top:25px" class="week-switch">${[1,2,3,4,5,6,0].map(d=>`<button class="week-day ${weekDay===d?'active':''} ${today===d?'today':''}" data-day="${d}"><span>${d===today?'Aujourd’hui':'Calendrier'}</span><strong>${DAYS[d]}</strong></button>`).join('')}</div><div class="week-content">${events.length?events.map(routineDayCard).join(''):'<div class="empty">Aucune activité quotidienne ou hebdomadaire documentée pour ce filtre.</div>'}</div></section><section class="section"><div class="section-head"><div><div class="section-kicker">LES BASES</div><h2>Les petites routines qui ne changent pas</h2><p class="section-sub">Quelques idées quotidiennes, quel que soit le jour.</p></div></div><div class="today-grid">${routineEvents().slice(0,10).map(eventCard).join('')}</div></section>`}
function render(){const bc={dashboard:'Vue d’ensemble',library:'Bibliothèque',calendar:'Calendrier',events:'Événements',favorites:'Mes favoris'};document.getElementById('breadcrumb').textContent=bc[view];document.querySelectorAll('.sidebar .nav').forEach(n=>n.classList.toggle('active',Boolean(n.dataset.view===view||(n.dataset.gen&&view==='library'&&Number(n.dataset.gen)===genFilter))));document.getElementById('favCount').textContent=favorites.length;document.getElementById('pageContent').innerHTML=view==='dashboard'?dashboard():view==='library'?library():view==='calendar'?calendar():view==='events'?eventDesk():library(true);}
function openView(v){view=v;genFilter=0;if(v!=='library'&&v!=='favorites'&&v!=='events'){searchQuery='';document.getElementById('globalSearch').value='';}render();closeMenu();window.scrollTo({top:0,behavior:'smooth'});}
function genView(g){genFilter=Number(g);view='library';render();closeMenu();window.scrollTo({top:0,behavior:'smooth'});}
function renderGenNav(){document.getElementById('genNav').innerHTML=Object.keys(GEN_NAMES).map(g=>`<button class="nav" data-gen="${g}"><span style="display:inline-block;color:#77998a;font-weight:900;min-width:20px">${g}</span>${GEN_NAMES[g]}<span class="nav-badge">${GAMES.filter(x=>x.gen===+g).length}</span></button>`).join('')}
function openGame(id){
  const game=byId(id);
  if(!game)return;
  last={id:game.id,page:0};
  setLocal('last',last);
  location.href='jeu.html?game='+Number(game.id)+'#routines';
}
function refreshReader(){ /* Ancien lecteur remplacé par le glossaire écrit. */ }
function closeMenu(){document.getElementById('sidebar').classList.remove('open');document.getElementById('menuBackdrop').classList.remove('visible')}
function randomGame(){const g=GAMES[Math.floor(Math.random()*GAMES.length)];openGame(g.id)}
function downloadBackup(){let data={kind:'poke-agenda-backup',version:1,date:new Date().toISOString(),favorites,checked,notes,last};let blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});let href=URL.createObjectURL(blob);let link=document.createElement('a');link.href=href;link.download='poke_agenda_mes_donnees.json';link.click();setTimeout(()=>URL.revokeObjectURL(href),1000)}
function importBackup(file){if(!file)return;file.text().then(txt=>{let obj=JSON.parse(txt);if(obj.kind!=='poke-agenda-backup')throw Error('Fichier non reconnu');favorites=Array.isArray(obj.favorites)?obj.favorites:[];checked=obj.checked&&typeof obj.checked==='object'?obj.checked:{};notes=obj.notes&&typeof obj.notes==='object'?obj.notes:{};last=obj.last||null;setLocal('favorites',favorites);setLocal('checks',checked);setLocal('notes',notes);setLocal('last',last);render();refreshReader();alert('Tes favoris, coches et notes ont été importés.');}).catch(()=>alert('Impossible de lire ce fichier de sauvegarde.'));}
document.addEventListener('click',e=>{
  let x=e.target.closest('[data-view]');if(x){openView(x.dataset.view);return}
  x=e.target.closest('[data-gen]');if(x){genView(x.dataset.gen);return}
  x=e.target.closest('[data-favorite]');if(x){toggleFav(Number(x.dataset.favorite));return}
  x=e.target.closest('[data-open]');if(x){openGame(Number(x.dataset.open));return}
  x=e.target.closest('[data-day]');if(x){weekDay=Number(x.dataset.day);render();return}
  x=e.target.closest('[data-event-tab]');if(x){eventTab=x.dataset.eventTab;render();return}
  x=e.target.closest('[data-action]');if(!x)return;
  let a=x.dataset.action;
  if(a==='random')randomGame();
  else if(a==='export')downloadBackup();
  else if(a==='import')document.getElementById('importInput').click();
});
document.getElementById('globalSearch').addEventListener('input',e=>{searchQuery=e.target.value;if(view!=='events')view='library';render();});
document.addEventListener('change',e=>{
  if(e.target?.id==='routineGameFilter'){routineGameId=Number(e.target.value)||0;render();}
});
document.getElementById('openMenu').addEventListener('click',()=>{document.getElementById('sidebar').classList.add('open');document.getElementById('menuBackdrop').classList.add('visible')});document.getElementById('menuBackdrop').addEventListener('click',closeMenu);
document.getElementById('importInput').addEventListener('change',e=>{importBackup(e.target.files[0]);e.target.value='';});
document.addEventListener('keydown',e=>{
  if((e.key==='Enter'||e.key===' ')&&e.target.matches('.game-cover[role="button"]')){
    e.preventDefault();openGame(Number(e.target.dataset.open));
  }
});
renderGenNav();render();
/* Le JSON raw GitHub reflète la veille RSS, y compris lorsque Pages n'a pas encore
 * reconstruit son HTML après un commit automatisé. Cache local en secours.
 */
fetch("https://raw.githubusercontent.com/NeiloF16/poke-agenda/main/assets/calendar/news-watch.json",{cache:"no-store"})
  .then(r=>{if(!r.ok)throw new Error("News unavailable");return r.json()})
  .then(v=>{
    if(!v||!Array.isArray(v.items)||!v.items.every(x=>typeof x.title==="string"&&linkSafe(x.url)))return;
    window.POKE_EVENT_NEWS=v;
    if(view==='dashboard'||view==='events')render();
  }).catch(()=>{ /* Le snapshot local reste affiché hors connexion. */ });

// Local backup controls in sidebar, added last to keep the interface light.
const backup=document.createElement('div');backup.innerHTML='<div class="nav-heading" style="margin-top:25px">Tes données</div><button class="nav" data-action="export">'+ic('save')+' Exporter ma progression</button><button class="nav" data-action="import">'+ic('down')+' Importer une sauvegarde</button>';document.getElementById('sidebar').insertBefore(backup,document.querySelector('.side-bottom'));

// Mise à jour automatique des ressources : pas de vidage manuel du cache.
// GitHub Pages sert des fichiers statiques ; une vérification HEAD avec une URL
// de contrôle unique permet de détecter les nouvelles versions sans télécharger les images.
(() => {
  const CHECK_EVERY_MS = 5 * 60 * 1000;
  const baseAsset = url => String(url || '').split('?')[0].split('#')[0];
  const signatures = new Map();
  let lastCheck = 0;
  let checking = false;
  let htmlSignature = null;
  let pendingHtmlRefresh = false;

  function signatureOf(response) {
    const etag = response.headers.get('etag');
    if (etag) return etag;
    const modified = response.headers.get('last-modified');
    const bytes = response.headers.get('content-length') || '';
    return modified ? modified + '/' + bytes : '';
  }

  function changeAssetURL(base,version){
    const next=base+'?v='+encodeURIComponent(version);
    for(const game of GAMES)if(baseAsset(game.cover)===base)game.cover=next;
    for(const img of document.querySelectorAll('img[src]'))
      if(baseAsset(img.getAttribute('src'))===base&&img.getAttribute('src')!==next)img.src=next;
  }

  async function checkAsset(base) {
    try {
      // GET du fichier image évité : HEAD ne télécharge pas son contenu.
      const response = await fetch(base + '?_check=' + Date.now(), {method:'HEAD',cache:'no-store'});
      if (!response.ok) return;
      const signature = signatureOf(response) || 'slot-' + Math.floor(Date.now() / 600000);
      if (signatures.get(base) === signature) return;
      signatures.set(base, signature);
      // La nouvelle URL versionnée contourne les anciennes images en cache.
      changeAssetURL(base, signature);
    } catch (error) {
      // Hors connexion ou ouverture via file:// : ne pas interrompre le site.
    }
  }

  async function checkHtml() {
    try {
      const response = await fetch('index.html?_check=' + Date.now(), {method:'HEAD',cache:'no-store'});
      if (!response.ok) return;
      const signature = signatureOf(response);
      if (!signature) return;
      if (htmlSignature === null) { htmlSignature = signature; return; }
      if (signature !== htmlSignature) {
        htmlSignature = signature;
        pendingHtmlRefresh = true;
      }
      if (pendingHtmlRefresh) {
        // Éviter de recharger la page pendant la saisie d'une note ou d'une recherche.
        const active = document.activeElement;
        if (active && active.matches('textarea,input,[contenteditable="true"]')) return;
        const next = new URL(location.href);
        next.searchParams.set('version', signature.replace(/[^a-zA-Z0-9]/g, '').slice(0,32));
        location.replace(next.toString());
      }
    } catch (error) {}
  }

  async function checkAllUpdates(force = false) {
    if (document.visibilityState === 'hidden' || checking) return;
    if (!force && Date.now() - lastCheck < 90000) return;
    checking = true;
    lastCheck = Date.now();
    try {
      // Les 23 couvertures ne représentent que de petites requêtes HEAD.
      const bases = [...new Set(GAMES.map(g => baseAsset(g.cover)))];
      for (let i = 0; i < bases.length; i += 6) {
        await Promise.all(bases.slice(i, i + 6).map(checkAsset));
      }
      await checkHtml();
    } finally { checking = false; }
  }


  // Les nouveaux visiteurs obtiennent les images fraîches dès l'ouverture.
  setTimeout(() => checkAllUpdates(true), 800);
  // Les personnes qui laissent le site ouvert reçoivent les changements.
  setInterval(() => checkAllUpdates(true), CHECK_EVERY_MS);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkAllUpdates(false);
  });
  window.addEventListener('focus', () => checkAllUpdates(false));
})();
