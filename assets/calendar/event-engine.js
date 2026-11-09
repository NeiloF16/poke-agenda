/* Poké Agenda — moteur d'événements horodatés et de routines, sans backend ni données personnelles.
 * Les distributions limitées dans le temps sont classées depuis leurs dates vérifiées.
 * Une absence de date de fin ne veut jamais dire automatiquement « en cours ».
 */
(function (global) {
  "use strict";
  const data=global.POKE_TIMED_EVENTS||{events:[],undated:[],verifiedAt:null};
  const activities=global.POKE_DAILY_WEEKLY||{entries:[]};
  const records=global.POKE_DIST_ARCHIVES?.records||[];
  const ZONE="Europe/Paris";
  function dateFR(now) {
    return new Intl.DateTimeFormat("en-CA",{timeZone:ZONE,year:"numeric",month:"2-digit",day:"2-digit"})
      .format(now).replace(/(\d{2})\/(\d{2})\/(\d{4})/,"$3-$1-$2");
  }
  function formatDate(iso) {
    if(!/^\d{4}-\d{2}-\d{2}$/.test(iso||""))return "Date non précisée";
    const [year,month,day]=iso.split("-").map(Number);
    return new Intl.DateTimeFormat("fr-FR",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"}).format(new Date(Date.UTC(year,month-1,day)));
  }
  function classify(event,now=new Date()) {
    if(!event?.start || !event?.end)return "unknown";
    const current=dateFR(now);
    if(current<event.start)return "upcoming";
    if(event.endHourUTC) {
      const limit=Date.parse(event.end+"T"+event.endHourUTC+":59Z");
      if(!Number.isFinite(limit))return "unknown";
      return +now<=limit?"active":"past";
    }
    return current<=event.end?"active":"past";
  }
  const all=()=>data.events||[];
  const current=(now=new Date())=>all().filter(e=>classify(e,now)==="active");
  const past=(now=new Date())=>all().filter(e=>classify(e,now)==="past");
  const upcoming=(now=new Date())=>all().filter(e=>classify(e,now)==="upcoming");
  const undated=()=>data.undated||[];
  const archives=(id)=>records.filter(r=>!id||r.games.includes(Number(id)));
  const routineDay=(day,id)=> (activities.entries||[]).filter(e=>
    (!id||e.games.includes(Number(id)))&&(e.freq==="daily"||(e.freq==="weekly"&&e.days.includes(day))));
  const routinesForGame=id=>(activities.entries||[]).filter(e=>e.games.includes(Number(id)));
  global.POKE_EVENT_ENGINE={classify,formatDate,dateFR,current,past,upcoming,undated,archives,routineDay,
    routinesForGame,all,reviewedAt:data.verifiedAt,zone:ZONE};
})(window);
