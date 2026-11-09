import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";

const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const tracker=read("assets/tracker/tracker.js");
const rules=read("assets/tracker/game-rules.js");
const cloud=read("assets/tracker/cloud.js");
const library=read("assets/calendar/app.js");
const ownerData={
  version:3,
  games:{"14":[
    {id:"ro-ancien",version:"Rubis Oméga",name:"Ma partie Rubis",owned:[1,2],done:{"story-0":true},custom:[]},
    {id:"sa-ancien",version:"Saphir Alpha",name:"Ma partie Saphir",owned:[3],done:{},custom:[]}
  ]},
  active:{"14":"ro-ancien"}
};
function session(url="https://example.com/suivi.html?game=14&version=Saphir%20Alpha", data=ownerData,publicProfile=null){
  const window={};
  runInNewContext(rules,{window});
  window.POKE_DATA={names:Array.from({length:1100},(_,i)=>"Pokemon "+i),
    dexes:Object.fromEntries([2,3,4,5,6,7,8,9,12,13,14,15,16,21,26,27,28,29,30,31,32,33,34,35]
      .map(id=>[id,[1,2,3,4,5]]))};
  window.PokeCloud={
    isEnabled:()=>false,init:()=>{},statusInfo:()=>({user:null}),
    viewerState:()=>({loading:false,profile:publicProfile,error:null})
  };
  const memory=new Map([["poke-agenda-tracker-v3",JSON.stringify(data)]]);
  const location=new URL(url);
  const controls=new Map();
  const fakeElement=id=>{
    if(!controls.has(id))controls.set(id,{id,innerHTML:"",hidden:false,
      addEventListener(){},scrollIntoView(){},click(){},querySelector(){return null}});
    return controls.get(id);
  };
  const document={getElementById:fakeElement,addEventListener(){},querySelector(){return null}};
  const context={window,document,location,history:{replaceState(_,__,u){location.href=String(u)}},
    localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)},
    URL,URLSearchParams,TextEncoder,TextDecoder,Uint8Array,btoa,atob,
    setTimeout(){},clearTimeout(){},setInterval(){},clearInterval(){},
    alert(){},confirm:()=>true,prompt:()=>null,
    fetch:async()=>({ok:true,json:async()=>[{id:14,gen:6,cover:"assets/covers/14.webp",name:"RO / SA"}]})};
  runInNewContext(tracker,context);
  const evalCode=expression=>runInNewContext(expression,context);
  return {evalCode,location,memory,window,controls};
}

test("38 cartes individuelles : chacune des 22 familles contient ses propres versions",()=>{
  const {evalCode}=session();
  const pairs=evalCode("GAME_VERSIONS.map(v=>[v.id,v.version])");
  assert.equal(pairs.length,38);
  assert.equal(pairs.filter(x=>x[0]===14).length,2);
  assert.deepEqual(JSON.parse(JSON.stringify(pairs.filter(x=>x[0]===14).map(x=>x[1]))),["Rubis Oméga","Saphir Alpha"]);
  const gallery=evalCode("gameGallery()");
  assert.match(gallery,/38 versions individuelles/);
  assert.match(gallery,/data-version="Rubis Oméga"/);
  assert.match(gallery,/data-version="Saphir Alpha"/);
  assert.doesNotMatch(gallery,/22 jeux principaux \/ duos/);
});

test("les sauvegardes V3/V4 existantes restent intactes et sélectionnées par version",()=>{
  const {evalCode}=session();
  const before=JSON.stringify(ownerData.games["14"]);
  assert.equal(evalCode("selectedVersion"),"Saphir Alpha");
  assert.equal(evalCode("getSlot().id"),"sa-ancien");
  assert.equal(evalCode("getSlot().owned.length"),1);
  evalCode('selectGame(14,"Rubis Oméga")');
  assert.equal(evalCode("selectedVersion"),"Rubis Oméga");
  assert.equal(evalCode("getSlot().id"),"ro-ancien");
  assert.equal(evalCode("getSlot().owned.length"),2);
  assert.equal(evalCode("slotsForVersion(14,'Saphir Alpha').length"),1);
  assert.equal(JSON.stringify(ownerData.games["14"]),before);
});

test("l'ajout d'une partie dans une version ne modifie pas la version jumelle",()=>{
  const {evalCode}=session();
  const originalRuby=evalCode("JSON.stringify(slotsForVersion(14,'Rubis Oméga'))");
  evalCode('action("new-save")');
  assert.equal(evalCode("slotsForVersion(14,'Saphir Alpha').length"),2);
  assert.equal(evalCode("slotsForVersion(14,'Rubis Oméga').length"),1);
  assert.equal(evalCode("JSON.stringify(slotsForVersion(14,'Rubis Oméga'))"),originalRuby);
  assert.equal(evalCode("getSlot().version"),"Saphir Alpha");
});

test("la vitrine et les liens instantanés distinguent les versions",()=>{
  const {evalCode,location}=session();
  const rows=evalCode("showcaseRows()");
  assert.equal(rows.length,2);
  assert.deepEqual(JSON.parse(JSON.stringify(rows.map(x=>x.game))),["Rubis Oméga","Saphir Alpha"]);
  assert.equal(rows[0].caught,2);
  assert.equal(rows[1].caught,1);
  const share=evalCode("shareSnapshotURL(showcaseRows())");
  location.href=share;
  const parsed=evalCode("parseSharedShowcase()");
  assert.equal(parsed.rows[0].game,"Rubis Oméga");
  assert.equal(parsed.rows[1].game,"Saphir Alpha");
});

test("les anciennes vitrines à quatre champs restent lisibles",()=>{
  const oldProfile={
    display_name:"Neilo",username:"flyneilo",updated_at:"2026-11-09T12:00:00Z",
    public_progress:{v:1,rows:[[14,"Ancienne partie",1,15]]}
  };
  const {evalCode}=session("https://example.com/suivi.html?profil=123e4567-e89b-42d3-a456-426614174000",ownerData,oldProfile);
  const older=evalCode("profileShowcasePage()");
  assert.match(older,/RO \/ SA|Rubis Oméga \/ Saphir Alpha/);
  const modern={...oldProfile,public_progress:{v:1,rows:[[14,"Partie Alpha",1,15,"Saphir Alpha"]]}};
  const current=session("https://example.com/suivi.html?profil=123e4567-e89b-42d3-a456-426614174000",ownerData,modern);
  const output=current.evalCode("profileShowcasePage()");
  assert.match(output,/Saphir Alpha/);
  assert.match(output,/Partie Alpha/);
});

test("les boutons de bibliothèque dirigent vers chaque version distincte",()=>{
  assert.match(library,/function trackerVersionLinks/);
  assert.match(library,/encodeURIComponent\(version\)/);
  assert.match(library,/&amp;version=/);
  const index=read("index.html");
  assert.ok(index.indexOf("game-rules.js")<index.indexOf("calendar/app.js"));
  assert.ok(index.indexOf("game-rules.js")>0);
  assert.match(cloud,/String\(r\.version \|\| ""\)/);
});


test("compléter le Dex actif coche seulement la version et la partie affichées",()=>{
  const {evalCode,memory}=session();
  const before=JSON.parse(memory.get("poke-agenda-tracker-v3"));
  assert.equal(evalCode("selectedVersion"),"Saphir Alpha");
  assert.match(evalCode("dexBody(getSlot())"),/data-action="complete-dex"/);
  assert.match(evalCode("dexBody(getSlot())"),/Compléter ce Pokédex/);
  evalCode('action("complete-dex")');
  const after=JSON.parse(memory.get("poke-agenda-tracker-v3"));
  const ruby=after.games["14"].find(s=>s.id==="ro-ancien");
  const sapphire=after.games["14"].find(s=>s.id==="sa-ancien");
  assert.deepEqual(ruby,before.games["14"].find(s=>s.id==="ro-ancien"));
  assert.deepEqual(sapphire.owned,[1,2,3,4,5]);
  assert.deepEqual(sapphire.done,{});
  assert.match(evalCode("dexBody(getSlot())"),/Pokédex complété/);
  assert.match(evalCode("dexBody(getSlot())"),/disabled aria-disabled="true"/);
  assert.equal(evalCode('completeSelectedDex()'),false);
  assert.equal(evalCode("getSlot().version"),"Saphir Alpha");
});

test("la confirmation annulée n'altère aucun Pokémon ni la sauvegarde locale",()=>{
  const {evalCode,memory}=session();
  const before=memory.get("poke-agenda-tracker-v3");
  evalCode("confirm=()=>false");
  assert.equal(evalCode("completeSelectedDex()"),false);
  assert.equal(memory.get("poke-agenda-tracker-v3"),before);
  assert.equal(evalCode("getSlot().owned.length"),1);
});

test("régional et national peuvent être complétés séparément sans valider les objectifs",()=>{
  const fixture={version:3,games:{"9":[{
    id:"platine-1",version:"Platine",name:"Partie Platine",
    owned:[600],done:{"story-0":true},custom:[]
  }]},active:{"9":"platine-1"}};
  const {evalCode,memory}=session("https://example.com/suivi.html?game=9&version=Platine",fixture);
  assert.equal(evalCode("dexIndex"),0);
  assert.equal(evalCode("activeDex().label"),"Sinnoh étendu");
  assert.equal(evalCode("completeSelectedDex()"),true);
  assert.equal(evalCode("getSlot().owned.length"),6);
  assert.equal(evalCode("getSlot().owned.includes(600)"),true);
  assert.equal(evalCode("getSlot().done['story-0']"),true);
  assert.equal(evalCode("dexes()[1].label"),"National");
  evalCode("dexIndex=1");
  assert.match(evalCode("dexBody(getSlot())"),/Compléter ce Pokédex/);
  assert.equal(evalCode("completeSelectedDex()"),true);
  const persisted=JSON.parse(memory.get("poke-agenda-tracker-v3"));
  assert.equal(persisted.games["9"][0].owned.length,494);
  assert.equal(persisted.games["9"][0].owned.includes(600),true);
  assert.deepEqual(persisted.games["9"][0].done,{"story-0":true});
  assert.match(evalCode("dexBody(getSlot())"),/Pokédex complété/);
});

test("la vitrine publique n'affiche aucun contrôle de modification du Pokédex",()=>{
  const profile={
    display_name:"Public",username:"public",updated_at:"2026-11-09T18:00:00Z",
    public_progress:{v:1,rows:[[14,"Alpha",2,50,"Saphir Alpha"]]}
  };
  const {evalCode}=session(
    "https://example.com/suivi.html?profil=123e4567-e89b-42d3-a456-426614174000",
    ownerData,profile
  );
  assert.doesNotMatch(evalCode("profileShowcasePage()"),/data-action="complete-dex"/);
  assert.equal(evalCode("completeSelectedDex()"),false);
});


test("le bouton de réinitialisation remet le Dex actif à zéro sans toucher à la version jumelle",()=>{
  const {evalCode,memory}=session();
  const snapshot=JSON.parse(memory.get("poke-agenda-tracker-v3"));
  assert.match(evalCode("dexBody(getSlot())"),/data-action="reset-dex"/);
  assert.match(evalCode("dexBody(getSlot())"),/Réinitialiser ce Pokédex/);
  evalCode("action('complete-dex')");
  assert.equal(evalCode("getSlot().owned.length"),5);
  evalCode("action('reset-dex')");
  const after=JSON.parse(memory.get("poke-agenda-tracker-v3"));
  assert.deepEqual(after.games["14"].find(s=>s.id==="ro-ancien"),
    snapshot.games["14"].find(s=>s.id==="ro-ancien"));
  assert.deepEqual(after.games["14"].find(s=>s.id==="sa-ancien").owned,[]);
  assert.deepEqual(after.games["14"].find(s=>s.id==="sa-ancien").done,{});
  assert.match(evalCode("dexBody(getSlot())"),/data-action="reset-dex" disabled aria-disabled="true"/);
  assert.equal(evalCode("resetSelectedDex()"),false);
  assert.equal(evalCode("getSlot().version"),"Saphir Alpha");
});

test("annuler la remise à zéro ne change rien à la sauvegarde",()=>{
  const {evalCode,memory}=session();
  const before=memory.get("poke-agenda-tracker-v3");
  evalCode("confirm=()=>false");
  assert.equal(evalCode("resetSelectedDex()"),false);
  assert.equal(memory.get("poke-agenda-tracker-v3"),before);
  assert.equal(evalCode("getSlot().owned.length"),1);
});

test("réinitialiser le régional retire aussi les espèces communes du national, sans toucher aux autres",()=>{
  const fixture={version:3,games:{"9":[{
    id:"p1",version:"Platine",name:"Partie Sinnoh",owned:[1,2,400,600],
    done:{"story-0":true},custom:[]
  }]},active:{"9":"p1"}};
  const {evalCode,memory}=session("https://example.com/suivi.html?game=9&version=Platine",fixture);
  assert.equal(evalCode("activeDex().label"),"Sinnoh étendu");
  assert.equal(evalCode("resetSelectedDex()"),true);
  assert.equal(evalCode("getSlot().owned.join(',')"),"400,600");
  evalCode("dexIndex=1");
  assert.equal(evalCode("activeDex().label"),"National");
  assert.equal(evalCode("resetSelectedDex()"),true);
  const saved=JSON.parse(memory.get("poke-agenda-tracker-v3")).games["9"][0];
  assert.deepEqual(saved.owned,[600]);
  assert.deepEqual(saved.done,{"story-0":true});
  assert.equal(evalCode("resetSelectedDex()"),false);
  assert.match(evalCode("dexBody(getSlot())"),/Réinitialiser ce Pokédex/);
});

test("si le navigateur refuse la sauvegarde, la remise à zéro annule les changements",()=>{
  const {evalCode,memory}=session();
  const before=memory.get("poke-agenda-tracker-v3");
  evalCode('localStorage.setItem=()=>{throw new Error("Storage full")}');
  assert.equal(evalCode("resetSelectedDex()"),false);
  assert.equal(memory.get("poke-agenda-tracker-v3"),before);
  assert.equal(evalCode("getSlot().owned.length"),1);
});

test("aucune action de remise à zéro disponible depuis une vitrine publique",()=>{
  const profile={display_name:"Public",username:"public",updated_at:"2026-11-09T18:00:00Z",
    public_progress:{v:1,rows:[[14,"Alpha",2,50,"Saphir Alpha"]]}};
  const {evalCode}=session("https://example.com/suivi.html?profil=123e4567-e89b-42d3-a456-426614174000",
    ownerData,profile);
  assert.doesNotMatch(evalCode("profileShowcasePage()"),/data-action="reset-dex"/);
  assert.equal(evalCode("resetSelectedDex()"),false);
});
