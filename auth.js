/* Authentification et synchronisation facultatives via Supabase Auth + PostgREST.
   Les clés anon sont publiques; l'isolation est assurée par les politiques RLS dans schema.sql. */
window.CAPSULE_AUTH = (()=>{
 const cfg=window.CAPSULE_AUTH_CONFIG||{}, ready=Boolean(/^https:\/\//.test(cfg.url)&&cfg.anonKey);
 const K='capsule-ap-auth-session-v1';
 let session=null;try{session=JSON.parse(localStorage.getItem(K)||'null')}catch{}
 const user=()=>session?.user||null;
 const enabled=()=>ready;
 const headers=(auth=true)=>({'apikey':cfg.anonKey,'Content-Type':'application/json',...(auth&&session?.access_token?{'Authorization':'Bearer '+session.access_token}:{})});
 async function request(path,options={}){const response=await fetch(cfg.url+path,{...options,headers:{...headers(),...(options.headers||{})}});let data;try{data=await response.json()}catch{data={}}if(!response.ok)throw Error(data.msg||data.error_description||data.message||`Erreur HTTP ${response.status}`);return data;}
 function setSession(s){session=s;try{if(s)localStorage.setItem(K,JSON.stringify(s));else localStorage.removeItem(K)}catch{}}
 async function refresh(){if(!ready||!session)return null;if(session.expires_at&&session.expires_at>Date.now()/1000+60)return session;
  try{const s=await request('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:JSON.stringify({refresh_token:session.refresh_token})});setSession({...s,expires_at:Math.floor(Date.now()/1000)+(s.expires_in||3600)});return session}catch{setSession(null);return null}}
 async function login(email,password){const s=await request('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email,password})});setSession({...s,expires_at:Math.floor(Date.now()/1000)+(s.expires_in||3600)});return user()}
 async function signup(email,password){const s=await request('/auth/v1/signup',{method:'POST',body:JSON.stringify({email,password})});if(s.access_token)setSession({...s,expires_at:Math.floor(Date.now()/1000)+(s.expires_in||3600)});return s}
 async function logout(){if(ready&&session){try{await request('/auth/v1/logout',{method:'POST'})}catch{}}setSession(null)}
 async function saveProgress(data){if(!user())return;await refresh();if(!user())return;await request('/rest/v1/progress?on_conflict=user_id',{method:'POST',headers:{'Prefer':'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({user_id:user().id,data,updated_at:new Date().toISOString()})})}
 async function loadProgress(){if(!user())return null;await refresh();if(!user())return null;const a=await request('/rest/v1/progress?select=data&user_id=eq.'+encodeURIComponent(user().id)+'&limit=1');return a[0]?.data||null}
 async function sendSuggestion(category,message,lesson_id){if(!user())throw Error('Connecte-toi pour envoyer ta suggestion.');await refresh();if(!user())throw Error('Session expirée.');return request('/rest/v1/suggestions',{method:'POST',headers:{'Prefer':'return=minimal'},body:JSON.stringify({user_id:user().id,category,message,lesson_id:lesson_id||null})})}
 return {enabled,user,refresh,login,signup,logout,saveProgress,loadProgress,sendSuggestion};
})();
