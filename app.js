const C=window.CFG,$=s=>document.querySelector(s);
const NAMES="Genesis,Exodus,Leviticus,Numbers,Deuteronomy,Joshua,Judges,Ruth,1 Samuel,2 Samuel,1 Kings,2 Kings,1 Chronicles,2 Chronicles,Ezra,Nehemiah,Esther,Job,Psalms,Proverbs,Ecclesiastes,Song of Solomon,Isaiah,Jeremiah,Lamentations,Ezekiel,Daniel,Hosea,Joel,Amos,Obadiah,Jonah,Micah,Nahum,Habakkuk,Zephaniah,Haggai,Zechariah,Malachi,Matthew,Mark,Luke,John,Acts,Romans,1 Corinthians,2 Corinthians,Galatians,Ephesians,Philippians,Colossians,1 Thessalonians,2 Thessalonians,1 Timothy,2 Timothy,Titus,Philemon,Hebrews,James,1 Peter,2 Peter,1 John,2 John,3 John,Jude,Revelation".split(',');
const LBL={kjv:'King James Version (KJV)',bsb:'Berean Standard Bible (BSB)',asv:'American Standard Version (ASV)',bbe:'Bible in Basic English (BBE)',ylt:"Young's Literal Translation (YLT)",darby:'Darby Bible',rotherham:'Emphasized Bible (Rotherham)',geneva:'Geneva Bible 1599',tyndale:'Tyndale Bible'};
const S={t:'kjv',c:'',bk:0,ch:1,sel:null,view:'read',f:'all',q:'',hl:{},notes:[],user:null,sp:'General'};
const cache={};let fb=null,db=null,au=null,dp=null;
try{if(!/YOUR_/.test(C.FIREBASE.apiKey)){firebase.initializeApp(C.FIREBASE);au=firebase.auth();db=firebase.firestore();fb=1}}catch(e){}
const ud=()=>db.collection('users').doc(S.user.uid);
function el(t,a={},...k){const e=document.createElement(t);for(const[x,y]of Object.entries(a)){if(x==='class')e.className=y;else if(x.startsWith('on'))e[x]=y;else e.setAttribute(x,y)}k.flat().forEach(c=>{if(c!=null&&c!==false)e.append(c)});return e}
const load=async id=>{if(!id)return null;if(cache[id])return cache[id];let r=await fetch(id+'.json');if(!r.ok||!/json/i.test(r.headers.get('content-type')||''))r=await fetch('data/'+id+'.json');if(!r.ok)throw new Error('The Bible text file '+id+'.json was not found on the site.');return cache[id]=await r.json()};
const keyOf=(b,c,v)=>b+'.'+c+'.'+v,parse=k=>k.split('.').map(Number),cmp=(a,b)=>{const x=parse(a),y=parse(b);return x[0]-y[0]||x[1]-y[1]||x[2]-y[2]};
function toast(t){const e=$('#toast');e.textContent=t;e.style.display='block';setTimeout(()=>e.style.display='none',2600)}
const savePos=()=>{try{localStorage.setItem('cdtpos',JSON.stringify({t:S.t,c:S.c,bk:S.bk,ch:S.ch,th:document.documentElement.dataset.theme||''}))}catch(e){}};
function fill(){for(const id of['t','t2']){const s=$('#'+id);s.replaceChildren();if(id==='t2')s.append(el('option',{value:''},'Compare: off'));for(const k in LBL)s.append(el('option',{value:k},LBL[k]));s.value=id==='t'?S.t:S.c}
const b=$('#bk');b.replaceChildren();NAMES.forEach((n,i)=>b.append(el('option',{value:i},n)));b.value=S.bk}
async function chapters(){const T=await load(S.t),c=$('#ch');c.replaceChildren();for(let i=1;i<=T[S.bk].length;i++)c.append(el('option',{value:i},i));c.value=S.ch}
async function go(bk,ch,sel=null){S.bk=bk;S.ch=ch;S.view='read';S.sel=sel;$('#bk').value=bk;await chapters();$('#ch').value=ch;await render();scrollTo(0,0);savePos()}
const render=()=>({notes:notesView,search:searchView,read:readView}[S.view])($('#m').replaceChildren()||$('#m'));
async function hl(k,c){if(!S.user)return;c?S.hl[k]=c:delete S.hl[k];render();try{const r=ud().collection('highlights').doc(k);c?await r.set({color:c}):await r.delete()}catch(e){toast(e.message)}}
async function addNote(ref,body,space){try{const n={ref,body,space,created:Date.now()},r=await ud().collection('notes').add(n);S.notes.unshift({id:r.id,...n});S.sp=space;spaces();toast('Note saved')}catch(e){toast(e.message)}}
function spaces(){$('#sps').replaceChildren(...[...new Set(['General','Sermons','Prayer','Study',...S.notes.map(n=>n.space)])].map(x=>el('option',{value:x})))}
function toolbar(k){const tb=el('div',{class:'tb'});
if(!S.user){tb.append(el('div',{},'Sign in to highlight and take notes.'),el('button',{class:'pri',onclick:openAuth},'Sign in / Create account'));return tb}
const sw=el('div',{});for(const c of['y','g','b','p'])sw.append(el('span',{class:'sw '+c,onclick:()=>hl(k,S.hl[k]===c?'':c)}));sw.append(el('button',{onclick:()=>hl(k,'')},'Clear'));tb.append(sw);
S.notes.filter(n=>n.ref===k).forEach(n=>tb.append(el('div',{class:'note'},el('b',{},n.space+': '),n.body)));
const sp=el('input',{list:'sps',placeholder:'Space (Sermons, Prayer, Study…)'});sp.value=S.sp;const ta=el('textarea',{placeholder:'Write a note…'});
tb.append(sp,ta,el('button',{class:'pri',onclick:async()=>{const b=ta.value.trim();if(!b)return;await addNote(k,b,sp.value.trim()||'General');render()}},'Save note'));return tb}
async function readView(m){const T=await load(S.t),U=await load(S.c),vs=T[S.bk][S.ch-1];
if(!S.user&&fb)m.append(el('div',{class:'ban'},'Create a free account to save highlights and notes on every device. ',el('a',{onclick:openAuth},'Sign up / Sign in')));
m.append(el('h1',{},NAMES[S.bk]+' '+S.ch));
vs.forEach((tx,i)=>{const v=i+1,k=keyOf(S.bk,S.ch,v),n=S.notes.filter(x=>x.ref===k).length;
const col=(t,s)=>el('div',{},s&&el('sup',{},v),t);
m.append(el('div',{class:'v '+(S.hl[k]||'')+(S.sel===k?' sel':''),onclick:()=>{S.sel=S.sel===k?null:k;render()}},U?el('div',{class:'cmp'},col(tx,1),col(U[S.bk]?.[S.ch-1]?.[i]||'',0)):[el('sup',{},v),tx],n?el('span',{class:'nb'},'✎'+n):null));
if(S.sel===k)m.append(toolbar(k))});
const step=d=>{let b=S.bk,c=S.ch+d;if(c<1){if(--b<0)return;c=T[b].length}else if(c>T[b].length){if(++b>65)return;c=1}go(b,c)};
m.append(el('div',{class:'nav'},el('button',{onclick:()=>step(-1)},'‹ Previous'),el('button',{onclick:()=>step(1)},'Next ›')));$('#pv').onclick=()=>step(-1);$('#nx').onclick=()=>step(1)}
async function searchView(m){const T=await load(S.t),q=S.q.toLowerCase(),r=[];m.append(el('h1',{},'“'+S.q+'”'));
T.forEach((bk,b)=>bk.forEach((ch,c)=>ch.forEach((tx,v)=>{if(r.length<150&&tx.toLowerCase().includes(q))r.push([b,c+1,v+1,tx])})));
m.append(el('p',{class:'mut'},r.length+(r.length>=150?'+':'')+' matches in '+LBL[S.t]));r.forEach(([b,c,v,tx])=>m.append(el('div',{class:'item'},el('a',{onclick:()=>go(b,c)},NAMES[b]+' '+c+':'+v),el('div',{},tx))))}
const vtxt=(T,[n,c,a,b])=>{const i=NAMES.indexOf(n);return (T[i]?.[c-1]||[]).slice(a-1,b).join(' ')},vlab=([n,c,a,b])=>n+' '+c+':'+a+(b>a?'–'+b:'');
const vlink=r=>el('a',{onclick:()=>{const i=NAMES.indexOf(r[0]);go(i,r[1],keyOf(i,r[1],r[2]))}},vlab(r));
async function guidesView(m){const T=await load(S.t),cats=Object.keys(GUIDES);if(!cats.includes(S.g))S.g=cats[0];m.append(el('h1',{},'Guided scriptures'));
const chips=el('div',{class:'chips'});cats.forEach(c=>chips.append(el('button',{class:S.g===c?'on':'',onclick:()=>{S.g=c;render()}},c)));m.append(chips);
const d=new Date(),all=cats.flatMap(c=>GUIDES[c].flatMap(t=>t.v)),tv=all[Math.floor((d-new Date(d.getFullYear(),0,0))/864e5)%all.length];
m.append(el('div',{class:'ban'},el('b',{},'Verse for today · '),vlink(tv),el('div',{},vtxt(T,tv))));
if(S.g==='Mind & Heart')m.append(el('p',{class:'mut'},'Scripture can comfort, but it does not replace professional care. If you are struggling, please also talk to a trusted person or a professional.'));
GUIDES[S.g].forEach(t=>m.append(el('div',{class:'item'},el('h3',{},t.t),el('div',{class:'mut'},t.d),...t.v.map(r=>el('div',{style:'margin-top:8px'},vlink(r),el('div',{},vtxt(T,r)))))));}
async function notesView(m){const T=await load(S.t);m.append(el('h1',{},'My notes'));
if(!S.user){m.append(el('p',{class:'mut'},'Sign in to see all the notes and highlights you have saved.'),el('button',{class:'pri',onclick:openAuth},'Sign in / Create account'));return}
const chips=el('div',{class:'chips'});for(const f of['all','hl',...new Set(S.notes.map(n=>n.space))])chips.append(el('button',{class:S.f===f?'on':'',onclick:()=>{S.f=f;render()}},f==='all'?'All notes':f==='hl'?'Highlights':f));m.append(chips);
const txt=k=>{const[b,c,v]=parse(k);return T[b]?.[c-1]?.[v-1]||''},head=k=>{const[b,c,v]=parse(k);return el('a',{onclick:()=>go(b,c)},NAMES[b]+' '+c+':'+v)};
if(S.f==='hl'){Object.keys(S.hl).sort(cmp).forEach(k=>m.append(el('div',{class:'item'},head(k),el('div',{class:'v '+S.hl[k]},txt(k)))));return}
const list=S.notes.filter(n=>S.f==='all'||n.space===S.f);if(!list.length)m.append(el('p',{class:'mut'},'Nothing here yet. Open a chapter, tap a verse and write a note.'));
list.forEach(n=>{const body=el('div',{class:'note'},n.body);m.append(el('div',{class:'item'},head(n.ref),el('div',{class:'mut'},txt(n.ref)),body,
el('div',{class:'meta'},n.space+' · '+new Date(n.created).toLocaleDateString()+' · ',el('a',{onclick:()=>edit(n,body)},'Edit'),' · ',el('a',{onclick:()=>del(n)},'Delete'))))})}
function edit(n,body){const ta=el('textarea',{style:'width:100%'});ta.value=n.body;body.replaceWith(el('div',{},ta,el('button',{class:'pri',onclick:async()=>{try{await ud().collection('notes').doc(n.id).update({body:ta.value});n.body=ta.value;render()}catch(e){toast(e.message)}}},'Save')))}
async function del(n){if(!confirm('Delete this note?'))return;try{await ud().collection('notes').doc(n.id).delete();S.notes=S.notes.filter(x=>x!==n);render()}catch(e){toast(e.message)}}
async function sync(){S.hl={};S.notes=[];if(S.user){try{const[h,n]=await Promise.all([ud().collection('highlights').get(),ud().collection('notes').orderBy('created','desc').get()]);h.forEach(d=>S.hl[d.id]=d.data().color);S.notes=n.docs.map(d=>({id:d.id,...d.data()}))}catch(e){toast(e.message)}}
$('#acct').textContent=S.user?'Sign out':'Sign in';spaces();try{await render()}catch(e){$('#m').replaceChildren(el('div',{class:'ban'},'Could not load the Bible text. '+e.message))}}
const openAuth=()=>{if(!fb)return toast('Accounts are not set up yet');$('#am').textContent='';$('#auth').showModal()};
async function authGo(up){const email=$('#em').value.trim(),pw=$('#pw').value,m=$('#am');m.textContent='Please wait…';try{up?await au.createUserWithEmailAndPassword(email,pw):await au.signInWithEmailAndPassword(email,pw);$('#auth').close()}catch(e){m.textContent=e.message}}
$('#fp').onclick=async()=>{const e=$('#em').value.trim(),m=$('#am');if(!e)return m.textContent='Type your email first.';try{await au.sendPasswordResetEmail(e);m.textContent='Reset link sent. Check your email.'}catch(x){m.textContent=x.message}};
$('#in').onclick=()=>authGo(0);$('#up').onclick=()=>authGo(1);$('#cx').onclick=()=>$('#auth').close();
$('#acct').onclick=()=>S.user?au.signOut():openAuth();
$('#t').onchange=async e=>{S.t=e.target.value;await chapters();render();savePos()};$('#t2').onchange=e=>{S.c=e.target.value;render();savePos()};
$('#bk').onchange=e=>go(+e.target.value,1);$('#ch').onchange=e=>go(S.bk,+e.target.value);
$('#q').onkeydown=e=>{if(e.key==='Enter'&&e.target.value.trim().length>1){S.q=e.target.value.trim();S.view='search';render()}};
$('#gd').onclick=()=>{S.view=S.view==='guides'?'read':'guides';render()};
$('#mk').onclick=()=>{S.view=S.view==='notes'?'read':'notes';render()};
$('#th').onclick=()=>{const r=document.documentElement;r.dataset.theme=r.dataset.theme==='light'?'dark':'light';savePos()};
const wa='https://wa.me/'+C.WHATSAPP+'?text='+encodeURIComponent(C.WA_MSG);$('#wa').href=wa;$('#wf').href=wa;$('#wf').target='_blank';
addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e});
$('#ins').onclick=()=>dp?(dp.prompt(),dp=null):alert('To install: on iPhone tap Share → Add to Home Screen. On Android or desktop Chrome, open the browser menu → Install app.');
if(matchMedia('(display-mode: standalone)').matches)$('#ins').hidden=true;
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');
(async()=>{try{const p=JSON.parse(localStorage.getItem('cdtpos')||'{}');if(p.th)document.documentElement.dataset.theme=p.th;Object.assign(S,{t:p.t||'kjv',c:p.c||'',bk:p.bk||0,ch:p.ch||1})}catch(e){}
if(!LBL[S.t])S.t='kjv';if(!LBL[S.c])S.c='';
if(fb){try{await au.setPersistence(firebase.auth.Auth.Persistence.LOCAL)}catch(e){}au.onAuthStateChanged(u=>{S.user=u;$('#acct').textContent=u?'Sign out':'Sign in';setTimeout(sync,0)})}
fill();spaces();
try{await chapters();await render()}catch(e){$('#m').replaceChildren(el('div',{class:'ban'},'Could not load the Bible text. '+e.message))}})();
