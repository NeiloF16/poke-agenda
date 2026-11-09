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
  assert.deepEqual(pairs.filter(x=>x[0]===14).map(x=>x[1]),["Rubis Oméga","Saphir Alpha"]);
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
  assert.deepEqual(rows.map(x=>x.game),["Rubis Oméga","Saphir Alpha"]);
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
