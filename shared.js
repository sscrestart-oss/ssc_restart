const SB = window.supabase.createClient(CFG.url, CFG.key, {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const $ = id => document.getElementById(id);
const esc = x => String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SECTIONS=[
 {id:'reasoning',name:'Reasoning',hi:'तर्कशक्ति',ds:'Puzzles, series, coding-decoding, syllogism',ic:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7M12 17h.01"/>'},
 {id:'gs',name:'General Studies',hi:'सामान्य अध्ययन',ds:'History, polity, geography, science, current affairs',ic:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>'},
 {id:'maths',name:'Maths',hi:'गणित',ds:'Arithmetic, algebra, geometry, data interpretation',ic:'<path d="M5 7h6M8 4v6M13 8h6M5 17h6M13 15l6 4M19 15l-6 4"/>'},
 {id:'english',name:'English',hi:'अंग्रेज़ी',ds:'Grammar, vocabulary, comprehension, error spotting',ic:'<path d="M4 19 10 5l6 14M6.5 14h7M19 11v8M19 14.5a2.5 2.5 0 1 0 0 .1"/>'},
 {id:'computer',name:'Computer',hi:'कंप्यूटर',ds:'Chapter-wise notes and PYQ bank',ic:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>'},
 {id:'others',name:'Others',hi:'अन्य',ds:'Extra notes, strategy and exam updates',ic:'<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>'}
];
const ADMIN_SECTIONS=[{id:'cgl2026',name:'CGL 2026 · Chapter-wise'},...SECTIONS];
const BOOK='<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19a2 2 0 0 1 2-2h13"/>';

async function requireLogin(){
  const {data}=await SB.auth.getSession();
  if(!data.session){location.replace('login.html?next='+encodeURIComponent(location.pathname.split('/').pop()+location.search));return null}
  return data.session;
}
async function myRole(uid){const {data}=await SB.from('profiles').select('role').eq('id',uid).maybeSingle();return data?data.role:'member'}
function renderHeader(role){
  $('hdr').innerHTML=`<header class="top"><div class="top-in"><a class="brand" href="index.html"><img src="logo.jpg" alt="SSC Restart logo"><span><b>SSC <i>RE</i>START</b><small>Study Hub</small></span></a><span class="rt">${role==='admin'?'<a class="pill d" href="admin.html">Admin</a>':''}<button class="pill l" id="lo">Log out</button></span></div></header>`;
  $('lo').onclick=async()=>{await SB.auth.signOut();location.replace('login.html')};
}
function acts(files,title){
  return (files||[]).map(f=>f.kind==='page'
    ?`<a class="act p" href="viewer.html?p=${encodeURIComponent(f.path)}&t=${encodeURIComponent(title||'')}">Open online</a>`
    :`<button class="act" data-pdf="${esc(f.path)}" data-name="${esc((title||'download')+' '+(f.label||''))}">${esc(f.label||'Download PDF')}</button>`).join('');
}
function card(it){return `<div class="card"><div class="ic"><svg viewBox="0 0 24 24">${BOOK}</svg></div><h3>${esc(it.title)}</h3><div class="ds">${esc(it.description)}</div><div class="acts">${acts(it.files,it.title)}</div></div>`}
function row(it){return `<div class="row"><div class="tx"><h3>${esc(it.title)}</h3><p>${esc(it.description)}</p></div><div class="acts">${acts(it.files,it.title)}</div></div>`}
document.addEventListener('click',async e=>{
  const b=e.target.closest('[data-pdf]'); if(!b)return;
  const t=b.textContent; b.disabled=true; b.textContent='Preparing…';
  const name=(b.dataset.name||'download').replace(/[^\w\- ]+/g,'').trim().replace(/\s+/g,'-')+'.pdf';
  const {data,error}=await SB.storage.from('content').createSignedUrl(b.dataset.pdf,300,{download:name});
  b.disabled=false; b.textContent=t;
  if(error||!data){alert('Could not prepare the download. Please log in again.');return}
  location.href=data.signedUrl;
});
