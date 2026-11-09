import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext,Script} from "node:vm";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const G=read("assets/glossary/data.js");
const A=read("assets/glossary/app.js");
const index=read("index.html");
const page=read("jeu.html");
const calendar=read("assets/calendar/app.js");
const gamesScript=read("assets/calendar/games.js");
const rules=read("assets/tracker/game-rules.js");
const context={window:{}};
runInNewContext(G,context);
runInNewContext(gamesScript,context);
runInNewContext(rules,context);
const data=context.window.POKE_GLOSSARY;

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
      assert.ok(entry.name.length>8 && entry.description.length>30,"Texte trop bref : "+id);
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
    ["poke-v2-notes",JSON.stringify({"14":"Jirachi dans la boîte"}))]
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
