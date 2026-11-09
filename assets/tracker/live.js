/* Poké-Agenda — vitrines permanentes sans compte visible.
   Client uniquement. Supabase Auth anonyme + RLS propriétaire + RPC lecture ciblée.
   Ne publier que les noms des parties et les jauges, jamais les sauvegardes privées. */
(function(){
  'use strict';
  const CONFIG=window.POKE_SUPABASE_CONFIG||{};
  const OWNER_ID_KEY="poke-agenda-live-vitrine-id";
  const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const PUB_INTERVAL=45000;
  const isConfigured=()=>/^https:\/\//.test(CONFIG.url||"")&&
    /^(sb_publishable_|eyJ)/.test(CONFIG.publishableKey||"");
  const validUuid=x=>typeof x==="string"&&UUID.test(x);
  let client=null,api=null,ownerId="",publishing=false,pending=false,sending=false,
      timer=null,retryTimer=null,viewTimer=null,viewBusy=false,
      status="Pas encore publiée",lastSynced=null,
      viewer={loading:true,payload:null,updatedAt:null,error:null};
  try{const id=localStorage.getItem(OWNER_ID_KEY);if(validUuid(id))ownerId=id}catch{}

  function getClient(){
    if(!isConfigured())throw Error("Le projet Supabase n'est pas encore configuré.");
    if(!window.supabase||typeof window.supabase.createClient!=="function")throw Error("Le module Supabase est indisponible. Réessaie lorsque tu es connecté.");
    if(!client)client=window.supabase.createClient(CONFIG.url,CONFIG.publishableKey,{
      auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false},
      global:{headers:{"x-client-info":"poke-agenda-v3-vitrine"}}
    });
    return client;
  }
  function liveLink(id=ownerId){
    if(!validUuid(id))return "";
    const url=new URL("suivi.html",location.href);
    url.search="";
    url.searchParams.set("live",id);
    url.hash="";
    return url.href;
  }
  function setStatus(message){
    status=message;
    const el=document.getElementById("liveStatus");
    if(el)el.textContent=message;
    const btn=document.getElementById("livePublishButton");
    if(btn)btn.textContent=publishing?"Publication…":ownerId?"🔗 Copier mon lien permanent":"🌐 Activer ma vitrine permanente";
    if(btn)btn.disabled=publishing||!isConfigured();
  }
  function statusInfo(){
    return {configured:isConfigured(),id:ownerId,status,
      lastSynced,working:publishing};
  }
  function summary(){
    const rows=typeof api?.getRows==="function"?api.getRows():[];
    if(rows.length>100)throw Error("100 sauvegardes maximum par vitrine permanente.");
    return {v:1,rows:rows.map(r=>[
      Number(r.id),String(r.save||"").slice(0,50),
      Number(r.caught)||0,Number(r.goalPercent)||0
    ])};
  }
  async function shareLink(id=ownerId){
    const link=liveLink(id);
    if(!link){alert("Aucune vitrine permanente disponible.");return}
    try{
      if(!navigator.clipboard?.writeText)throw Error("Presse-papiers indisponible");
      await navigator.clipboard.writeText(link);
      setStatus("✓ Lien permanent copié. Il montrera les nouvelles progressions.");
    }catch{prompt("Copie le lien permanent de ta vitrine :",link)}
  }
  async function getSession(){
    const c=getClient();
    const {data,error}=await c.auth.getSession();
    if(error)throw error;
    return data?.session||null;
  }
  async function publish(){
    if(publishing)return;
    if(ownerId){await shareLink();return;}
    if(!isConfigured()){alert("Publication automatique indisponible : configure d'abord Supabase.");return;}
    const data=summary();
    if(!data.rows.length){alert("Ajoute d'abord une sauvegarde.");return;}
    if(!confirm("Publier les noms de tes sauvegardes et leurs pourcentages sur un lien public permanent ? Aucun détail de Pokémon, note ou donnée privée ne sera publié."))return;
    publishing=true;setStatus("Création de la vitrine…");
    try{
      const c=getClient();
      let session=await getSession();
      if(!session){
        const {data:auth,error}=await c.auth.signInAnonymously();
        if(error)throw error;
        session=auth?.session;
      }
      if(!session?.user?.id)throw Error("Identification anonyme impossible.");
      // Une seule vitrine par utilisateur, id stable même si on recharge la page.
      const existing=await c.from("poke_showcases").select("id").maybeSingle();
      if(existing.error)throw existing.error;
      let id=existing.data?.id;
      if(id){
        const updated=await c.from("poke_showcases").update({payload:data}).eq("id",id).select("id").maybeSingle();
        if(updated.error)throw updated.error;
        if(!updated.data)throw Error("Cette vitrine n'est plus modifiable depuis ce navigateur.");
      } else {
        const inserted=await c.from("poke_showcases").insert({payload:data}).select("id").single();
        if(inserted.error)throw inserted.error;
        id=inserted.data?.id;
      }
      if(!validUuid(id))throw Error("Le serveur n'a pas renvoyé un identifiant valide.");
      ownerId=id;
      try{localStorage.setItem(OWNER_ID_KEY,id)}catch{}
      pending=false;lastSynced=new Date();
      setStatus("✓ Vitrine publiée et synchronisée. Les prochaines coches seront envoyées automatiquement.");
      await shareLink();
    }catch(e){setStatus("Erreur de publication : "+(e?.message||String(e)))}
    finally{publishing=false;setStatus(status)}
  }
  async function sync(){
    if(sending||!pending||!ownerId||!isConfigured())return;
    if(navigator.onLine===false){setStatus("Hors connexion : la progression locale est conservée, synchronisation en attente.");return;}
    sending=true;
    if(retryTimer){clearTimeout(retryTimer);retryTimer=null}
    try{
      const c=getClient();
      const session=await getSession();
      if(!session?.user?.id){
        setStatus("Session perdue : sauvegardes locales intactes, mais cette vitrine n'est plus modifiable. Utilise « Nouvelle vitrine ».");
        return;
      }
      let count=0;
      while(pending&&count<3){
        pending=false;count++;
        const payload=summary();
        setStatus("Synchronisation de la vitrine…");
        const response=await c.from("poke_showcases")
          .update({payload}).eq("id",ownerId).select("id").maybeSingle();
        if(response.error)throw response.error;
        if(!response.data){
          setStatus("La vitrine n'est plus modifiable avec cette session. Les données locales sont conservées.");
          return;
        }
        lastSynced=new Date();
        setStatus("✓ Vitrine synchronisée à "+lastSynced.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}));
      }
    }catch(e){
      pending=true;
      setStatus("Échec temporaire de synchronisation : "+(e?.message||String(e))+". Nouvelle tentative automatique.");
      retryTimer=setTimeout(()=>{retryTimer=null;sync()},20000);
    }finally{
      sending=false;
      if(pending&&!retryTimer&&status.startsWith("✓")){timer=setTimeout(sync,1300)}
    }
  }
  function queueSync(){
    if(!ownerId||!isConfigured())return;
    pending=true;
    if(timer)clearTimeout(timer);
    timer=setTimeout(()=>{timer=null;sync()},1400);
  }
  async function resetIdentity(){
    if(!ownerId)return publish();
    if(!confirm("Créer une nouvelle vitrine avec une nouvelle adresse ? L'ancienne restera consultable, mais ne sera plus mise à jour depuis ce navigateur si son accès est perdu."))return;
    try{localStorage.removeItem(OWNER_ID_KEY)}catch{}
    ownerId="";
    try{const c=getClient();await c.auth.signOut()}catch{}
    setStatus("Nouvelle vitrine prête à créer.");
    await publish();
  }
  // La lecture publique utilise une RPC ciblée : aucun SELECT de la table exposé.
  async function pullPublic(){
    const id=publicId();
    if(!validUuid(id)){
      viewer={loading:false,payload:null,error:"Adresse de vitrine invalide.",updatedAt:null};
      api?.onPublicChange?.();
      return;
    }
    if(viewBusy||!isConfigured()){
      if(!isConfigured()){
        viewer={loading:false,payload:null,error:"La connexion aux vitrines permanentes n'est pas encore configurée.",updatedAt:null};
        api?.onPublicChange?.();
      }
      return;
    }
    viewBusy=true;
    try{
      const c=getClient();
      const {data,error}=await c.rpc("get_poke_showcase",{p_showcase_id:id});
      if(error)throw error;
      const result=Array.isArray(data)?data[0]:null;
      if(!result?.payload)throw Error("Cette vitrine n'existe pas ou n'est plus disponible.");
      const payload=result.payload;
      if(payload.v!==1||!Array.isArray(payload.rows)||payload.rows.length>100)throw Error("Format de la vitrine non pris en charge.");
      for(const row of payload.rows){
        if(!Array.isArray(row)||row.length!==4||
           !Number.isInteger(row[0])||row[0]<1||row[0]>22||
           typeof row[1]!=="string"||row[1].length>50||
           !Number.isInteger(row[2])||row[2]<0||row[2]>1025||
           !Number.isInteger(row[3])||row[3]<0||row[3]>100)
          throw Error("Données de vitrine invalides.");
      }
      const previous=JSON.stringify(viewer.payload);
      viewer={loading:false,payload,updatedAt:result.updated_at,error:null};
      if(JSON.stringify(payload)!==previous||!document.getElementById("app")?.querySelector(".live-vitrine"))api?.onPublicChange?.();
      // Afficher également les éventuelles mises à jour d'horodatage.
      const el=document.getElementById("liveRefreshTime");
      if(el)el.textContent=formatDate(result.updated_at);
    }catch(e){
      viewer={loading:false,payload:viewer.payload,error:viewer.payload?null:(e?.message||String(e)),updatedAt:viewer.updatedAt};
      api?.onPublicChange?.();
    }finally{viewBusy=false}
  }
  function formatDate(value){
    const date=new Date(value);
    return Number.isFinite(date.getTime())?date.toLocaleString("fr-FR"):"date inconnue";
  }
  function publicId(){
    const id=new URLSearchParams(location.search).get("live");
    return id||"";
  }
  function startViewer(){
    if(viewTimer)return;
    pullPublic();
    viewTimer=setInterval(()=>{
      if(document.visibilityState==="hidden")return;
      pullPublic();
    },PUB_INTERVAL);
  }
  function init(callbacks){
    api=callbacks;
    if(publicId()){
      startViewer();
    }else if(ownerId&&isConfigured()){
      // Reprendre la synchronisation si le site avait été fermé au milieu d'une modification.
      queueSync();
    }
  }
  window.addEventListener("online",()=>{if(pending)sync();if(publicId())pullPublic()});
  document.addEventListener("visibilitychange",()=>{
    if(document.visibilityState==="visible"){if(pending)sync();if(publicId())pullPublic()}
  });
  window.PokeLive={
    init,publish,shareLink,resetIdentity,queueSync,
    isConfigured,statusInfo,publicId,viewerState:()=>viewer,
    formatDate,liveLink,pullPublic
  };
})();
