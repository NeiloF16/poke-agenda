import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext,Script} from "node:vm";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const G=read("assets/glossary/data.js");
const EventArchive=read("assets/glossary/distribution-archives.js");
const A=read("assets/glossary/app.js");
const index=read("index.html");
const page=read("jeu.html");
const calendar=read("assets/calendar/app.js");
const gamesScript=read("assets/calendar/games.js");
const rules=read("assets/tracker/game-rules.js");
const context={window:{}};
runInNewContext(G,context);
runInNewContext(EventArchive,context);
runInNewContext(gamesScript,context);
runInNewContext(rules,context);
const data=context.window.POKE_GLOSSARY;
const archive=context.window.POKE_DIST_ARCHIVES;

test("23 jeux ont chacun 4 chapitres et au moins 5 entrées sourcées",()=>{
  assert.equal(data.schema,1);
  assert.equal(Object.keys(data.games).length,23);
  const types=["routines","echanges","distributions","secrets"];
  let count=0;
  for(const [id,guide] of Object.entries(data.games)){
    assert.ok(Number(id)>=1 && Number(id)<=23);
    assert.ok(guide.intro?.length>40);
    assert.ok(guide.entries?.length>=5);
    count+=guide.entries.length;
    assert.deepEqual(types.sort(),[...new Set(guide.entries.map(e=>e.type))].sort(),"Chapitres incomplets : "+id);
    for(const entry of guide.entries){
      assert.ok(entry.name.length>=4 && entry.description.length>30,"Texte trop bref : "+id);
      assert.ok(entry.source in data.references,"Source manquante : "+id+" "+entry.name);
    }
  }
  assert.ok(count>=150);
});

test("sources externes HTTPS et faits historiques classés explicitement",()=>{
  for(const value of Object.values(data.references))assert.match(value,/^https:\/\//);
  assert.ok(data.games[8].entries.some(e=>e.name.includes("Mew de My Pokémon Ranch")&&e.description.includes("999")));
  assert.ok(data.games[5].entries.some(e=>e.name.includes("WISHMKR")));
  assert.ok(data.games[14].entries.some(e=>e.name.includes("Diancie chromatique")&&e.when.includes("2015")));
  assert.ok(data.games[22].entries.some(e=>e.name.includes("Pérégrain")&&e.when.includes("2026")));
});

test("page et code sans ancien lecteur d'affiches : tous les chemins ouvrent le glossaire",()=>{
  new Script(G);
  new Script(A);
  new Script(calendar);
  assert.match(page,/assets\/glossary\/data\.js/);
  assert.match(page,/assets\/glossary\/app\.js/);
  assert.doesNotMatch(index,/<dialog id="reader"/);
  assert.doesNotMatch(index,/<dialog id="zoomDialog"/);
  assert.match(calendar,/jeu\.html\?game=/);
  assert.doesNotMatch(calendar,/const WEEK=\[/);
  assert.doesNotMatch(calendar,/const DAILY=\[/);
  assert.match(calendar,/TOTAL_ARTICLES/);
  assert.match(calendar,/timedRoutines/);
});

function renderGame(id){
  const dom=new Map();
  const storage=new Map([
    ["poke-v2-favorites",JSON.stringify([14])],
    ["poke-v2-notes",JSON.stringify({"14":"Jirachi dans la boîte"})]
  ]);
  function element(id){
    if(!dom.has(id))dom.set(id,{id,innerHTML:"",value:"",textContent:"",
      listeners:{},classList:{toggle(){}},
      addEventListener(type,callback){this.listeners[type]=callback;}});
    return dom.get(id);
  }
  const document={getElementById:element};
  const location={search:"?game="+id,href:"https://example.com/jeu.html?game="+id};
  const scene={window:context.window,document,location,URLSearchParams,
    localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
    Date,console};
  runInNewContext(A,scene);
  return {dom,storage,element,location};
}

test("ROSA : vrais articles et sources visibles, notes conservées",()=>{
  const app=renderGame(14);
  assert.match(app.element("glossaryApp").innerHTML,/Rubis Oméga \/ Saphir Alpha/);
  assert.match(app.element("chapters").innerHTML,/Diancie chromatique japonais/);
  assert.match(app.element("chapters").innerHTML,/Source \/ approfondir/);
  assert.equal(app.element("guideNotes").value,"Jirachi dans la boîte");
  assert.match(app.element("glossaryApp").innerHTML,/Suivi Rubis Oméga/);
  assert.match(app.element("glossaryApp").innerHTML,/Suivi Saphir Alpha/);
});

test("favoris et notes utilisent les clés locales existantes",()=>{
  const app=renderGame(14);
  const button=app.element("favoriteToggle");
  button.listeners.click();
  assert.deepEqual(JSON.parse(app.storage.get("poke-v2-favorites")),[]);
  const notes=app.element("guideNotes");
  notes.listeners.input({target:{value:"Tous les échanges faits"}});
  assert.equal(JSON.parse(app.storage.get("poke-v2-notes"))[14],"Tous les échanges faits");
});

test("catalogue et suivi des 38 versions sont préservés",()=>{
  assert.equal(context.window.POKE_AGENDA_GAMES.length,23);
  const vers=Object.values(context.window.POKE_TRACKER_RULES.DEX_DEFS).flatMap(x=>x.versions);
  assert.equal(vers.length,38);
  assert.match(page,/suivi\.html/);
});


test("les 23 jeux donnent accès aux sources Evendex Pokébip pertinentes",()=>{
  assert.equal(archive.schema,1);
  assert.ok(archive.records.length>=65);
  assert.equal(Object.keys(archive.perGame).length,23);
  for(let gen=1;gen<=8;gen++){
    const id="fr"+gen;
    assert.match(archive.sources[id].url,new RegExp("event-distributions-en-france-depuis-1996-"+gen+"g$"));
  }
  for(let gameId=1;gameId<=23;gameId++){
    const ids=archive.perGame[gameId];
    assert.ok(ids.length>=1,"Aucune archive : "+gameId);
    for(const key of ids)assert.ok(archive.sources[key]?.url.startsWith("https://www.pokebip.com/"),"Source invalide : "+key);
  }
});
test("archives et exemples sourcés ne sont jamais présentés comme une liste exhaustive",()=>{
  assert.match(archive.notice,/beaucoup plus de distributions/);
  for(const record of archive.records){
    assert.ok(record.name.length>3);
    assert.ok(record.detail.length>30);
    assert.ok(record.games.length>=1 && record.games.every(id=>id>=1&&id<=23));
    assert.ok(archive.sources[record.source]?.url.startsWith("https://www.pokebip.com/"));
  }
  assert.ok(archive.records.some(r=>r.name.includes("Celebi Tour")&&r.games.includes(3)));
  assert.ok(archive.records.some(r=>r.name.includes("Diancie chromatique")&&r.tid==="12125"));
  assert.ok(archive.records.some(r=>r.name.includes("Genesect Plasma")&&r.tid==="10072"));
  assert.equal(archive.records.filter(r=>r.name.startsWith("My Pokémon Ranch — ")).length,20);
});
test("le guide ROSA affiche les archives Pokébip et garde les anciennes notes",()=>{
  const app=renderGame(14);
  const html=app.element("chapters").innerHTML;
  assert.match(html,/Inventaire des distributions Pokémon/);
  assert.match(html,/Diancie chromatique Pokémon Center/);
  assert.match(html,/Pokébip — toutes les distributions françaises 6G/);
  assert.match(html,/Vérifier sur Pokébip/);
  assert.equal(app.element("guideNotes").value,"Jirachi dans la boîte");
  assert.ok(page.indexOf("distribution-archives.js")>page.indexOf("glossary/data.js"));
  assert.ok(page.indexOf("distribution-archives.js")<page.indexOf("glossary/app.js"));
});
test("les références clés de l'ancien glossaire privilégient Pokébip",()=>{
  for(const key of ["ranch","wishmkr","channel","shinyDiancie","events"])
    assert.match(data.references[key],/^https:\/\/www\.pokebip\.com\//);
  const dp=data.games[8].entries.find(r=>r.name.includes("Membre Carte"));
  assert.match(dp.description,/pas été distribuées officiellement/);
});
