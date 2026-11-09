/* Poké Agenda V4 — Suivi local + cloud privé Discord, vitrines V3 conservées en lecture. */
"use strict";
const DATABASE = window.POKE_DATA;
const {DEX_DEFS,TASKS} = window.POKE_TRACKER_RULES || {};
if (!DEX_DEFS || !TASKS) throw new Error("Règles Pokémon indisponibles : assets/tracker/game-rules.js");
const GAME_LIST = Object.keys(DEX_DEFS).map(Number);
const SAVE_KEY="poke-agenda-tracker-v3";
const VIEW_KEY="poke-agenda-tracker-view-v3";
let store=loadStore(), gameId=Number(new URLSearchParams(location.search).get("game"))||Number(localStorage.getItem(VIEW_KEY))||1;
if(!GAME_LIST.includes(gameId))gameId=9;
let gameIndex=[],saveId="",dexIndex=0,filter="all",search="",limit=80,gameFilter=0;
function safe(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function norm(s){return String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()}
function loadStore(){try{const v=JSON.parse(localStorage.getItem(SAVE_KEY));return v&&v.version===3&&v.games&&typeof v.games==="object"?v:{version:3,games:{},active:{}}}catch{return{version:3,games:{},active:{}}}}
function saveStore(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(store));if(window.PokeCloud?.isEnabled?.())window.PokeCloud.queueSync();else window.PokeLive?.queueSync();return true}catch{alert("Impossible d'enregistrer : espace navigateur insuffisant. Exporte une sauvegarde JSON.");return false}}
function replaceStoreFromCloud(next){if(!next||next.version!==3||!next.games||typeof next.games!=="object")throw Error("Format cloud invalide.");store=next;try{localStorage.setItem(SAVE_KEY,JSON.stringify(store))}catch{}saveId=store.active?.[gameId]||"";render();}
function uid(){return "s"+Date.now().toString(36)+Math.random().toString(36).slice(2,8)}
function slots(id=gameId){if(!Array.isArray(store.games[id]))store.games[id]=[];return store.games[id]}
function getSlot(){const arr=slots();let picked=arr.find(s=>s.id===saveId);if(picked)return picked; if(!arr.length){const v=DEX_DEFS[gameId].versions[0];picked={id:uid(),version:v,name:v,owned:[],done:{},custom:[]};arr.push(picked);saveStore()} else picked=arr[0];saveId=picked.id;store.active[gameId]=saveId;return picked}
function selectGame(id){if(!DEX_DEFS[id])return;gameId=id;localStorage.setItem(VIEW_KEY,String(id));saveId=store.active[id]||"";dexIndex=0;filter="all";search="";limit=80;const u=new URL(location.href);u.searchParams.set("game",String(id));history.replaceState(null,"",u);render();document.getElementById("current-game").scrollIntoView({behavior:"smooth",block:"start"})}
function getDexes(){return DEX_DEFS[gameId].dex.map(([name,src],i)=>{const ids=Array.isArray(src)?src.flatMap(x=>DATABASE.dexes[x]||[]):src>100&&![2,3,4,5,6,7,8,9,12,13,14,15,16,21,26,27,28,29,30,31,32,33,34,35].includes(src)?Array.from({length:src},(_,i)=>i+1):(DATABASE.dexes[src]||[]);return{id:i,label:name,ids:Array.from(new Set(ids))}})}
function fullIds(def){const src=def[1];return typeof src==="number"&&src>=386?Array.from({length:src},(_,i)=>i+1):Array.from(new Set((Array.isArray(src)?src:[src]).flatMap(x=>DATABASE.dexes[x]||[])))}
function dexes(){return DEX_DEFS[gameId].dex.map(([label,source],i)=>({id:i,label,ids:fullIds([label,source])}))}
function goals(){const out=[];for(const [group,arr]of Object.entries(TASKS[gameId]||{})){arr.forEach((title,i)=>out.push({id:group+"-"+i,title,group}))}return out}
function doneCount(s){const all=goals().concat((s.custom||[]).map(x=>({id:x.id,title:x.title,group:"custom"})));const yes=all.filter(t=>!!s.done[t.id]).length;return{yes,total:all.length,percent:all.length?Math.round(100*yes/all.length):0}}
function owned(s){return new Set((s.owned||[]).map(Number).filter(x=>x>0&&x<=DATABASE.names.length))}
function nameOf(id){return DATABASE.names[id-1]||"#"+id}
function coverOf(id){return gameIndex.find(g=>g.id===id)?.cover||"assets/covers/"+String(id).padStart(2,"0")+".webp"}
function gameName(id){return gameIndex.find(g=>g.id===id)?.name || DEX_DEFS[id]?.versions.join(" / ")||"Jeu Pokémon"}
function gameTile(id){const arr=slots(id);const saved=arr.length;const pick=arr.find(s=>s.id===store.active[id])||arr[0];const c=pick?doneCountFor(id,pick):{percent:0};const dexid=DEX_DEFS[id].dex[0][1];const ids=fullIds(["",dexid]);const own=pick?owned(pick):new Set();const dexPct=ids.length?Math.round(ids.filter(i=>own.has(i)).length*100/ids.length):0;return '<button class="game-tile '+(gameId===id?"selected":"")+'" data-game="'+id+'"><img src="'+safe(coverOf(id))+'" loading="lazy" alt=""><strong>'+safe(gameName(id))+'</strong><small>GEN '+(gameIndex.find(g=>g.id===id)?.gen||"")+' · '+saved+' partie'+(saved>1?"s":"")+' · Dex '+dexPct+'% · Jeu '+c.percent+'%</small></button>'}
function doneCountFor(id,s){const arr=Object.entries(TASKS[id]||{}).flatMap(([group,titles])=>titles.map((_,i)=>group+"-"+i)).concat((s.custom||[]).map(x=>x.id));const yes=arr.filter(t=>s.done?.[t]).length;return{percent:arr.length?Math.round(100*yes/arr.length):0}}
function gameGallery(){const ids=GAME_LIST.filter(id=>!gameFilter||(gameIndex.find(g=>g.id===id)?.gen===gameFilter));const genButtons=['Toutes',...Array.from({length:9},(_,i)=>'GEN '+(i+1))].map((x,i)=>'<button class="chip '+(gameFilter===i?"active":"")+'" data-game-filter="'+i+'">'+x+'</button>').join("");return '<section class="section"><div class="section-title"><h2>Explorer les jeux</h2><span class="pill">22 jeux principaux / duos</span></div><div class="chips" style="margin-bottom:15px">'+genButtons+'</div><div class="game-grid">'+ids.map(gameTile).join("")+'</div></section>'}
function saveBar(s){const config=DEX_DEFS[gameId],opts=slots().map(a=>'<option value="'+safe(a.id)+'" '+(a.id===s.id?"selected":"")+'>'+safe(a.name)+' ('+safe(a.version)+')</option>').join("");return '<div class="savebar"><label for="saveSelect">Sauvegarde</label><select id="saveSelect">'+opts+'</select><label for="newVersion">Nouvelle version</label><select id="newVersion" class="new-version">'+config.versions.map(v=>'<option>'+safe(v)+'</option>').join("")+'</select><button class="green" data-action="new-save">+ Ajouter</button><button class="soft" data-action="rename-save">Renommer</button><button class="danger" data-action="delete-save">Supprimer</button></div>'}
function progressCard(label,yes,total,gold=false){const pct=total?Math.round(yes*100/total):0;return '<div class="progress-card"><small>'+safe(label)+'</small><strong>'+pct+' %</strong><div class="bar '+(gold?"gold":"")+'"><div style="width:'+pct+'%"></div></div><p>'+yes+' / '+total+' terminés</p></div>'}
function progressArea(s){const dx=dexes(),set=owned(s),regional=dx[0],regionalYes=regional.ids.filter(id=>set.has(id)).length, goalsProgress=doneCount(s),nat=dx.find(x=>x.label==="National"),secondary=nat||dx.find(x=>x.label.includes("DLC"));const secLabel=secondary?(secondary.label==="National"?"Pokédex national":secondary.label):"Pokédex principal";const secYes=secondary?secondary.ids.filter(x=>set.has(x)).length:regionalYes;const secTotal=secondary?secondary.ids.length:regional.ids.length;return '<div class="progress-grid">'+progressCard("Pokédex régional · "+regional.label,regionalYes,regional.ids.length)+progressCard(secLabel,secYes,secTotal)+progressCard("Progression du jeu · objectifs",goalsProgress.yes,goalsProgress.total,true)+'</div>'}
function activeDex(){const all=dexes();return all[Math.min(dexIndex,all.length-1)]}
function monHTML(id,pos,yes){const name=nameOf(id);const sprite='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-viii/icons/'+id+'.png';const fallback='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/'+id+'.png';return '<label class="mon '+(yes?"is-owned":"")+'"><input type="checkbox" data-species="'+id+'" '+(yes?"checked":"")+' aria-label="Possédé : '+safe(name)+'"><img loading="lazy" decoding="async" src="'+sprite+'" onerror="if(!this.dataset.fallback){this.dataset.fallback=1;this.src=\''+fallback+'\'}else{this.style.display=\'none\'}" alt=""><span class="species"><span class="number">#'+String(pos+1).padStart(3,"0")+' · Nat. '+String(id).padStart(4,"0")+'</span><span class="name species-name">'+safe(name)+'</span></span></label>'}
function dexBody(s){const d=activeDex();const seen=owned(s),items=d.ids.map((id,i)=>({id,i})).filter(x=>{if(filter==="owned"&&!seen.has(x.id))return false;if(filter==="missing"&&seen.has(x.id))return false;return !search||norm(nameOf(x.id)).includes(norm(search))||String(x.id).includes(search.replace("#",""))});const shown=items.slice(0,limit);let html='<div class="dex-controls"><input type="search" id="speciesSearch" value="'+safe(search)+'" placeholder="Chercher un Pokémon, nom ou numéro…" aria-label="Rechercher un Pokémon"><select id="speciesFilter" aria-label="Filtre de collection"><option value="all" '+(filter==="all"?"selected":"")+'>Tous</option><option value="missing" '+(filter==="missing"?"selected":"")+'>Manquants</option><option value="owned" '+(filter==="owned"?"selected":"")+'>Possédés</option></select><span class="pill">'+d.ids.filter(x=>seen.has(x)).length+' / '+d.ids.length+' possédés</span></div>';html+=items.length?'<div class="dex-list">'+shown.map(x=>monHTML(x.id,x.i,seen.has(x.id))).join("")+'</div>':'<div class="empty">Aucun Pokémon ne correspond à ce filtre.</div>';if(items.length>shown.length)html+='<div class="row-between" style="margin-top:15px"><span class="muted">'+shown.length+' / '+items.length+' affichés</span><button class="soft" data-action="more">Afficher 80 Pokémon supplémentaires</button></div>';if(gameId===22&&dexIndex===0)html+='<p class="hint">Illumis comporte 232 entrées ; Diancie et Mewtwo ne sont pas exigés pour la récompense de complétion du Pokédex.</p>';return html}
function dexSection(s){const dx=dexes();return '<section class="section"><div class="section-title"><h2>Pokédex · Pokémon possédés</h2><span class="micro">Une case par espèce et par sauvegarde</span></div><div class="tabs">'+dx.map((d,i)=>'<button class="tab '+(dexIndex===i?"active":"")+'" data-dex="'+i+'">'+safe(d.label)+'</button>').join("")+'</div><div id="dexBody">'+dexBody(s)+'</div><p class="hint">Les cases sont partagées entre les Dex d’une même sauvegarde. Une espèce cochée dans le régional est automatiquement comptée dans le national.</p></section>'}
function goalSection(s){const tasks=goals().concat((s.custom||[]).map(x=>({id:x.id,title:x.title,group:"custom"})));const list=tasks.map(t=>'<label class="task '+(s.done[t.id]?"done":"")+'"><input data-task="'+safe(t.id)+'" type="checkbox" '+(s.done[t.id]?"checked":"")+'><span class="task-text"><strong>'+safe(t.title)+'</strong><small>'+({"story":"Histoire","extra":"Post Game et défis","custom":"Objectif personnel"}[t.group]||"Objectif")+'</small></span>'+(t.group==="custom"?'<button type="button" class="delete-task" data-delete-task="'+safe(t.id)+'" aria-label="Supprimer cet objectif">×</button>':"")+'</label>').join("");return '<section class="section"><div class="section-title"><h2>Objectifs du jeu</h2><span class="pill">'+doneCount(s).yes+' / '+doneCount(s).total+' réussis</span></div><div class="note"><strong>Deux jauges différentes :</strong> les Pokémon possédés remplissent le Pokédex ; ces cases suivent ton histoire, le Post Game et les défis. La notion de 100 % correspond ici à cette checklist personnalisable, pas à une certification officielle du jeu.</div><div class="tasks" id="taskList">'+list+'</div><form class="taskform" id="addGoalForm"><input id="newGoal" required maxlength="100" placeholder="Ajouter un objectif personnel…"><button class="green" type="submit">+ Objectif</button></form></section>'}
function mainHTML(){const s=getSlot(),name=gameName(gameId),dx=dexes();return '<section id="current-game"><div class="play-head"><img src="'+safe(coverOf(gameId))+'" alt=""><div><div class="eyebrow">GEN '+(gameIndex.find(x=>x.id===gameId)?.gen||"")+' · Suivi de sauvegarde</div><h1>'+safe(name)+'</h1><span class="muted">Suivez une sauvegarde par version et par partie. Les progrès ne sont pas liés aux autres jeux.</span></div></div><section class="section"><div class="section-title"><h2>Mes sauvegardes</h2><span class="pill">'+(window.PokeCloud?.statusInfo?.().user?"Discord · cloud privé":"Stockage local · non synchronisé")+'</span></div>'+saveBar(s)+'</section><section class="section"><div class="section-title"><h2>Tableau de bord</h2><div class="actions"><button class="soft" data-action="share-current">🔗 Lien de cette partie</button><button class="soft" data-action="export">Exporter mes données</button></div></div><div id="progressArea">'+progressArea(s)+'</div></section>'+dexSection(s)+goalSection(s)+'</section>'}
function overview(){const saves=Object.values(store.games).flatMap(x=>Array.isArray(x)?x:[]);const pokemon=saves.reduce((n,s)=>n+(s.owned?.length||0),0);const finished=saves.reduce((n,s)=>n+Object.values(s.done||{}).filter(Boolean).length,0);return '<section class="section"><div class="section-title"><h2>Vue d’ensemble des sauvegardes</h2><span class="micro">'+(window.PokeCloud?.statusInfo?.().user?"Synchronisé avec ton compte Discord":"Compteurs de cet appareil")+'</span></div><div class="progress-grid"><div class="progress-card"><small>Sauvegardes créées</small><strong>'+saves.length+'</strong><p>Versions et parties suivies</p></div><div class="progress-card"><small>Pokémon cochés</small><strong>'+pokemon+'</strong><p>Au total sur tes sauvegardes</p></div><div class="progress-card"><small>Objectifs cochés</small><strong>'+finished+'</strong><p>Histoire, défis et objectifs personnels</p></div></div></section>'}
function render(){if(IS_PROFILE_VIEW){document.getElementById("app").innerHTML=profileShowcasePage();return}if(IS_LIVE_VIEW){document.getElementById("app").innerHTML=liveShowcasePage();return}if(IS_SHARED_VIEW){document.getElementById("app").innerHTML=sharedShowcasePage();return}const details=mainHTML();document.getElementById("app").innerHTML='<div id="globalOverview">'+overview()+'</div><div id="showcaseArea">'+showcaseSection()+'</div><div id="gameGallery">'+gameGallery()+'</div>'+details}
function showcaseRows(){
  const result=[];
  for(const id of GAME_LIST){
    const entries=Array.isArray(store.games[id])?store.games[id]:[];
    const mainDex=DEX_DEFS[id].dex[0];
    const dexIds=fullIds(mainDex);
    for(const s of entries){
      const found=owned(s);
      const total=dexIds.length;
      const caught=dexIds.filter(x=>found.has(x)).length;
      const objective=doneCountFor(id,s);
      result.push({
        id,
        game:gameName(id),
        saveKey:s.id,
        save:String(s.name||s.version||"Partie"),
        cover:coverOf(id),
        caught,total,
        dexPercent:total?Math.round(caught*100/total):0,
        goalPercent:objective.percent
      });
    }
  }
  return result;
}
function showcaseCards(rows){
  return rows.map(r=>'<article class="showcase-tile"><img loading="lazy" src="'+safe(r.cover)+'" alt=""><div><strong>'+safe(r.game)+'</strong><span class="micro">'+safe(r.save)+'</span><div class="showcase-stat"><span>Pokédex régional</span><b>'+r.caught+' / '+r.total+' · '+r.dexPercent+' %</b></div><div class="bar"><div style="width:'+r.dexPercent+'%"></div></div><div class="showcase-stat"><span>Objectifs du jeu</span><b>'+r.goalPercent+' %</b></div><div class="bar gold"><div style="width:'+r.goalPercent+'%"></div></div></div></article>').join("");
}
function showcaseSection(){
  const rows=showcaseRows();
  const cloud=window.PokeCloud?.statusInfo?.()||{configured:false,user:null,ready:false,status:"Connexion en préparation."};
  const connected=!!cloud.user;
  const name=cloud.profile?.display_name||"Dresseur";
  const discordAction=connected
    ? '<button class="green" data-action="cloud-share">🔗 Copier mon profil Discord</button>'
    : '<button class="green" data-action="cloud-login" '+(!cloud.configured?'disabled':'')+'>Se connecter avec Discord</button>';
  const editNameAction=connected?'<button class="soft" data-action="cloud-edit-name" title="Choisir le nom d’affichage de ta vitrine, distinct du @Discord">✎ Modifier mon nom affiché</button>':"";
  const refreshAction=connected?'<button class="soft" data-action="cloud-refresh-discord" title="Récupérer le pseudo, l’avatar et la bannière Discord">↻ Actualiser mon profil Discord</button>':"";
  const conflictAction=cloud.conflict?'<button class="soft" data-action="cloud-reload">Recharger la version cloud</button>':"";
  const fallback='<button class="soft" id="copyShowcaseLink" data-action="share-showcase" '+(!rows.length?'disabled':'')+'>🔗 Lien instantané</button>';
  return '<section class="section" id="vitrine"><div class="section-title"><div><div class="eyebrow">PROFIL DISCORD · POKÉ AGENDA V4</div><h2>'+safe(connected?"Bienvenue, "+name+" !":"Ta collection Pokémon, partout avec toi.")+'</h2><p class="muted">'+safe(connected?"Ta progression complète est privée ; seul ce tableau est public.":"Connecte-toi avec Discord pour sauvegarder tes Pokémon, tes objectifs et tes parties sur tous tes appareils.")+'</p></div><div class="actions">'+discordAction+editNameAction+refreshAction+fallback+conflictAction+'</div></div><div class="note" role="status">'+safe(cloud.status)+'</div><div class="showcase-grid">'+(showcaseCards(rows)||'<div class="empty">Choisis un jeu et ajoute une sauvegarde pour commencer.</div>')+'</div><p class="hint">Le JSON reste exportable à tout moment. La synchronisation nécessite une connexion Discord. <a href="https://discord.gg/4FX9PDmYzG" target="_blank" rel="noopener noreferrer">Rejoindre le Discord communautaire</a>.</p></section>';
}
function shareSnapshotURL(rows){
  const stamp=new Date().toLocaleDateString("fr-FR");
  // Noms des sauvegardes + statistiques uniquement : ni notes, ni liste de Pokémon.
  const payload=[1,stamp,rows.map(r=>[r.id,String(r.save).slice(0,50),r.caught,r.goalPercent])];
  const bytes=new TextEncoder().encode(JSON.stringify(payload));
  const encoded=btoa(Array.from(bytes,b=>String.fromCharCode(b)).join("")).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
  const url=new URL("suivi.html",location.href);
  url.search="";
  url.hash="v1="+encoded;
  return url.href;
}
async function shareRows(rows){
  if(!rows.length){alert("Ajoute d'abord une sauvegarde à ta vitrine.");return}
  const link=shareSnapshotURL(rows);
  if(link.length>7500){
    alert("Ta vitrine contient beaucoup de sauvegardes : le lien complet serait trop long. Tu peux partager une partie à la fois avec le bouton « Lien de cette partie ».");
    return;
  }
  try{
    if(!navigator.clipboard?.writeText)throw Error("Presse-papiers indisponible");
    await navigator.clipboard.writeText(link);
    const btn=document.getElementById("copyShowcaseLink");
    if(btn){btn.textContent="✓ Lien copié !";setTimeout(()=>{if(btn.isConnected)btn.textContent="🔗 Copier le lien de ma vitrine"},2500)}
  }catch{
    // Possibilité de copier même si le navigateur bloque Clipboard API.
    prompt("Copie le lien de ta vitrine :",link);
  }
}
const SHARE_PREFIX="#v1=";
const IS_SHARED_VIEW=String(location.hash||"").startsWith(SHARE_PREFIX);
const IS_LIVE_VIEW=!!new URLSearchParams(location.search).get("live");
const IS_PROFILE_VIEW=new URLSearchParams(location.search).has("profil");
function parseSharedShowcase(){
  try{
    const fragment=String(location.hash||"");
    if(!fragment.startsWith(SHARE_PREFIX)||fragment.length>18000)throw Error("Lien invalide");
    const encoded=fragment.slice(SHARE_PREFIX.length).replace(/-/g,"+").replace(/_/g,"/");
    const str=atob(encoded);
    const bytes=Uint8Array.from(str,ch=>ch.charCodeAt(0));
    const obj=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(bytes));
    if(!Array.isArray(obj)||obj.length!==3||obj[0]!==1||!Array.isArray(obj[2])||obj[2].length>150)throw Error("Lien non reconnu");
    const date=String(obj[1]||"").slice(0,10);
    const rows=obj[2].map(r=>{
      if(!Array.isArray(r)||r.length!==4)throw Error("Données mal formées");
      const [id,save,caught,goalPercent]=r;
      if(!Number.isInteger(id)||!DEX_DEFS[id]||typeof save!=="string"||save.length>50||!Number.isInteger(caught)||!Number.isInteger(goalPercent)||goalPercent<0||goalPercent>100)throw Error("Données invalides");
      const total=fullIds(DEX_DEFS[id].dex[0]).length;
      if(caught<0||caught>total)throw Error("Comptage invalide");
      return {id,game:gameName(id),save,cover:coverOf(id),caught,total,dexPercent:Math.round(caught/total*100),goalPercent};
    });
    return {date,rows};
  }catch{
    return null;
  }
}
function liveShowcasePage(){
  const state=window.PokeLive?.viewerState?.()||{loading:false,error:"Supabase n'est pas configuré.",payload:null};
  if(state.loading)return '<section class="section live-vitrine"><div class="eyebrow">VITRINE PERMANENTE</div><h2>Chargement de la progression…</h2><p class="muted">Consultation des dernières statistiques publiées.</p></section>';
  if(state.error&&!state.payload)return '<section class="section live-vitrine"><div class="eyebrow">VITRINE PERMANENTE</div><h2>Impossible d’ouvrir cette vitrine</h2><p class="muted">'+safe(state.error)+'</p><a class="green" href="suivi.html">Ouvrir mon suivi Pokémon</a></section>';
  const data=state.payload;
  const rows=(data?.rows||[]).map(entry=>{
    const [id,save,caught,goalPercent]=entry;
    const total=fullIds(DEX_DEFS[id].dex[0]).length;
    return {id,game:gameName(id),save,cover:coverOf(id),caught,total,
      dexPercent:total?Math.round(caught/total*100):0,goalPercent};
  });
  return '<section class="intro live-vitrine"><div class="eyebrow">VITRINE POKÉ-AGENDA · LIVE</div><h1>Une collection Pokémon qui évolue !</h1><p>Progression actualisée automatiquement toutes les 45 secondes. Dernière mise à jour : <span id="liveRefreshTime">'+safe(window.PokeLive?.formatDate?.(state.updatedAt)||'inconnue')+'</span>.</p></section><section class="section"><div class="section-title"><h2>Pokédex et objectifs</h2><a class="green" href="suivi.html">Créer mon suivi →</a></div><div class="showcase-grid">'+(showcaseCards(rows)||'<div class="empty">Aucune sauvegarde à afficher pour le moment.</div>')+'</div><p class="hint">Cette vitrine est publiée par son propriétaire et reste en lecture seule. Les cases personnelles des visiteurs ne sont pas modifiées.</p></section>';
}
function profileShowcasePage(){
  const state=window.PokeCloud?.viewerState?.()||{loading:true,profile:null,error:null};
  if(state.loading)return '<section class="section" role="status"><h2>Chargement du profil Discord…</h2></section>';
  if(state.error||!state.profile)return '<section class="section"><h2>Profil indisponible</h2><p class="muted">'+safe(state.error||"Ce profil n'existe pas.")+'</p><a class="green" href="suivi.html">Créer mon profil</a></section>';
  const p=state.profile;
  // Le CDN Discord peut servir plusieurs résolutions : on demande un format
  // adapté à l'affichage, y compris sur les écrans haute densité de pixels.
  const img=source=>typeof source==="string"&&/^https:\/\/cdn\.discordapp\.com\/(avatars|banners|embed\/avatars)\//.test(source)?safe(source):"";
  const cdnSize=(url,size)=>url ? url+(url.includes("?")?"&":"?")+"size="+size : "";
  const avatar=cdnSize(img(p.avatar_url),256);
  const banner=cdnSize(img(p.banner_url),2048);
  const color=typeof p.accent_color==="string"&&/^#[0-9a-fA-F]{6}$/.test(p.accent_color)?p.accent_color:"#5467d8";
  const entries=Array.isArray(p.public_progress?.rows)?p.public_progress.rows:[];
  const rows=entries.slice(0,100).map(r=>{
    if(!Array.isArray(r)||r.length!==4)return null;
    const [id,save,caught,goals]=r;
    if(!Number.isInteger(id)||!DEX_DEFS[id]||typeof save!=="string"||!Number.isInteger(caught)||!Number.isInteger(goals))return null;
    const total=fullIds(DEX_DEFS[id].dex[0]).length;
    if(caught<0||caught>total||goals<0||goals>100)return null;
    return {id,save,game:gameName(id),cover:coverOf(id),caught,total,dexPercent:total?Math.round(caught/total*100):0,goalPercent:goals};
  }).filter(Boolean);
  const avatarHTML=avatar?'<img class="discord-avatar" src="'+avatar+'" srcset="'+cdnSize(img(p.avatar_url),128)+' 128w, '+avatar+' 256w, '+cdnSize(img(p.avatar_url),512)+' 512w" sizes="104px" alt="Avatar Discord" decoding="async" referrerpolicy="no-referrer">':'<span class="discord-avatar discord-avatar-fallback">★</span>';
  const bannerHTML=banner?'<img class="discord-banner-image" src="'+banner+'" srcset="'+cdnSize(img(p.banner_url),1024)+' 1024w, '+banner+' 2048w, '+cdnSize(img(p.banner_url),4096)+' 4096w" sizes="100vw" alt="Bannière Discord" decoding="async" referrerpolicy="no-referrer">':'';
  const totalCaught=rows.reduce((sum,r)=>sum+r.caught,0);
  const username=String(p.username||"discord").replace(/^@/,"").replace(/#\d{1,4}$/,"");
  return '<section class="discord-profile"><div class="discord-banner" style="background-color:'+color+'">'+bannerHTML+'</div><div class="discord-profile-body">'+avatarHTML+'<div class="discord-profile-names"><div class="eyebrow">PROFIL POKÉ AGENDA · DISCORD</div><h1>'+safe(p.display_name||"Dresseur")+'</h1><p class="muted">@'+safe(username)+'</p></div><div class="discord-stats"><span><b>'+rows.length+'</b> sauvegarde(s)</span><span><b>'+totalCaught+'</b> Pokémon cochés</span></div></div></section>'
    +'<section class="section"><div class="section-title"><div><div class="eyebrow">VITRINE DE PROGRESSION</div><h2>Les aventures de '+safe(p.display_name||"ce dresseur")+'</h2><p class="muted">Dernière synchronisation : '+safe(p.updated_at?new Date(p.updated_at).toLocaleString("fr-FR"):"inconnue")+'</p></div><a class="green" href="suivi.html">Créer mon suivi →</a></div><div class="showcase-grid">'+(showcaseCards(rows)||'<div class="empty">Pas encore de sauvegarde publiée.</div>')+'</div></section>'
    +'<section class="section discord-community"><div><div class="eyebrow">COMMUNAUTÉ</div><h2>Rejoins le Discord Poké Agenda !</h2><p class="muted">Retrouve les autres joueurs et partage tes avancées.</p></div><a class="green" href="https://discord.gg/4FX9PDmYzG" target="_blank" rel="noopener noreferrer">Rejoindre le serveur Discord ↗</a></section>';
}
function sharedShowcasePage(){
  const data=parseSharedShowcase();
  if(!data)return '<section class="section"><div class="eyebrow">Lien de partage</div><h1>Lien invalide ou endommagé</h1><p class="muted">Cet instantané ne peut pas être lu. Demande un nouveau lien à la personne qui l’a créé.</p><a class="green" href="suivi.html">Ouvrir mon propre suivi</a></section>';
  const cards=showcaseCards(data.rows);
  return '<section class="intro shared-intro"><div class="eyebrow">VITRINE POKÉ-AGENDA · PARTAGE</div><h1>Une collection Pokémon à découvrir !</h1><p>Progression partagée le '+safe(data.date)+' · '+data.rows.length+' sauvegarde(s) · aperçu en lecture seule</p></section><section class="section"><div class="section-title"><h2>Pokédex et objectifs</h2><a class="green" href="suivi.html">Créer ma propre vitrine →</a></div><div class="showcase-grid">'+(cards||'<div class="empty">Aucune partie enregistrée.</div>')+'</div><p class="hint">Cet instantané n’est pas synchronisé avec le propriétaire. Les coches et les sauvegardes personnelles de chaque visiteur restent inchangées.</p></section>';
}

function updateGlobal(){document.getElementById("globalOverview").innerHTML=overview();document.getElementById("gameGallery").innerHTML=gameGallery();document.getElementById("showcaseArea").innerHTML=showcaseSection()}
function updateAfterDex(){const s=getSlot();document.getElementById("progressArea").innerHTML=progressArea(s);document.getElementById("dexBody").innerHTML=dexBody(s);updateGlobal()}
function updateAfterTasks(){const s=getSlot();document.getElementById("progressArea").innerHTML=progressArea(s);const parent=document.getElementById("taskList");parent.innerHTML=goalSection(s).match(/<div class="tasks" id="taskList">([\s\S]*?)<\/div><form/)?.[1]||parent.innerHTML;const badge=parent.closest(".section").querySelector(".pill");if(badge){const d=doneCount(s);badge.textContent=d.yes+" / "+d.total+" réussis"}updateGlobal()}
function action(action){if(action==="cloud-edit-name"){window.PokeCloud?.editDisplayName();return}if(action==="cloud-refresh-discord"){window.PokeCloud?.refreshDiscordProfile();return}if(action==="cloud-login"){window.PokeCloud?.login();return}if(action==="cloud-logout"){window.PokeCloud?.logout();return}if(action==="cloud-share"){window.PokeCloud?.copyLink();return}if(action==="cloud-reload"){window.PokeCloud?.reloadFromCloud();return}if(action==="live-publish"){window.PokeLive?.publish();return}if(action==="live-reset"){window.PokeLive?.resetIdentity();return}if(action==="live-unpublish"){window.PokeLive?.unpublish();return}if(action==="share-showcase"){shareRows(showcaseRows());return}if(action==="share-current"){const selected=getSlot();shareRows(showcaseRows().filter(r=>r.id===gameId&&r.saveKey===selected.id));return}const s=getSlot();if(action==="new-save"){const v=document.getElementById("newVersion").value;if(!DEX_DEFS[gameId].versions.includes(v))return;const n=slots().filter(s=>s.version===v).length+1;const obj={id:uid(),version:v,name:v+" #"+n,owned:[],done:{},custom:[]};slots().push(obj);saveId=obj.id;store.active[gameId]=saveId;saveStore();render();return}if(action==="rename-save"){const name=prompt("Nom de la sauvegarde :",s.name);if(name===null)return;s.name=name.trim().slice(0,50)||s.version;saveStore();render();return}if(action==="delete-save"){if(!confirm("Supprimer définitivement cette sauvegarde et sa progression ? Pense à exporter tes données avant."))return;store.games[gameId]=slots().filter(v=>v.id!==s.id);saveId="";saveStore();render();return}if(action==="more"){limit+=80;document.getElementById("dexBody").innerHTML=dexBody(s);return}if(action==="export"){const data=JSON.stringify(store,null,2);const blob=new Blob([data],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="poke_agenda_progression_"+new Date().toISOString().slice(0,10)+".json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return}}
document.addEventListener("click",e=>{const game=e.target.closest("[data-game]");if(game){selectGame(Number(game.dataset.game));return}const gen=e.target.closest("[data-game-filter]");if(gen){gameFilter=Number(gen.dataset.gameFilter);render();return}const tab=e.target.closest("[data-dex]");if(tab){dexIndex=Number(tab.dataset.dex);search="";filter="all";limit=80;render();return}const button=e.target.closest("[data-action]");if(button){action(button.dataset.action);return}const del=e.target.closest("[data-delete-task]");if(del){const s=getSlot();s.custom=(s.custom||[]).filter(t=>t.id!==del.dataset.deleteTask);delete s.done[del.dataset.deleteTask];saveStore();render();}});
document.addEventListener("change",e=>{const t=e.target;if(t.id==="saveSelect"){saveId=t.value;store.active[gameId]=saveId;saveStore();render();return}if(t.id==="speciesFilter"){filter=t.value;limit=80;document.getElementById("dexBody").innerHTML=dexBody(getSlot());return}if(t.matches("[data-species]")){const s=getSlot();const id=Number(t.dataset.species);const set=owned(s);if(t.checked)set.add(id);else set.delete(id);s.owned=Array.from(set).sort((a,b)=>a-b);saveStore();updateAfterDex();return}if(t.matches("[data-task]")){const s=getSlot();s.done[t.dataset.task]=t.checked;saveStore();updateAfterTasks();return}});
document.addEventListener("input",e=>{if(e.target.id==="speciesSearch"){const elem=e.target;const p=elem.selectionStart;search=elem.value;limit=80;document.getElementById("dexBody").innerHTML=dexBody(getSlot());const newInput=document.getElementById("speciesSearch");newInput?.focus();try{newInput?.setSelectionRange(p,p)}catch{}}});
document.addEventListener("submit",e=>{if(e.target.id!=="addGoalForm")return;e.preventDefault();const s=getSlot();const input=document.getElementById("newGoal");const title=input.value.trim();if(!title)return;s.custom=s.custom||[];s.custom.push({id:uid(),title:title.slice(0,100)});saveStore();render()});
if(IS_SHARED_VIEW||IS_LIVE_VIEW||IS_PROFILE_VIEW)document.getElementById("importTrigger").hidden=true;
if(IS_PROFILE_VIEW)document.querySelector("main > .intro")?.remove();
document.getElementById("importTrigger").addEventListener("click",()=>document.getElementById("fileImport").click());
document.getElementById("fileImport").addEventListener("change",async e=>{const file=e.target.files?.[0];if(!file)return;if(file.size>5_000_000){alert("Fichier trop volumineux.");return}try{const obj=JSON.parse(await file.text());if(obj.version!==3||!obj.games||typeof obj.games!=="object"||!Object.keys(obj.games).every(k=>DEX_DEFS[k]&&Array.isArray(obj.games[k])))throw Error("Format non reconnu");if(!confirm("Importer ces sauvegardes et remplacer le suivi actuel de cet appareil ?"))return;store={version:3,games:obj.games,active:obj.active&&typeof obj.active==="object"?obj.active:{}};for(const g of Object.values(store.games)){for(const s of g){s.owned=Array.isArray(s.owned)?s.owned.map(Number).filter(x=>x>=1&&x<=1025):[];s.done=s.done&&typeof s.done==="object"?s.done:{};s.custom=Array.isArray(s.custom)?s.custom.filter(x=>x&&typeof x.id==="string"&&typeof x.title==="string").slice(0,500):[];s.name=String(s.name||"Sauvegarde").slice(0,50);s.version=String(s.version||"Version").slice(0,50)}}saveStore();saveId=store.active[gameId]||"";render();alert("Données importées.")}catch(err){alert("Import impossible : "+err.message)}finally{e.target.value=""}});
if(IS_LIVE_VIEW)window.PokeLive?.init({getRows:showcaseRows,onPublicChange:()=>render(),onOwnerChange:()=>render()});
else if(!IS_SHARED_VIEW)window.PokeCloud?.init({
  getStore:()=>store,setStore:replaceStoreFromCloud,getRows:showcaseRows,onChange:()=>render()
});
fetch("catalogue.json",{cache:"no-store"}).then(r=>r.ok?r.json():Promise.reject(Error("Catalogue"))).then(data=>{gameIndex=Array.isArray(data)?data.filter(g=>g.id>=1&&g.id<=22):[];render()}).catch(()=>render());
