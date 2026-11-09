import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,readdirSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {Script} from "node:vm";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const read=path=>readFileSync(resolve(root,path),"utf8");
const fullPaths=["index.html","jeu.html","suivi.html"];
for(const dir of ["assets/calendar","assets/glossary","assets/tracker","docs"]){
  for(const file of readdirSync(resolve(root,dir))){
    if(/\.(?:html|js|css|json|md)$/.test(file))fullPaths.push(dir+"/"+file);
  }
}

test("aucune référence au logiciel tiers dans les fichiers publics",()=>{
  const forbidden=new RegExp("pk"+"hex","i");
  for(const path of fullPaths)assert.ok(!forbidden.test(read(path)),
    "La référence non souhaitée existe encore dans "+path);
});

test("la page de suivi charge bien le script et le style actualisés",()=>{
  const html=read("suivi.html");
  assert.match(html,/tracker\.js\?v=reset-dex-2/);
  assert.match(html,/tracker\.css\?v=reset-dex-2/);
  const js=read("assets/tracker/tracker.js");
  assert.match(js,/data-action="reset-dex"/);
  assert.match(js,/function resetSelectedDex\(\)/);
  assert.match(js,/S'ils figurent aussi dans un autre Pokédex/);
  new Script(js);
});

test("les pages événements et glossaires actualisent leur cache",()=>{
  const home=read("index.html");
  const game=read("jeu.html");
  assert.match(home,/calendar\/app\.js\?v=clean-site-3/);
  assert.match(home,/timed-events\.js\?v=clean-site-2/);
  assert.match(game,/glossary\/app\.js\?v=clean-site-4/);
  assert.match(game,/glossary\/style\.css\?v=clean-site-4/);
  assert.match(game,/timed-events\.js\?v=clean-site-2/);
  for(const path of ["assets/calendar/app.js","assets/glossary/app.js",
    "assets/calendar/timed-events.js","assets/tracker/tracker.js"])
    new Script(read(path));
});
