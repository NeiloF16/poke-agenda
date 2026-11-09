#!/usr/bin/env node
// Lecture du flux RSS public de Pokébip : titres, dates et liens uniquement.
// Ne classe jamais une news comme « distribution en cours » automatiquement.
import {readFile,writeFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import {resolve,dirname} from "node:path";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const output=resolve(root,"assets/calendar/news-watch.json");
const feed="https://www.pokebip.com/news.rss";
function unescapeXML(input){
  return String(input||"").replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/,"$1")
    .replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16)))
    .replace(/&#([0-9]+);/g,(_,n)=>String.fromCodePoint(Number(n)))
    .replace(/&amp;/g,"&").replace(/&quot;/g,'"')
    .replace(/&apos;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">");
}
const tag=(s,key)=>unescapeXML(s.match(new RegExp("<"+key+"(?:\\s[^>]*)?>([\\s\\S]*?)<\\/"+key+">","i"))?.[1]||"").trim();
const targets=/distribution|cadeau myst[eè]re|raids?|pok[eé]mon go|l[eé]gendes pok[eé]mon z-a|[eé]carlate|violet|prismillon/i;
const gameIds=title=>/z-a/i.test(title)?[22]:/[eé]carlate|violet/i.test(title)?[21]:/pok[eé]mon go/i.test(title)?[23]:[];
async function run(){
  let response;
  try{response=await fetch(feed,{headers:{"User-Agent":"PokeAgenda/1.0 (https://github.com/NeiloF16/poke-agenda; public RSS monitoring)","Accept":"application/rss+xml, application/xml, text/xml"},
    signal:AbortSignal.timeout(15000)});}
  catch(err){console.warn("Flux RSS indisponible : cache conservé",err.message);return}
  if(!response.ok){console.warn("HTTP RSS "+response.status+" : cache conservé");return}
  const xml=await response.text();
  const matches=[...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].map(x=>x[1]);
  if(matches.length<1){console.warn("Flux RSS sans item; cache conservé");return}
  const items=[];
  for(const item of matches){
    const title=tag(item,"title").replace(/<[^>]*>/g,"").trim();
    const url=tag(item,"link").trim();
    const dateRaw=tag(item,"pubDate");
    const d=new Date(dateRaw);
    if(!targets.test(title)||!/^https:\/\/www\.pokebip\.com\/(?:news|index\.php\/news)\//.test(url)||!Number.isFinite(+d))continue;
    if(items.some(x=>x.url===url))continue;
    items.push({title:title.slice(0,180),url,date:d.toISOString().slice(0,10),games:gameIds(title)});
    if(items.length>=25)break;
  }
  if(items.length<1){console.warn("Aucune news éligible; cache conservé");return}
  const previous=JSON.parse(await readFile(output,"utf8"));
  if(JSON.stringify(previous.items)===JSON.stringify(items)){console.log("Aucune nouvelle annonce.");return}
  const news={updatedAt:new Date().toISOString().slice(0,10),source:feed,
    note:"Ces titres de Pokébip sont des annonces, pas des distributions réputées actives. Les dates de réception sont validées séparément.",items};
  await writeFile(output,JSON.stringify(news,null,2)+"\n","utf8");
  console.log("Veille Pokébip actualisée : "+items.length+" titres et liens.");
}
await run();
