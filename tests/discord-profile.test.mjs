import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";

const cloudSource=readFileSync(new URL("../assets/tracker/cloud.js",import.meta.url),"utf8");
const trackerSource=readFileSync(new URL("../assets/tracker/tracker.js",import.meta.url),"utf8");
const userId="123e4567-e89b-42d3-a456-426614174000";

async function boot({providerToken,discord,displayName="Neilo",username="flyneilo#0",
  preferredName=null,promptValue=null}) {
  const stored=new Map();
  const progress={version:3,games:{},active:{}};
  let profile={user_id:userId,discord_id:"1569310285012140132",display_name:displayName,
    username,avatar_url:null,banner_url:null,accent_color:null,public_progress:{v:1,rows:[]}};
  let updates=[];
  let fetchCount=0;
  const user={
    id:userId,is_anonymous:false,identities:[{provider:"discord"}],
    user_metadata:{name:"flyneilo",user_name:"flyneilo",...(preferredName?{poke_agenda_display_name:preferredName}:{})}
  };
  const client={
    auth:{
      getSession:async()=>({data:{session:{user,provider_token:providerToken}},error:null}),
      updateUser:async({data})=>{
        Object.assign(user.user_metadata,data);
        return {data:{user},error:null};
      }
    },
    from(table){
      let operation="select",payload=null;
      const query={
        select(){return query},
        eq(){return query},
        update(data){operation="update";payload=data;return query},
        async maybeSingle(){
          if(table==="poke_cloud_collections")return{data:{data:progress,version:1},error:null};
          if(table!=="poke_discord_profiles")throw Error("Unexpected table "+table);
          if(operation==="update")profile={...profile,...payload};
          return {data:profile,error:null};
        }
      };
      return query;
    },
    async rpc(name,args){
      assert.equal(name,"upsert_poke_discord_profile");
      updates.push(args);
      profile={...profile,display_name:args.p_display_name,username:args.p_username};
      return {data:userId,error:null};
    }
  };
  const window={
    POKE_SUPABASE_CONFIG:{url:"https://example.supabase.co",publishableKey:"sb_publishable_example"},
    supabase:{createClient:()=>client},addEventListener(){}
  };
  const context={
    window,location:{search:"",hash:"",href:"https://example.github.io/poke-agenda/suivi.html"},
    URL,URLSearchParams,navigator:{onLine:true},
    localStorage:{getItem:key=>stored.get(key)||null,setItem:(key,value)=>stored.set(key,value),
      removeItem:key=>stored.delete(key)},
    document:{getElementById(){return null},addEventListener(){}},
    fetch:async()=>{fetchCount++;return{ok:true,json:async()=>discord}},
    setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,
    alert(){},confirm:()=>false,prompt:()=>promptValue
  };
  runInNewContext(cloudSource,context);
  const adapter={getStore:()=>progress,setStore(){},getRows:()=>[],onChange(){}};
  await window.PokeCloud.init(adapter);
  return {profile,updates,fetchCount,cloud:window.PokeCloud.statusInfo(),
    getProfile:()=>profile,api:window.PokeCloud,metadata:user.user_metadata};
}

test("une session restaurée garde le nom d'affichage Discord d'origine",async()=>{
  const result=await boot({providerToken:null,discord:null,displayName:"Neilo",username:"flyneilo"});
  assert.equal(result.profile.display_name,"Neilo");
  assert.equal(result.profile.username,"flyneilo");
  assert.equal(result.updates.length,0,"Aucune écriture RPC inutile");
  assert.equal(result.fetchCount,0);
});

test("les anciens identifiants Discord #0 sont corrigés sans écraser le pseudo",async()=>{
  const result=await boot({providerToken:null,discord:null,displayName:"Neilo",username:"flyneilo#0"});
  assert.equal(result.profile.display_name,"Neilo");
  assert.equal(result.profile.username,"flyneilo");
  assert.equal(result.updates.length,1);
  assert.equal(result.updates[0].p_display_name,"Neilo");
});

test("la nouvelle connexion Discord rafraîchit global_name",async()=>{
  const result=await boot({
    providerToken:"test-provider-token",
    discord:{id:"1569310285012140132",username:"flyneilo",global_name:"Neilo",
      avatar:null,banner:null,accent_color:null},
    displayName:"flyneilo",username:"flyneilo#0"
  });
  assert.equal(result.profile.display_name,"Neilo");
  assert.equal(result.profile.username,"flyneilo");
  assert.equal(result.fetchCount,1);
  assert.equal(result.updates.length,1);
});

test("le profil public affiche un @ propre et permet d'actualiser Discord",()=>{
  assert.ok(trackerSource.includes('data-action="cloud-refresh-discord"'));
  assert.ok(trackerSource.includes('data-action="cloud-edit-name"'));
  assert.ok(trackerSource.includes("refreshDiscordProfile()"));
  assert.match(trackerSource,/replace\(\/#\\d\{1,4\}\$\//);
  assert.equal("@flyneilo#0".replace(/^@/,"").replace(/#\d{1,4}$/,""),"flyneilo");
});

test("nom choisi pour la vitrine : Neilo, indépendamment de @flyneilo",async()=>{
  const result=await boot({
    providerToken:"test-provider-token",promptValue:"Neilo",
    discord:{id:"1569310285012140132",username:"flyneilo",global_name:null,
      avatar:null,banner:null,accent_color:null},
    displayName:"flyneilo",username:"flyneilo"
  });
  await result.api.editDisplayName();
  assert.equal(result.getProfile().display_name,"Neilo");
  assert.equal(result.getProfile().username,"flyneilo");
  assert.equal(result.metadata.poke_agenda_display_name,"Neilo");
  assert.equal(result.updates.at(-1).p_display_name,"Neilo");
});

test("la préférence de nom enregistrée passe avant le nom Discord à la reconnexion",async()=>{
  const result=await boot({
    providerToken:"test-provider-token",preferredName:"Neilo",
    discord:{id:"1569310285012140132",username:"flyneilo",global_name:"Flynielo",
      avatar:null,banner:null,accent_color:null},
    displayName:"Flynielo",username:"flyneilo"
  });
  assert.equal(result.getProfile().display_name,"Neilo");
  assert.equal(result.getProfile().username,"flyneilo");
});
