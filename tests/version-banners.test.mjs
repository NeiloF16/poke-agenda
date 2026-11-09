import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,statSync,existsSync} from "node:fs";
import {runInNewContext} from "node:vm";
import {fileURLToPath} from "node:url";
import {resolve,dirname} from "node:path";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const rules=readFileSync(resolve(root,"assets/tracker/game-rules.js"),"utf8");
const script=readFileSync(resolve(root,"assets/tracker/tracker.js"),"utf8");
const calendar=readFileSync(resolve(root,"assets/calendar/app.js"),"utf8");
const cover=(id,version)=>{
  const slug=version.normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .toLowerCase().replace(/['’]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  return "assets/covers/versions/"+String(id).padStart(2,"0")+"-"+slug+".webp";
};
const window={};
runInNewContext(rules,{window});
const defs=window.POKE_TRACKER_RULES.DEX_DEFS;

test("38 versions ont chacune une image indépendante et non vide",()=>{
  const names=Object.entries(defs).flatMap(([id,def])=>def.versions.map(version=>cover(Number(id),version)));
  assert.equal(names.length,38);
  assert.equal(new Set(names).size,38);
  for(const name of names){
    const path=resolve(root,name);
    assert.ok(existsSync(path),"Fichier manquant : "+name);
    assert.ok(statSync(path).size>100,"Fichier vide : "+name);
  }
});

test("le suivi et les vitrines utilisent les bannières par version",()=>{
  assert.match(script,/function coverOf\(id,version\)/);
  assert.match(script,/coverOf\(id,version\)/);
  assert.match(script,/coverOf\(id,s\.version\)/);
  assert.match(script,/coverOf\(gameId,selectedVersion\)/);
  assert.match(script,/assets\/covers\/versions\//);
});

test("la bibliothèque conserve les bannières des duos",()=>{
  assert.doesNotMatch(calendar,/assets\/covers\/versions\//);
  const catalogue=JSON.parse(readFileSync(resolve(root,"catalogue.json"),"utf8"));
  assert.equal(catalogue.length,23);
  assert.match(catalogue[13].cover,/assets\/covers\/14\.webp/);
});
