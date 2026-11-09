/* Poké Agenda V4 — identité Discord, cloud privé et vitrine publique.
 * Site statique (GitHub Pages) : aucune clé secrète ne doit être incluse ici.
 * Les sauvegardes privées sont protégées PAR RLS dans Supabase.
 */
(function () {
  "use strict";
  const CONFIG = window.POKE_SUPABASE_CONFIG || {};
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const OWNER_KEY = "poke-agenda-cloud-user-v4";
  const DIRTY_KEY = "poke-agenda-cloud-dirty-v4";
  const VERSION_KEY = "poke-agenda-cloud-version-v4";
  const BACKUP_KEY = "poke-agenda-v3-before-discord-v4";
  const SAVE_KEY = "poke-agenda-tracker-v3";
  const PUBLIC_REFRESH_MS = 45000;
  const isConfigured = () => /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(CONFIG.url || "")
    && /^(sb_publishable_|eyJ)/.test(CONFIG.publishableKey || "");
  const asUuid = value => typeof value === "string" && UUID.test(value);
  const blank = () => ({version:3,games:{},active:{}});
  const validStore = value => value && value.version === 3
    && value.games && typeof value.games === "object" && !Array.isArray(value.games);
  const getLocal = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const setLocal = (key,value) => { try { localStorage.setItem(key,value); } catch {} };
  const delLocal = key => { try { localStorage.removeItem(key); } catch {} };
  const hasProgress = data => Object.values(data?.games || {}).some(saves =>
    Array.isArray(saves) && saves.some(s => (s.owned || []).length ||
      Object.values(s.done || {}).some(Boolean) || (s.custom || []).length));
  const imgURL = input => {
    if (typeof input !== "string") return null;
    const clean = input.split("?")[0];
    return /^https:\/\/cdn\.discordapp\.com\/(avatars\/[0-9]{16,22}\/[A-Za-z0-9_]+|banners\/[0-9]{16,22}\/[A-Za-z0-9_]+|embed\/avatars\/[0-9]+)\.(png|webp|gif)$/.test(clean) ? clean : null;
  };
  const accent = n => Number.isInteger(n) && n >= 0 && n <= 16777215
    ? "#" + n.toString(16).padStart(6,"0") : null;
  const params = new URLSearchParams(location.search);
  const publicId = params.get("profil");
  const isPublic = publicId !== null;
  const readOnlyLegacy = !!params.get("live") || String(location.hash || "").startsWith("#v1=");
  let sdkPromise = null, client = null, api = null, user = null, profile = null;
  let version = null, ready = false, dirty = false, sending = false, busy = false;
  let conflict = false, serial = 0, timer = null, poll = null;
  let status = "Connecte-toi avec Discord pour retrouver ta collection partout.";
  let viewer = {loading: true, profile: null, error: null};

  async function getClient() {
    if (!isConfigured()) throw Error("Supabase n'est pas configuré.");
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      if (!sdkPromise) sdkPromise = new Promise((resolve,reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
        script.async = true;
        script.onload = resolve;
        script.onerror = () => reject(Error("Impossible de charger le module Supabase."));
        document.head.appendChild(script);
      }).catch(e => { sdkPromise = null; throw e; });
      await sdkPromise;
    }
    if (!client) client = window.supabase.createClient(CONFIG.url,CONFIG.publishableKey,{
      auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:"implicit"},
      global:{headers:{"x-client-info":"poke-agenda-v4-discord"}}
    });
    return client;
  }
  function isDiscord(account) {
    return !!account && (
      account.identities?.some(i => i.provider === "discord") ||
      account.app_metadata?.providers?.includes("discord") ||
      account.app_metadata?.provider === "discord"
    ) && !account.is_anonymous;
  }
  function notify() {
    const login = document.getElementById("discordLoginButton");
    const logout = document.getElementById("discordLogoutButton");
    if (login) login.hidden = !!user || isPublic || readOnlyLegacy;
    if (logout) logout.hidden = !user || isPublic || readOnlyLegacy;
    const who = document.getElementById("discordWho");
    if (who) who.textContent = user ? (profile?.display_name || "Compte Discord connecté") : "";
    api?.onChange?.();
  }
  function statusInfo() {
    return {configured:isConfigured(),user,profile,ready,conflict,busy,sending,status,
      id:user?.id || null,version};
  }
  function viewerState() { return viewer; }
  function profileLink(id=user?.id) {
    if (!asUuid(id)) return "";
    const url = new URL("suivi.html",location.href);
    url.search = ""; url.hash = "";
    url.searchParams.set("profil",id);
    return url.href;
  }
  async function copyLink() {
    const link = profileLink();
    if (!link) { alert("Connecte-toi d'abord avec Discord."); return; }
    try { await navigator.clipboard.writeText(link); status = "✓ Lien du profil copié."; notify(); }
    catch { prompt("Lien public de ton profil :",link); }
  }
  async function login() {
    if (!isConfigured()) { alert("Supabase doit être configuré."); return; }
    try {
      const c = await getClient();
      const {data,error} = await c.auth.getSession();
      if (error) throw error;
      if (data?.session && !isDiscord(data.session.user)) {
        // Nouveau départ voulu pour la V4 : ne pas attacher Discord à l'ancien compte anonyme.
        const out = await c.auth.signOut();
        if (out.error) throw out.error;
      }
      const redirect = new URL("suivi.html",location.href);
      redirect.search = ""; redirect.hash = "";
      const response = await c.auth.signInWithOAuth({
        provider:"discord",options:{redirectTo:redirect.href,scopes:"identify"}
      });
      if (response.error) throw response.error;
    } catch (e) { status = "Connexion Discord impossible : " + (e.message || e); notify(); }
  }
  function restoreLocal(data) {
    if (!validStore(data)) throw Error("Données de sauvegarde incompatibles.");
    api?.setStore?.(data);
  }
  function markDirty() {
    if (!user) return;
    serial++;
    dirty = true;
    setLocal(OWNER_KEY,user.id);
    setLocal(DIRTY_KEY,JSON.stringify({userId:user.id,version}));
  }
  function schedule() {
    if (!user || !ready || conflict) return;
    clearTimeout(timer);
    timer = setTimeout(() => { flush(); },1300);
  }
  function queueSync() {
    if (!user || !ready) return; // Mode local tant que la connexion n'est pas prête.
    markDirty();
    status = navigator.onLine === false
      ? "Hors connexion : sauvegarde locale conservée, synchronisation en attente."
      : "Modifications enregistrées sur cet appareil ; envoi vers le cloud…";
    schedule();
  }
  function summary() {
    const rows = api?.getRows?.() || [];
    if (rows.length > 100) throw Error("100 sauvegardes maximum par vitrine.");
    return {v:1,rows:rows.map(r => [
      Number(r.id),String(r.save || "").slice(0,50),
      Math.max(0,Number(r.caught) || 0),
      Math.max(0,Math.min(100,Number(r.goalPercent) || 0)),
      String(r.version || "").slice(0,50)
    ])};
  }
  async function updatePublicProgress() {
    const c = await getClient();
    const payload = summary();
    const {data,error} = await c.from("poke_discord_profiles")
      .update({public_progress:payload})
      .eq("user_id",user.id).select("user_id").maybeSingle();
    if (error) throw error;
    if (!data) throw Error("Profil Discord non trouvé : reconnecte-toi.");
  }
  async function flush() {
    if (!dirty || !user || !ready || conflict || sending) return !dirty;
    if (navigator.onLine === false) { status = "Hors connexion : données locales intactes."; notify(); return false; }
    sending = true;
    const snapshot = api?.getStore?.();
    const capturedSerial = serial, capturedUserId = user.id, expected = version;
    try {
      if (!validStore(snapshot) || !Number.isInteger(expected)) throw Error("Sauvegarde non initialisée.");
      const c = await getClient();
      const {data,error} = await c.from("poke_cloud_collections")
        .update({data:snapshot,version:expected+1})
        .eq("user_id",capturedUserId).eq("version",expected)
        .select("version").maybeSingle();
      if (error) throw error;
      if (!data) {
        conflict = true;
        status = "Conflit entre appareils : aucune donnée écrasée. Exporte ton JSON, puis recharge la version cloud.";
        return false;
      }
      version = data.version;
      setLocal(VERSION_KEY,String(version));
      if (user?.id === capturedUserId && serial === capturedSerial) {
        dirty = false; delLocal(DIRTY_KEY);
      }
      try { await updatePublicProgress(); }
      catch(e) { status = "Collection sauvegardée, mais vitrine non actualisée : " + (e.message || e); return !dirty; }
      status = dirty ? "Autres modifications à envoyer…" : "✓ Sauvegarde cloud et vitrine synchronisées.";
      return !dirty;
    } catch(e) {
      status = "Synchronisation en échec (JSON local conservé) : " + (e.message || e);
      return false;
    } finally {
      sending = false;
      notify();
      if (dirty && !conflict && user?.id === capturedUserId && serial !== capturedSerial) schedule();
    }
  }
  async function createCollection(data) {
    const c = await getClient();
    const {data:created,error} = await c.from("poke_cloud_collections")
      .insert({user_id:user.id,data,version:1})
      .select("version").single();
    if (error) throw error;
    version = created.version; ready = true; dirty = false;
    setLocal(OWNER_KEY,user.id); setLocal(VERSION_KEY,String(version)); delLocal(DIRTY_KEY);
    restoreLocal(data);
  }
  function archiveLocal(data) {
    if (validStore(data) && hasProgress(data)) setLocal(BACKUP_KEY,JSON.stringify(data));
  }
  async function loadCollection() {
    const c = await getClient();
    const {data:row,error} = await c.from("poke_cloud_collections")
      .select("data,version").eq("user_id",user.id).maybeSingle();
    if (error) throw error; // Aucune réinitialisation si la migration SQL est absente.
    const local = api?.getStore?.() || blank();
    const priorOwner = getLocal(OWNER_KEY);
    let pending = null;
    try { pending = JSON.parse(getLocal(DIRTY_KEY) || "null"); } catch {}
    if (row) {
      if (!validStore(row.data)) throw Error("Sauvegarde distante invalide : aucune donnée remplacée.");
      version = row.version;
      if (pending?.userId === user.id && priorOwner === user.id && validStore(local)) {
        if (pending.version === version) {
          ready = true; dirty = true; serial++; status = "Modifications locales non envoyées : reprise de la synchronisation.";
          schedule(); return;
        }
        conflict = true; status = "Conflit entre appareils. Ton JSON local est intact ; exporte-le avant de choisir la version cloud.";
        return;
      }
      archiveLocal(local);
      restoreLocal(row.data); ready = true; dirty = false;
      setLocal(OWNER_KEY,user.id); setLocal(VERSION_KEY,String(version)); delLocal(DIRTY_KEY);
    } else {
      // Pas de base cloud : l'utilisateur choisit explicitement une importation locale.
      const recoverPending = pending?.userId === user.id && priorOwner === user.id && validStore(local);
      const migrate = recoverPending || (hasProgress(local) && priorOwner !== user.id &&
        confirm("Tu as une progression locale. L'importer dans ton nouveau compte Discord ?\n\nAnnuler = commencer une collection vide (un exemplaire local sera conservé)."));
      const seed = migrate ? local : blank();
      if (!migrate) archiveLocal(local);
      await createCollection(seed);
    }
  }
  function cleanDiscordUsername(value) {
    // Les anciens tags Discord (ex. flyneilo#0) n'ont plus leur place ici.
    return String(value ?? "").trim().replace(/#\d{1,4}$/, "").slice(0,80);
  }
  async function syncDiscordProfile(session) {
    if (!user) return;
    const c = await getClient();
    // Une session Supabase restaurée n'a généralement plus son provider_token
    // Discord. Ne pas écraser le vrai nom d'affichage avec le @username.
    const {data:existing,error:existingError} = await c.from("poke_discord_profiles")
      .select("user_id,display_name,username,avatar_url,banner_url,accent_color")
      .eq("user_id",user.id).maybeSingle();
    if (existingError) throw existingError;

    let discord = null;
    const token = session?.provider_token;
    if (token) {
      try {
        const response = await fetch("https://discord.com/api/v10/users/@me",{
          headers:{Authorization:"Bearer " + token},cache:"no-store"
        });
        if (response.ok) {
          const payload = await response.json();
          if (payload && typeof payload.id === "string" && typeof payload.username === "string")
            discord = payload;
        }
      } catch { /* La sauvegarde et le profil existant restent accessibles. */ }
    }
    const metadata = user.user_metadata || {};
    const username = cleanDiscordUsername(discord?.username || existing?.username ||
      metadata.user_name || metadata.preferred_username || metadata.name || "Dresseur") || "Dresseur";
    const fallbackName = String(metadata.full_name || metadata.global_name ||
      metadata.name || username).trim().slice(0,80) || username;
    // Le nom d'affichage public est distinct de l'identifiant @username.
    // Un choix explicite dans Poké Agenda doit rester stable entre navigateurs
    // et ne pas être écrasé par une reconnexion OAuth.
    const preferredName = String(metadata.poke_agenda_display_name || "").trim().slice(0,80);
    const displayName = String(preferredName || discord?.global_name ||
      existing?.display_name || metadata.global_name || fallbackName ||
      discord?.username || username).trim().slice(0,80) || username;

    // Sans nouvelles données Discord, conserver le profil précédent ; seul
    // un ancien suffixe #1234 peut justifier une normalisation en base.
    if (!discord && existing && existing.username === username &&
        existing.display_name === displayName) {
      profile = existing;
      return;
    }

    const discordId = discord?.id;
    const avatar = discordId && discord.avatar
      ? imgURL("https://cdn.discordapp.com/avatars/" + discordId + "/" + discord.avatar +
        (discord.avatar.startsWith("a_") ? ".gif" : ".webp"))
      : imgURL(existing?.avatar_url) || imgURL(metadata.avatar_url);
    const banner = discordId && discord.banner
      ? imgURL("https://cdn.discordapp.com/banners/" + discordId + "/" + discord.banner +
        (discord.banner.startsWith("a_") ? ".gif" : ".webp"))
      : imgURL(existing?.banner_url);
    const {error} = await c.rpc("upsert_poke_discord_profile",{
      p_display_name:displayName,p_username:username,
      p_avatar_url:avatar,p_banner_url:banner,
      p_accent_color:accent(discord?.accent_color) || existing?.accent_color || null
    });
    if (error) throw error;
    const {data:own,error:readError} = await c.from("poke_discord_profiles")
      .select("user_id,display_name,username,avatar_url,banner_url,accent_color")
      .eq("user_id",user.id).maybeSingle();
    if (readError) throw readError;
    profile = own;
  }
  async function editDisplayName() {
    if (!isDiscord(user)) {
      alert("Connecte-toi avec Discord pour modifier le nom de ton profil.");
      return;
    }
    const current = profile?.display_name || user.user_metadata?.poke_agenda_display_name || "";
    const value = prompt("Nom affiché sur ta vitrine Pokémon (différent de @username) :",current);
    if (value === null) return;
    const name = String(value).trim();
    if (!name || name.length > 80) {
      alert("Choisis un nom de 1 à 80 caractères.");
      return;
    }
    try {
      const c = await getClient();
      // Préférence non sensible, conservée par Supabase Auth sur tous les appareils.
      // Les règles d'accès aux sauvegardes reposent toujours sur auth.uid().
      const {data:updated,error:updateError} = await c.auth.updateUser({
        data:{poke_agenda_display_name:name}
      });
      if (updateError) throw updateError;
      if (updated?.user) user=updated.user;
      else user={...user,user_metadata:{...user.user_metadata,poke_agenda_display_name:name}};
      const username = cleanDiscordUsername(profile?.username ||
        user.user_metadata?.user_name || user.user_metadata?.name || "Dresseur") || "Dresseur";
      const {error:profileError} = await c.rpc("upsert_poke_discord_profile",{
        p_display_name:name,
        p_username:username,
        p_avatar_url:imgURL(profile?.avatar_url),
        p_banner_url:imgURL(profile?.banner_url),
        p_accent_color:profile?.accent_color || null
      });
      if (profileError) throw profileError;
      profile={...profile,display_name:name,username};
      status="✓ Nom d'affichage enregistré : "+name+". Ta vitrine publique est actualisée.";
      notify();
    } catch (e) {
      status="Impossible d'enregistrer le nom : "+(e.message || e);
      notify();
    }
  }
  async function refreshDiscordProfile() {
    if (!user) return login();
    if (!ready || conflict || (dirty && !(await flush()))) {
      alert("Sauvegarde cloud non prête : exporte ton JSON et résous les conflits avant de réactualiser Discord.");
      return;
    }
    // Demande un nouvel aller-retour OAuth pour récupérer global_name, avatar,
    // bannière, sans changer le compte Supabase ni son identifiant public.
    return login();
  }
  async function bootAccount(session) {
    if (!isDiscord(session?.user)) return;
    user = session.user;
    status = "Récupération de ton compte Discord et de ta collection…";
    notify();
    try {
      await loadCollection(); // La collection cloud est prioritaire sur le navigateur.
      if (!conflict) {
        try { await syncDiscordProfile(session); }
        catch(e) { status = "Collection accessible ; profil Discord à compléter : " + (e.message || e); }
        if (!dirty) {
          try { await updatePublicProgress(); }
          catch(e) { status = "Collection accessible ; vitrine à initialiser : " + (e.message || e); }
        }
      }
      if (!conflict && !dirty && !status.includes("à compléter") && !status.includes("à initialiser"))
        status = "✓ Connecté à Discord : progression sauvegardée dans Supabase.";
    } catch(e) {
      status = "Cloud indisponible : données locales conservées. " + (e.message || e);
      ready = false;
    } finally { notify(); }
  }
  async function logout() {
    if (!user) return;
    if (!ready && !conflict) {
      alert("Le cloud n'est pas prêt. Exporte ton JSON avant de te déconnecter pour ne rien perdre.");
      return;
    }
    if (conflict) {
      alert("Conflit entre appareils : exporte ton JSON et résous le conflit avant de te déconnecter.");
      return;
    }
    clearTimeout(timer);
    if (dirty && !(await flush())) {
      alert("La synchronisation a échoué. Exporte ton JSON avant de te déconnecter.");
      return;
    }
    try {
      const {error} = await (await getClient()).auth.signOut();
      if (error) throw error;
      // Ne jamais laisser une collection personnelle visible dans le navigateur partagé.
      user = null; profile = null; ready = false; dirty = false; conflict = false; version = null;
      delLocal(DIRTY_KEY); delLocal(OWNER_KEY); delLocal(VERSION_KEY);
      delLocal(SAVE_KEY);
      restoreLocal(blank());
      status = "Déconnecté. Connecte-toi avec Discord pour retrouver tes données.";
      notify();
    } catch(e) { status = "Déconnexion impossible : " + (e.message || e); notify(); }
  }
  async function reloadFromCloud() {
    if (!user || !conflict) return;
    if (!confirm("Remplacer les données locales par celles du cloud ? Exporte ton JSON avant si nécessaire.")) return;
    try {
      const {data,error} = await (await getClient()).from("poke_cloud_collections")
        .select("data,version").eq("user_id",user.id).single();
      if (error) throw error;
      archiveLocal(api?.getStore?.()); restoreLocal(data.data);
      version = data.version; ready = true; conflict = false; dirty = false;
      delLocal(DIRTY_KEY); setLocal(VERSION_KEY,String(version));
      status = "✓ Dernière version cloud chargée."; notify();
    } catch(e) { status = "Chargement impossible : " + (e.message || e); notify(); }
  }
  async function loadPublic() {
    if (!isPublic) return;
    if (!asUuid(publicId)) { viewer = {loading:false,profile:null,error:"Lien de profil invalide."}; notify(); return; }
    try {
      const c = await getClient();
      const {data,error} = await c.rpc("get_poke_discord_profile",{p_user_id:publicId});
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      viewer = {loading:false,profile:row || null,error:row ? null : "Profil introuvable."};
    } catch(e) { viewer = {loading:false,profile:null,error:e.message || String(e)}; }
    notify();
  }
  async function init(adapter) {
    api = adapter;
    if (readOnlyLegacy) return; // Les anciennes vitrines V3 restent indépendantes.
    if (isPublic) {
      await loadPublic();
      poll = setInterval(loadPublic,PUBLIC_REFRESH_MS);
      return;
    }
    if (!isConfigured()) { status = "Supabase non configuré."; notify(); return; }
    try {
      const c = await getClient();
      const {data,error} = await c.auth.getSession();
      if (error) throw error;
      if (isDiscord(data?.session?.user)) await bootAccount(data.session);
      else notify();
    } catch(e) { status = "Connexion indisponible : " + (e.message || e); notify(); }
    window.addEventListener("online",() => { if (dirty && !conflict) schedule(); });
    document.addEventListener("visibilitychange",() => {
      if (document.visibilityState === "visible" && dirty && !conflict) schedule();
    });
  }
  window.PokeCloud = {init,login,refreshDiscordProfile,editDisplayName,logout,copyLink,reloadFromCloud,queueSync,flush,
    statusInfo,viewerState,isEnabled:() => !readOnlyLegacy && !isPublic,
    isPublic,profileLink};
})();
