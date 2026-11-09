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
let view='dashboard',genFilter=0,searchQuery='',weekDay=new Date().getDay();
function todayChecked(){return checked[DATE_KEY()]||[];}
function isDone(id){return todayChecked().includes(id);}
function mark(id){let all=todayChecked().slice();all=all.includes(id)?all.filter(x=>x!==id):[...all,id];checked[DATE_KEY()]=all;setLocal('checks',checked);render();refreshReader();}
function isFav(id){return favorites.includes(id)}
function toggleFav(id){favorites=isFav(id)?favorites.filter(x=>x!==id):[...favorites,id];setLocal('favorites',favorites);render();refreshReader();}
const WEEK=[
 [{id:3,title:'CT Retour / Frustration',text:'Centre Commercial de Doublonville, le dimanche.',page:1},{id:10,title:'CT Retour / Frustration',text:'Rendez-vous du dimanche à Doublonville.',page:1},{id:8,title:'Revanche du week-end',text:'Affronte ton rival à l’Aire de Combat.',page:2}],
 [{id:3,title:'Mélofée du Mont Sélénite',text:'Le lundi soir, pour la Pierre Lune.',page:1},{id:12,title:'Rencontres exclusives du lundi',text:'Moyade ou Gueriaigle selon la version.',page:5},{id:14,title:'Promotions à Poivressel',text:'Vitamines à prix réduit le lundi.',page:4}],
 [{id:3,title:'Concours de capture d’insectes',text:'Le mardi au Parc Naturel de Johto.',page:1},{id:13,title:'Motisma à l’Hôtel Désolation',text:'Une apparition du mardi à Kalos.',page:3},{id:10,title:'Concours d’insectes',text:'Le mardi au Parc Naturel.',page:1}],
 [{id:10,title:'Musique de Hoenn',text:'La radio de HGSS attire certaines espèces.',page:1},{id:11,title:'Café de la Grange',text:'Un rendez-vous du mercredi à Unys.',page:3},{id:12,title:'Café de la Grange',text:'À retrouver également dans les suites.',page:5}],
 [{id:12,title:'Rencontres exclusives du jeudi',text:'Vaututrice ou Moyade selon la version.',page:5},{id:13,title:'Branette au Village Pokémon',text:'Une apparition du jeudi à Kalos.',page:3},{id:10,title:'Musique de Sinnoh',text:'La radio de HGSS attire certaines espèces.',page:1}],
 [{id:3,title:'Lokhlass aux Caves Jumelles',text:'Un classique : chaque vendredi à Johto.',page:1},{id:8,title:'Baudrive au Parc Éolien',text:'Le vendredi, après libération du parc.',page:2},{id:11,title:'Mushana aux Vestiges du Rêve',text:'Le rendez-vous du vendredi à Unys.',page:3}],
 [{id:3,title:'Concours de capture d’insectes',text:'Le samedi au Parc Naturel.',page:1},{id:14,title:'Vente spéciale à Nénucrique',text:'Le samedi, des objets de Bases Secrètes.',page:4},{id:9,title:'Revanche contre le rival',text:'Le week-end, après déblocage.',page:3}]
];
const DAILY=[
 {id:21,title:'Raid Téracristal 6★',text:'Vérifier le raid du jour après déblocage.',page:0},
 {id:23,title:'Capture + PokéStop',text:'Entretenir les deux séries quotidiennes dans GO.',page:0},
 {id:6,title:'Loterie et récolte des Baies',text:'La petite tournée quotidienne de Hoenn.',page:0},
 {id:15,title:'Scanner des Îles',text:'Consulter la rencontre du jour et de ton île.',page:3},
 {id:18,title:'Cafés Combat',text:'Trois cafés, trois combats à tenter.',page:1},
 {id:13,title:'Loterie d’Illumis',text:'Un passage rapide pour une récompense.',page:0}
];
const DAYS=['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
const MONTHS=new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long'});
function trackerVersionLinks(game){
  const versions=window.POKE_TRACKER_RULES?.DEX_DEFS?.[game.id]?.versions||[];
  return '<div class="tracker-version-links">'+versions.map(version=>
    '<a class="go-tracker" href="suivi.html?game='+Number(game.id)+
    '&amp;version='+encodeURIComponent(version)+'">☑ '+esc(version)+' →</a>'
  ).join('')+'</div>';
}
function gameCard(g){return `<article class="game-card"><div class="game-cover" data-open="${g.id}" role="button" tabindex="0" aria-label="Ouvrir ${esc(g.name)}"><img src="${g.cover}" alt="Paysage pixel-art : ${esc(g.region)}" loading="lazy"><span class="gen-pill">GEN ${g.gen}</span><button class="fav ${isFav(g.id)?'active':''}" aria-label="${isFav(g.id)?'Retirer des favoris':'Ajouter aux favoris'}" data-favorite="${g.id}">${ic('heart')}</button></div><div class="game-body"><div class="game-region">${esc(g.region)}</div><h3 data-open="${g.id}">${esc(g.name)}</h3><div class="game-sub">${esc(g.subtitle)}</div><div class="game-bottom"><span class="page-count">${ic('image')} ${g.pages.length} ${g.pages.length>1?'pages':'page'}</span><button class="go-card" data-open="${g.id}">Lire le glossaire →</button></div>${Number(g.id)<23?trackerVersionLinks(g):""}${isDone(g.id)?`<span class="status-chip">${ic('check')} Fait aujourd’hui</span>`:''}</div></article>`}
function eventCard(e,i){let g=byId(e.id);return `<article class="event-card"><div class="event-tag">${ic('spark')} ${esc(g.name)} · ${esc(g.region)}</div><h3>${esc(e.title)}</h3><p>${esc(e.text)}</p><div class="event-foot"><span>Voir les conditions et sources</span><button class="event-link" data-open="${g.id}" data-page="${e.page??0}">Lire le glossaire →</button></div></article>`;}
function gameSection(title,desc,items,limit=0){let arr=limit?items.slice(0,limit):items;return `<section class="section"><div class="section-head"><div><div class="section-kicker">BIBLIOTHÈQUE</div><h2>${title}</h2><p class="section-sub">${desc}</p></div>${limit?'<button class="link-button" data-view="library">Voir les 23 jeux →</button>':''}</div>${arr.length?`<div class="games-grid">${arr.map(gameCard).join('')}</div>`:`<div class="empty"><h3>Aucun jeu trouvé</h3><p>Essaye un autre filtre ou ajoute des favoris.</p></div>`}</section>`}
function dailyEvents(){return [...WEEK[new Date().getDay()],...DAILY.slice(0,1)].slice(0,4)}
function hero(){return `<section class="hero"><div><div class="eyebrow">${ic('spark')} POKÉ-AGENDA</div><h1>Chaque jour,<br><span>une nouvelle aventure.</span></h1><p>Retrouve les événements quotidiens et hebdomadaires des jeux Pokémon dans une bibliothèque de glossaires écrits et sourcés. Explore les régions et organise tes visites.</p><div class="hero-actions"><button class="solid-btn" data-view="library">${ic('book')} Explorer le glossaire ${ic('arrow')}</button><button class="ghost-btn" data-action="random">${ic('random')} Choix surprise</button><a class="solid-btn" href="suivi.html">${ic('check')} Suivre mes Pokémon</a></div></div><div class="hero-miku" title="Hatsune Miku, mascotte pixel-art"><img src="assets/miku.webp?v=2" alt="Hatsune Miku en pixel-art" loading="eager" decoding="async" onload="this.parentElement.classList.add('ready')" onerror="this.parentElement.classList.remove('ready');const n=+(this.dataset.retries||0);if(n<12){this.dataset.retries=n+1;const img=this;setTimeout(()=>{if(img.isConnected)img.src='assets/miku.webp?retry='+Date.now()},4000)}"><span>♪ MIKU</span></div><div class="hero-mini"><div class="mini-label">Progression du jour</div><div class="mini-number">${todayChecked().length}<span> / ${GAMES.length}</span></div><div class="meter"><div style="width:${todayChecked().length/GAMES.length*100}%"></div></div><div class="mini-foot">Une petite aventure à la fois. ${todayChecked().length===23?'Bravo, collection complète !':'Coche les jeux consultés aujourd’hui.'}</div></div></section>`}
function metrics(){return `<div class="metric-row"><div class="metric"><div class="metric-symbol">${ic('book')}</div><div><strong>${GAMES.length}</strong><small>jeux</small></div></div><div class="metric"><div class="metric-symbol">${ic('image')}</div><div><strong>${TOTAL_ARTICLES}</strong><small>articles du glossaire</small></div></div></div>`}
function dashboard(){const entries=dailyEvents();return `${hero()}${metrics()}<section class="section"><div class="section-head"><div><div class="section-kicker">LE CALENDRIER</div><h2>À découvrir aujourd’hui <span style="color:var(--acid)">✦</span></h2><p class="section-sub">${MONTHS.format(new Date())} </p></div><button class="link-button" data-view="calendar">Voir la semaine →</button></div><div class="today-grid">${entries.map(eventCard).join('')}</div></section>${last&&byId(last.id)?`<section class="section" style="margin-top:26px"><button class="ghost-btn" data-open="${last.id}" data-page="${last.page}">${ic('book')} Reprendre : ${esc(byId(last.id).name)} · page ${(last.page||0)+1} ${ic('arrow')}</button></section>`:''}${gameSection('Toutes les générations au même endroit','Explore les régions et retrouve les guides illustrés de chaque jeu.',GAMES,6)}`}
function genChips(){let ary=[{id:0,name:'Toutes'},...Array.from({length:9},(_,i)=>({id:i+1,name:`${i+1}G · ${GEN_NAMES[i+1]}`}))];return `<div class="filterbar">${ary.map(x=>`<button class="chip ${genFilter===x.id?'selected':''}" data-gen="${x.id}">${esc(x.name)}</button>`).join('')}<span class="filter-end">${GAMES.filter(g=>(genFilter===0||g.gen===genFilter)&&norm(g.name+' '+g.region+' '+g.subtitle).includes(norm(searchQuery))).length} résultats</span></div>`}
function library(favesOnly=false){let items=GAMES.filter(g=>(!favesOnly||isFav(g.id))&&(genFilter===0||g.gen===genFilter)&&norm(g.name+' '+g.region+' '+g.subtitle).includes(norm(searchQuery)));return `<section class="section" style="margin-top:6px"><div class="section-head"><div><div class="section-kicker">${favesOnly?'FAVORIS':'TOUTES LES GÉNÉRATIONS'}</div><h2>${favesOnly?'Tes favoris':'Glossaire par jeu'}</h2><p class="section-sub">${favesOnly?'Les jeux que tu souhaites retrouver rapidement.':'23 jeux ou duos · rendez-vous réguliers · distributions et Pokémon spéciaux.'}</p></div><button class="small-btn" data-action="random">${ic('random')} Surprends-moi</button></div>${genChips()}${items.length?`<div class="games-grid">${items.map(gameCard).join('')}</div>`:`<div class="empty"><h3>${favesOnly?'Pas encore de favoris':'Aucun résultat'}</h3><p>${favesOnly?'Clique sur le cœur des jeux pour les retrouver ici.':'Modifie la recherche ou le filtre de génération.'}</p></div>`}</section>`}
function calendar(){let today=new Date().getDay(),events=WEEK[weekDay];return `<section class="section" style="margin-top:5px"><div class="section-kicker">RENDEZ-VOUS HEBDOMADAIRES</div><h2>Le calendrier Pokémon</h2><p class="section-sub">Choisis un jour pour voir quelques événements marquants. Les précisions et sources se trouvent dans le glossaire de chaque jeu.</p><div style="margin-top:25px" class="week-switch">${[1,2,3,4,5,6,0].map(d=>`<button class="week-day ${weekDay===d?'active':''} ${today===d?'today':''}" data-day="${d}"><span>${d===today?'Aujourd’hui':'Calendrier'}</span><strong>${DAYS[d]}</strong></button>`).join('')}</div><div class="week-content">${events.map(eventCard).join('')}</div></section><section class="section"><div class="section-head"><div><div class="section-kicker">LES BASES</div><h2>Les petites routines qui ne changent pas</h2><p class="section-sub">Quelques idées quotidiennes, quel que soit le jour.</p></div></div><div class="today-grid">${DAILY.map(eventCard).join('')}</div></section>`}
function render(){const bc={dashboard:'Vue d’ensemble',library:'Bibliothèque',calendar:'Calendrier',favorites:'Mes favoris'};document.getElementById('breadcrumb').textContent=bc[view];document.querySelectorAll('.sidebar .nav').forEach(n=>n.classList.toggle('active',Boolean(n.dataset.view===view||(n.dataset.gen&&view==='library'&&Number(n.dataset.gen)===genFilter))));document.getElementById('favCount').textContent=favorites.length;document.getElementById('pageContent').innerHTML=view==='dashboard'?dashboard():view==='library'?library():view==='calendar'?calendar():library(true);}
function openView(v){view=v;genFilter=0;if(v!=='library'&&v!=='favorites'){searchQuery='';document.getElementById('globalSearch').value='';}render();closeMenu();window.scrollTo({top:0,behavior:'smooth'});}
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
  x=e.target.closest('[data-action]');if(!x)return;
  let a=x.dataset.action;
  if(a==='random')randomGame();
  else if(a==='export')downloadBackup();
  else if(a==='import')document.getElementById('importInput').click();
});
document.getElementById('globalSearch').addEventListener('input',e=>{searchQuery=e.target.value;view='library';render();});
document.getElementById('openMenu').addEventListener('click',()=>{document.getElementById('sidebar').classList.add('open');document.getElementById('menuBackdrop').classList.add('visible')});document.getElementById('menuBackdrop').addEventListener('click',closeMenu);
document.getElementById('importInput').addEventListener('change',e=>{importBackup(e.target.files[0]);e.target.value='';});
document.addEventListener('keydown',e=>{
  if((e.key==='Enter'||e.key===' ')&&e.target.matches('.game-cover[role="button"]')){
    e.preventDefault();openGame(Number(e.target.dataset.open));
  }
});
renderGenNav();render();
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
