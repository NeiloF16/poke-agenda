import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext, Script} from "node:vm";

const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const data=read("assets/calendar/timed-events.js");
const regular=read("assets/glossary/daily-weekly.js");
const archive=read("assets/glossary/distribution-archives.js");
const engineJS=read("assets/calendar/event-engine.js");
const home=read("assets/calendar/app.js");
const guide=read("assets/glossary/app.js");
const index=read("index.html");
const jeu=read("jeu.html");
const win={};
for(const src of [data,regular,archive,engineJS])runInNewContext(src,{window:win,Intl,Date});
const hub=win.POKE_EVENT_ENGINE;

test("l'accueil sait classer les cadeaux Z-A et raids par dates officielles",()=>{
  const today=new Date("2026-11-09T12:00:00Z");
  const active=hub.current(today).map(x=>x.id);
  assert.ok(active.includes("za-spewpa-2026"));
  assert.ok(active.includes("za-vivillon-ball-2026"));
  assert.ok(active.includes("sv-goodra-2026-11"));
  assert.ok(active.includes("go-wild-2026"));
  assert.ok(!active.includes("sv-hydreigon-2026-10"));
  const completed=hub.past(today).map(x=>x.id);
  assert.ok(completed.includes("sv-hydreigon-2026-10"));
  assert.ok(hub.upcoming(today).some(x=>x.id==="go-wild-weekend-2026"));
});

test("Pérégrain devient archivé après la minute finale en UTC",()=>{
  const p=hub.all().find(x=>x.id==="za-spewpa-2026");
  assert.equal(hub.classify(p,new Date("2026-11-19T01:58:00Z")),"active");
  assert.equal(hub.classify(p,new Date("2026-11-19T02:01:00Z")),"past");
  assert.equal(hub.formatDate("2026-11-19"),"19 novembre 2026");
  assert.equal(hub.dateFR(new Date("2026-11-09T12:00:00Z")),"2026-11-09");
});

test("pas de distribution active inventée quand la date de fin est inconnue",()=>{
  assert.ok(hub.undated().some(x=>x.id==="za-diancite"));
  for(const event of hub.undated())assert.equal(hub.classify(event),"unknown");
  assert.ok(win.POKE_TIMED_EVENTS.events.every(x=>x.source.startsWith("https://")));
  assert.ok(win.POKE_TIMED_EVENTS.events.every(x=>x.start<=x.end));
});

test("130 activités documentées : horaires, jours de semaine et Pokébip",()=>{
  assert.equal(win.POKE_DAILY_WEEKLY.entries.length,130);
  assert.equal(win.POKE_DAILY_WEEKLY.entries.filter(e=>e.freq==="weekly").length,26);
  assert.equal(win.POKE_DAILY_WEEKLY.entries.filter(e=>e.freq==="daily").length,104);
  const friday=hub.routineDay(5,10);
  assert.ok(friday.some(x=>x.title.includes("Lokhlass")));
  const monday=hub.routineDay(1,14);
  assert.ok(monday.some(x=>x.title.includes("vitamines")));
  assert.ok(!hub.routineDay(5,14).some(x=>x.title.includes("vitamines")));
  for(const entry of win.POKE_DAILY_WEEKLY.entries){
    assert.match(entry.source,/^https:\/\/www\.pokebip\.com\//);
    assert.ok(entry.games.every(id=>id>=1&&id<=23));
    assert.ok(entry.freq==="daily"||entry.freq==="weekly");
    if(entry.freq==="weekly")assert.ok(entry.days.length>0);
  }
});

test("les anciennes distributions ne disparaissent pas lors du passage à la date suivante",()=>{
  const old=hub.archives(14);
  assert.ok(old.some(e=>e.name.includes("Diancie chromatique")));
  assert.equal(hub.archives().length,68);
  assert.ok(hub.past(new Date("2027-11-21T20:00:00Z")).some(x=>x.id==="za-spewpa-2026"));
});

test("scripts chargés en ordre, affichages du catalogue et des tâches opérationnels",()=>{
  new Script(home);new Script(guide);new Script(engineJS);
  for(const markup of [index,jeu]){
    const a=markup.indexOf("timed-events.js");
    const b=markup.indexOf("event-engine.js");
    const c=markup.indexOf("daily-weekly.js");
    assert.ok(a>0&&b>a&&c>0);
  }
  assert.ok(index.includes('data-view="events"'));
  assert.match(home,/function hubPreview/);
  assert.match(home,/function eventDesk/);
  assert.match(home,/function routineDayCard/);
  assert.match(guide,/function regularPanel/);
  assert.match(guide,/function datedPanel/);
  const cloud=read("assets/tracker/cloud.js");
  assert.match(cloud,/poke_cloud_collections/);
});
