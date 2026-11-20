const SB = window.supabase.createClient(CFG.url, CFG.key, {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const $ = id => document.getElementById(id);
const esc = x => String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ROOT='root';
const ICONS={
 book:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19a2 2 0 0 1 2-2h13"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 brain:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.3.3.5.7.5 1.1V16h6v-1c0-.4.2-.8.5-1.1A6 6 0 0 0 12 3z"/>',
 globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
 calc:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2"/>',
 text:'<path d="M4 19 10 5l6 14M6.5 14h7M19 11v8M19 14.5a2.5 2.5 0 1 0 0 .1"/>',
 monitor:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
 grid:'<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
 star:'<path d="m12 3 2.7 5.6 6.1.9-4.400 4.300 1 6.1L12 17l-5.400 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
 play:'<circle cx="12" cy="12" r="9"/><path d="m10 8.5 6 3.5-6 3.5z"/>',
 flask:'<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.800 3h10.400a2 2 0 0 0 1.800-3l-5-9V3"/>'
};
const icon=k=>`<svg viewBox="0 0 24 24">${ICONS[k]||ICONS.book}</svg>`;
function ytId(u){try{const x=new URL(u),h=x.hostname.replace(/^www\./,'');let id='';
  if(h==='youtu.be')id=x.pathname.slice(1);
  else if(h==='youtube.com'||h==='m.youtube.com')id=x.searchParams.get('v')||((x.pathname.match(/\/(?:shorts|embed|live)\/([\w-]{11})/)||[])[1]||'');
  return /^[\w-]{11}$/.test(id)?id:''}catch(e){return ''}}
async function loadAll(){
  const [n,r,s]=await Promise.all([SB.from('nodes').select('*').order('sort_order'),SB.from('resources').select('*').order('sort_order'),SB.from('settings').select('*')]);
  return {nodes:n.data||[],resources:r.data||[],settings:Object.fromEntries((s.data||[]).map(x=>[x.key,x.value])),error:n.error||r.error||s.error||null};
}
function buildIndex(d){
  const kids={},byId={},res={};
  d.nodes.forEach(n=>{byId[n.id]=n;(kids[n.parent_id||ROOT]=kids[n.parent_id||ROOT]||[]).push(n)});
  d.resources.forEach(r=>{(res[r.node_id]=res[r.node_id]||[]).push(r)});
  return {kids,byId,res};
}
async function requireLogin(){
  const {data}=await SB.auth.getSession();
  if(!data.session){location.replace('login.html?next='+encodeURIComponent(location.pathname.split('/').pop()||'admin.html'));return null}
  return data.session;
}
async function myRole(uid){const {data}=await SB.from('profiles').select('role').eq('id',uid).maybeSingle();return data?data.role:'member'}
// PDF downloads: short-lived signed links
document.addEventListener('click',async e=>{
  const b=e.target.closest('[data-pdf]'); if(!b)return;
  const t=b.innerHTML; b.disabled=true; b.textContent='Preparing…';
  const name=(b.dataset.name||'download').replace(/[^\w\- ]+/g,'').trim().replace(/\s+/g,'-')+'.pdf';
  const {data,error}=await SB.storage.from('content').createSignedUrl(b.dataset.pdf,300,{download:name});
  b.disabled=false; b.innerHTML=t;
  if(error||!data){alert('Could not prepare the download. Please try again.');return}
  location.href=data.signedUrl;
});
