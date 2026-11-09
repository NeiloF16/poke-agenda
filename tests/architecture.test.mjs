import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext, Script } from "node:vm";

const read = path => readFileSync(new URL("../" + path, import.meta.url),"utf8");
const src = {
  index:read("index.html"),
  suivi:read("suivi.html"),
  catalogue:read("catalogue.json"),
  games:read("assets/calendar/games.js"),
  app:read("assets/calendar/app.js"),
  css:read("assets/calendar/calendar.css"),
  rules:read("assets/tracker/game-rules.js"),
  tracker:read("assets/tracker/tracker.js"),
  dex:read("assets/tracker/dex-data.js"),
  cloud:read("assets/tracker/cloud.js")
};

test("la bibliothèque affiche les 23 jeux et 90 guides du catalogue canonique",()=>{
  const json=JSON.parse(src.catalogue);
  const context={window:{}};
  runInNewContext(src.games,context);
  assert.deepEqual(JSON.parse(JSON.stringify(context.window.POKE_AGENDA_GAMES)),json);
  assert.equal(json.length,23);
  assert.equal(json.reduce((sum,game)=>sum+game.pages.length,0),90);
  assert.equal(new Set(json.map(game=>game.id)).size,23);
});

test("le HTML sépare présentation, données et logique sans perturber leur ordre",()=>{
  assert.doesNotMatch(src.index,/<style(?:\s|>)/i);
  assert.doesNotMatch(src.index,/<script\s*>/i);
  const css=src.index.indexOf('assets/calendar/calendar.css');
  const games=src.index.indexOf('assets/calendar/games.js');
  const app=src.index.indexOf('assets/calendar/app.js');
  assert.ok(css>0 && games>css && app>games);
  assert.match(src.css,/url\('\.\.\/covers\/hero\.webp'\)/);
  assert.ok(src.index.includes('id="app"'));
  assert.ok(src.index.includes('id="reader"'));
});

test("les règles des 22 jeux sont séparées de la gestion des sauvegardes",()=>{
  const context={window:{}};
  runInNewContext(src.rules,context);
  runInNewContext(src.dex,context);
  const {DEX_DEFS,TASKS}=context.window.POKE_TRACKER_RULES;
  assert.equal(Object.keys(DEX_DEFS).length,22);
  assert.equal(Object.keys(TASKS).length,22);
  assert.ok(context.window.POKE_DATA.names.length>=1000);
  assert.ok(Object.values(DEX_DEFS).every(def=>def.versions?.length>0&&def.dex?.length>0));
  assert.ok(Object.values(TASKS).every(group=>Array.isArray(group.story)&&Array.isArray(group.extra)));
  assert.ok(src.tracker.includes('poke-agenda-tracker-v3'));
  assert.ok(src.tracker.includes('const {DEX_DEFS,TASKS} = window.POKE_TRACKER_RULES'));
});

test("les scripts sont valides et les sauvegardes Discord restent branchées",()=>{
  new Script(src.games,{filename:"games.js"});
  new Script(src.app,{filename:"app.js"});
  new Script(src.rules,{filename:"game-rules.js"});
  new Script(src.tracker,{filename:"tracker.js"});
  new Script(src.cloud,{filename:"cloud.js"});
  const rules=src.suivi.indexOf('game-rules.js');
  const tracker=src.suivi.indexOf('tracker.js');
  assert.ok(rules>0&&tracker>rules);
  assert.match(src.suivi,/cloud\.js/);
  assert.match(src.tracker,/PokeCloud\?\.init/);
  assert.match(src.cloud,/poke_cloud_collections/);
  assert.match(src.tracker,/Post Game et défis/);
});
