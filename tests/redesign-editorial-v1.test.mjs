import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const theme=read("assets/theme/editorial-v1.css");
const pages={
  home:read("index.html"),
  tracker:read("suivi.html"),
  guide:read("jeu.html")
};

test("la V1 charge un unique thème après le CSS existant sur chaque page",()=>{
  const styles={
    home:"assets/calendar/calendar.css",
    tracker:"assets/tracker/tracker.css",
    guide:"assets/glossary/style.css"
  };
  for(const [page,markup] of Object.entries(pages)){
    const original=markup.indexOf(styles[page]);
    const newStyle=markup.indexOf("assets/theme/editorial-v1.css?v=1");
    assert.ok(original>=0&&newStyle>original,"Ordre CSS incorrect : "+page);
    assert.equal(markup.split("editorial-v1.css").length-1,1,"Thème chargé plusieurs fois : "+page);
    assert.match(markup,new RegExp('<body data-design="editorial-v1" data-page="'+page+'">'));
  }
});

test("la refonte préserve les points d'entrée des applications et OAuth",()=>{
  assert.match(pages.home,/id="sidebar"/);
  assert.match(pages.home,/id="menuBackdrop"/);
  assert.match(pages.home,/id="pageContent"/);
  assert.match(pages.home,/id="globalSearch"/);
  assert.match(pages.home,/id="importInput"/);
  for(const url of ["assets/calendar/app.js","assets/calendar/event-engine.js","assets/calendar/timed-events.js"])
    assert.ok(pages.home.includes(url));
  assert.match(pages.tracker,/id="discordLoginButton"/);
  assert.match(pages.tracker,/id="discordLogoutButton"/);
  assert.match(pages.tracker,/id="app"/);
  for(const path of ["assets/tracker/tracker.js","assets/tracker/cloud.js","assets/tracker/dex-data.js"])
    assert.ok(pages.tracker.includes(path));
  assert.match(pages.guide,/id="glossaryApp"/);
  assert.match(pages.guide,/assets\/glossary\/app\.js/);
  assert.match(pages.guide,/assets\/glossary\/distribution-archives\.js/);
});

test("le thème est limité aux trois pages et ne modifie pas les données",()=>{
  assert.equal((theme.match(/body\[data-page="home"\]/g)||[]).length>30,true);
  assert.equal((theme.match(/body\[data-page="tracker"\]/g)||[]).length>25,true);
  assert.equal((theme.match(/body\[data-page="guide"\]/g)||[]).length>25,true);
  assert.match(theme,/--pa-navy:/);
  assert.match(theme,/--pa-blue:/);
  assert.match(theme,/--pa-green:/);
  assert.match(theme,/@media\(max-width:620px\)/);
  assert.match(theme,/@media\(prefers-reduced-motion:reduce\)/);
  assert.ok(!theme.includes("localStorage"));
  assert.ok(!theme.includes("supabase"));
});

test("le fichier CSS a des déclarations et blocs équilibrés",()=>{
  const noComments=theme.replace(/\/\*[\s\S]*?\*\//g,"");
  let depth=0;
  for(const char of noComments){
    if(char==="{")depth++;
    if(char==="}")depth--;
    assert.ok(depth>=0,"Accolade CSS fermante orpheline");
  }
  assert.equal(depth,0,"Bloc CSS non fermé");
  assert.ok(noComments.length>14000);
});

function rgb(hex){
  const raw=hex.replace("#","");
  return [0,2,4].map(i=>parseInt(raw.slice(i,i+2),16)/255);
}
function brightness(hex){
  const components=rgb(hex).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);
  return .2126*components[0]+.7152*components[1]+.0722*components[2];
}
function contrast(a,b){
  const x=brightness(a),y=brightness(b);
  return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
test("la palette principale garde un contraste lisible",()=>{
  assert.ok(contrast("#17324a","#ffffff")>=7,"Texte principal sur les cartes");
  assert.ok(contrast("#1767a7","#ffffff")>=4.5,"Liens bleus sur blanc");
  assert.ok(contrast("#ffffff","#103554")>=7,"Navigation blanche sur marine");
  assert.ok(contrast("#138b67","#ffffff")>=3.5,"Libellés verts");
});
