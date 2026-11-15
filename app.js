const KEY='ohana-v1';
const seed=()=>({s:{pkwh:.18,potH:3.5,potL:.4,labor:18,ship:4},
 ing:[],box:[],ord:[]});
let D;try{D=JSON.parse(localStorage.getItem(KEY))}catch(e){}
if(!D||!D.s)D=seed();
D.s=Object.assign({potB:.5,fr:1},D.s);
D.led=D.led||[];
let storeOK=true;
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(D))}catch(e){storeOK=false}};
try{localStorage.setItem('ohana-t','1');localStorage.removeItem('ohana-t')}catch(e){storeOK=false}
try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{})}catch(e){}
const $=s=>document.querySelector(s);
const uid=()=>Math.random().toString(36).slice(2,9);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const eur=n=>(+n||0).toLocaleString('es-ES',{style:'currency',currency:'EUR'});
const num=v=>parseFloat(String(v).replace(',','.'))||0;
const fac=u=>u==='uds'?1:1000;
const pl=u=>u==='g'?'€/kg':u==='ml'?'€/litro':'€/ud';
const fd=d=>d?new Date(d+'T12:00').toLocaleDateString('es-ES',{day:'numeric',month:'short'}):'—';
const lineCost=l=>{const i=D.ing.find(x=>x.id===l.id);return i?l.q/fac(i.u)*i.p:0};
function calc(o){const s=D.s;
 const ingr=o.lines.reduce((a,l)=>a+lineCost(l),0);
 const box=(D.box.find(b=>b.id===o.box)||{p:0}).p;
 const horno=o.hh*s.potH*s.pkwh, lum=o.ht*s.potL*s.pkwh, bat=(o.hb||0)*s.potB*s.pkwh, fr=s.fr;
 const labor=o.ht*s.labor, ship=o.ship?s.ship:0;
 return{ingr,box,horno,lum,bat,fr,energy:horno+lum+bat+fr,labor,ship,total:ingr+box+horno+lum+bat+fr+labor+ship}}
const rowsHtml=(c,o)=>`<div><span>Ingredientes</span><span>${eur(c.ingr)}</span></div>
<div><span>Embalaje</span><span>${eur(c.box)}</span></div>
<div><span>Horno${o.hh?` · ${o.hh} h`:''}</span><span>${eur(c.horno)}</span></div>
<div><span>Batidora${o.hb?` · ${o.hb} h`:''}</span><span>${eur(c.bat||0)}</span></div>
<div><span>Iluminación${o.ht?` · ${o.ht} h`:''}</span><span>${eur(c.lum)}</span></div>
<div><span>Energía 24 h</span><span>${eur(c.fr||0)}</span></div>
<div><span>Mano de obra · ${o.ht} h × ${eur(D.s.labor)}</span><span>${eur(c.labor)}</span></div>
<div><span>Envío a domicilio</span><span>${eur(c.ship)}</span></div>
<div class="t"><span>Precio total</span><span>${eur(c.total)}</span></div>`;

/* ---------- vistas ---------- */
function ordersView(){
 const list=[...D.ord].sort((a,b)=>(a.dd||'9').localeCompare(b.dd||'9'));
 return `<div class="bar"><h2>Pedidos</h2><button class="btn" data-a="newOrder">Nuevo pedido</button></div>`+
 (list.length?list.map(o=>`<div class="card"><div class="oh"><div><h3>${esc(o.client)}${o.ship?'<span class="chip">Envío</span>':''}</h3>
 <div class="mu">Encargo ${fd(o.do)} · Entrega ${fd(o.dd)}</div></div><div class="tot">${eur(o.c.total)}</div></div>
 <details><summary>Ver detalles</summary><div class="rows">${rowsHtml(o.c,o)}</div>
 <div class="act"><button class="lk d" data-a="delOrder" data-id="${o.id}">Eliminar pedido</button><button class="btn" data-a="finOrder" data-id="${o.id}">Terminar pedido</button></div></details></div>`).join('')
 :`<div class="empty">Aún no hay pedidos. Pulsa “Nuevo pedido” para calcular el primer escandallo.</div>`);
}
function invView(){
 const lowc=v=>v<=0?'low':'';
 return `<div class="bar"><h2>Almacén</h2><button class="btn" data-a="scan">Escanear ticket</button></div>
 <div class="card"><div class="oh"><h3>Ingredientes</h3><button class="btn g" data-a="newIng">Añadir ingrediente</button></div>
 <div class="tw">${D.ing.length?`<table><tr><th>Nombre</th><th class="r">Stock</th><th class="r">Precio</th><th></th></tr>`+D.ing.map(i=>`<tr><td>${esc(i.n)}${i.inc?'<span class="chip">Falta cantidad</span>':''}</td><td class="r ${lowc(i.st)}">${i.st} ${i.u}</td><td class="r">${eur(i.p)} / ${pl(i.u).slice(2)}</td><td class="r"><button class="lk" data-a="editIng" data-id="${i.id}">Editar</button><button class="lk d" data-a="delIng" data-id="${i.id}">Borrar</button></td></tr>`).join('')+`</table>`:'<div class="empty">Añade tu primer ingrediente.</div>'}</div></div>
 <div class="card"><div class="oh"><h3>Cajas y embalaje</h3><button class="btn g" data-a="newBox">Añadir caja</button></div>
 <div class="tw">${D.box.length?`<table><tr><th>Tamaño</th><th class="r">Stock</th><th class="r">Coste / ud</th><th></th></tr>`+D.box.map(i=>`<tr><td>${esc(i.n)}${i.inc?'<span class="chip">Falta cantidad</span>':''}</td><td class="r ${lowc(i.st)}">${i.st} uds</td><td class="r">${eur(i.p)}</td><td class="r"><button class="lk" data-a="editBox" data-id="${i.id}">Editar</button><button class="lk d" data-a="delBox" data-id="${i.id}">Borrar</button></td></tr>`).join('')+`</table>`:'<div class="empty">Añade tu primer tamaño de caja.</div>'}</div></div>`;
}
function render(){const h=location.hash.slice(1),r=h==='inventory'||h==='ledger'?h:'orders';
 $('#n-orders').className=r==='orders'?'on':'';$('#n-inventory').className=r==='inventory'?'on':'';$('#n-ledger').className=r==='ledger'?'on':'';
 $('#main').innerHTML=(storeOK?'':'<div class="card"><b>Este navegador no guarda los datos.</b> Lo que añadas se perderá al cerrar. Usa la versión instalada o exporta una copia.</div>')+(r==='orders'?ordersView():r==='ledger'?ledgerView():invView());}
const open=h=>{$('#sheet').innerHTML=h;$('#modal').classList.add('open')};
const close=()=>$('#modal').classList.remove('open');
const ask=(msg,yes,label)=>{open(`<h2>${msg}</h2><div class="act"><button class="btn g" data-a="close">Cancelar</button><button class="btn" id="yes">${label}</button></div>`);$('#yes').onclick=()=>{yes();close();save();render()}};

/* ---------- ítems ---------- */
function itemModal(kind,it){const ing=kind==='ing';it=it||{id:uid(),n:'',u:'g',st:0,p:0,_new:1};
 const pre=it._new?'':+(it.st>0&&!it.inc?it.p*it.st/(ing?fac(it.u):1):it.p).toFixed(2);
 open(`<h2>${it._new?'Nuevo':'Editar'} ${ing?'ingrediente':'tamaño de caja'}</h2>
 <label>Nombre</label><input id="f-n" value="${esc(it.n)}">
 ${ing?`<label>Unidad de medida</label><select id="f-u"><option value="g">Gramos (g)</option><option value="ml">Mililitros (ml)</option><option value="uds">Unidades (uds)</option></select>`:''}
 <div class="g2"><div><label>Cantidad que tienes</label><input id="f-st" type="number" step="any" inputmode="decimal" value="${it._new?'':it.st}"></div>
 <div><label>Precio total (€)</label><input id="f-p" type="number" step="any" inputmode="decimal" value="${pre}"></div></div><div class="mu" id="f-hint"></div>
 <div class="err" id="err"></div>
 <div class="act"><button class="btn g" data-a="close">Cancelar</button><button class="btn" id="ok">Guardar</button></div>`);
 const upd=()=>{const u=ing?$('#f-u').value:'uds',q=num($('#f-st').value),t=num($('#f-p').value);$('#f-hint').textContent=q>0&&t>0?'Equivale a '+eur(t/(q/(ing?fac(u):1)))+(ing?pl(u).slice(1):'/ud'):'Escribe la cantidad y lo que has pagado en total: el precio por unidad se calcula solo.'};
 if(ing){$('#f-u').value=it.u;$('#f-u').onchange=upd}upd();['#f-st','#f-p'].forEach(s=>$(s).oninput=upd);
 $('#ok').onclick=()=>{const n=$('#f-n').value.trim();if(!n){$('#err').textContent='Escribe un nombre.';return}
  const q=num($('#f-st').value),t=num($('#f-p').value),u=ing?$('#f-u').value:'uds';
  if(it._new||it.inc||t!==num(pre))it.p=q>0?+(t/(q/(ing?fac(u):1))).toFixed(4):t;
  it.n=n;it.st=q;if(ing)it.u=u;if(q>0)delete it.inc;
  const arr=ing?D.ing:D.box;if(it._new){delete it._new;arr.push(it)}save();close();render()}}

/* ---------- ajustes ---------- */
function settingsModal(){const s=D.s;
 const f=(id,l,v)=>`<div><label>${l}</label><input id="${id}" type="number" step="any" inputmode="decimal" value="${v}"></div>`;
 open(`<h2>Tarifas y costes operativos</h2><div class="g2">${f('s1','Luz (€/kWh)',s.pkwh)}${f('s2','Mano de obra (€/h)',s.labor)}${f('s3','Horno (kW)',s.potH)}${f('s4','Iluminación (kW)',s.potL)}</div>
 <div class="g2">${f('s5','Envío (€)',s.ship)}${f('s6','Batidora (kW)',s.potB)}${f('s7','Energía 24 h (€)',s.fr)}</div>
 <p class="mu">Los pedidos ya guardados conservan el precio con el que se calcularon.</p>
 <h3 style="margin:14px 0 6px;font-size:20px">Copia de seguridad</h3><div class="g2"><button class="btn g" data-a="exp">Exportar copia</button><button class="btn g" data-a="imp">Importar copia</button></div><input id="imp" type="file" accept="application/json,.json" hidden>
 <div class="act"><button class="btn g" data-a="close">Cancelar</button><button class="btn" id="ok">Guardar tarifas</button></div>`);
 $('#imp').onchange=importData;
 $('#ok').onclick=()=>{D.s={pkwh:num($('#s1').value),labor:num($('#s2').value),potH:num($('#s3').value),potL:num($('#s4').value),ship:num($('#s5').value),potB:num($('#s6').value),fr:num($('#s7').value)};save();close();render()}}

/* ---------- pedido ---------- */
let d;
function orderModal(){
 const today=new Date().toISOString().slice(0,10);
 d={id:uid(),client:'',do:today,dd:'',ship:false,box:D.box[0]?D.box[0].id:'',lines:[],hh:0,ht:0,hb:0};
 open(`<h2>Nuevo pedido</h2>
 <label>Cliente</label><input id="o-c" placeholder="Nombre del cliente">
 <div class="g2"><div><label>Fecha de encargo</label><input id="o-do" type="date" value="${today}"></div><div><label>Fecha de entrega</label><input id="o-dd" type="date"></div></div>
 <label class="ck"><input id="o-s" type="checkbox"> Envío a domicilio</label>
 <label>Caja o tamaño de embalaje</label><select id="o-b">${D.box.map(b=>`<option value="${b.id}">${esc(b.n)} · ${eur(b.p)} (stock ${b.st})</option>`).join('')||'<option value="">Sin cajas en el almacén</option>'}</select>
 <label>Ingredientes</label><div id="lines"></div><button class="btn g" data-a="addLine">Añadir ingrediente</button>
 <div class="g2"><div><label>Horas de horno</label><input id="o-hh" type="number" step="any" min="0" inputmode="decimal" placeholder="0"></div>
 <div><label>Horas de trabajo</label><input id="o-ht" type="number" step="any" min="0" inputmode="decimal" placeholder="0"></div></div>
 <div class="g2"><div><label>Horas de batidora</label><input id="o-hb" type="number" step="any" min="0" inputmode="decimal" placeholder="0"></div><div></div></div>
 <div class="sum rows" id="sum"></div><div class="err" id="err"></div>
 <div class="act"><button class="btn g" data-a="close">Cancelar</button><button class="btn" data-a="saveOrder">Guardar pedido</button></div>`);
 drawLines();sum();
 const bind=(id,fn)=>$(id).addEventListener('input',e=>{fn(e.target);sum()});
 bind('#o-c',e=>d.client=e.value);bind('#o-do',e=>d.do=e.value);bind('#o-dd',e=>d.dd=e.value);
 bind('#o-s',e=>d.ship=e.checked);bind('#o-b',e=>d.box=e.value);bind('#o-hh',e=>d.hh=num(e.value));bind('#o-ht',e=>d.ht=num(e.value));bind('#o-hb',e=>d.hb=num(e.value));
}
function drawLines(){
 $('#lines').innerHTML=d.lines.map((l,k)=>{const i=D.ing.find(x=>x.id===l.id);
  return `<div class="ln"><select data-k="${k}" data-r="sel">${D.ing.map(x=>`<option value="${x.id}"${x.id===l.id?' selected':''}>${esc(x.n)}</option>`).join('')}</select>
  <input type="number" step="any" min="0" inputmode="decimal" data-k="${k}" data-r="qty" value="${l.q||''}" placeholder="${i?i.u:''}">
  <span class="c" id="lc${k}">${eur(lineCost(l))}</span><button class="lk d" data-a="rmLine" data-k="${k}" aria-label="Quitar">✕</button></div>`+
  (i&&l.q>i.st?`<div class="err" style="margin:-2px 0 6px">Stock insuficiente: quedan ${i.st} ${i.u}.</div>`:'')}).join('')||'<div class="mu" style="margin-bottom:8px">Aún sin ingredientes.</div>';
}
function sum(){const c=calc(d);$('#sum').innerHTML=rowsHtml(c,d);d.lines.forEach((l,k)=>{const e=$('#lc'+k);if(e)e.textContent=eur(lineCost(l))})}
function saveOrder(){
 if(!d.client.trim()){$('#err').textContent='Escribe el nombre del cliente.';return}
 const lines=d.lines.filter(l=>l.q>0);
 const o={...d,client:d.client.trim(),lines};
 o.c=calc(o);
 lines.forEach(l=>{const i=D.ing.find(x=>x.id===l.id);if(i)i.st=Math.max(0,+(i.st-l.q).toFixed(3))});
 const b=D.box.find(x=>x.id===o.box);if(b)b.st=Math.max(0,b.st-1);
 D.ord.push(o);save();close();location.hash='#orders';render();
}
function delOrder(id){const o=D.ord.find(x=>x.id===id);if(!o)return;
 ask('¿Eliminar el pedido de '+esc(o.client)+'? El stock se devolverá al almacén.',()=>{
  o.lines.forEach(l=>{const i=D.ing.find(x=>x.id===l.id);if(i)i.st=+(i.st+l.q).toFixed(3)});
  const b=D.box.find(x=>x.id===o.box);if(b)b.st+=1;D.ord=D.ord.filter(x=>x.id!==id)},'Eliminar')}

/* ---------- ticket ---------- */
let sc=[],hd,sT='compra';
let lp={y:new Date().getFullYear(),q:Math.floor(new Date().getMonth()/3)+1};
const today=()=>new Date().toISOString().slice(0,10);
const emptyHd=()=>({emp:'',fec:today(),tot:'',iva:[{r:10,b:'',c:''}],net:true});
function scanModal(t){sc=[];hd=emptyHd();sT=t==='venta'?'venta':'compra';
 open(`<h2>Escanear ticket</h2>
 <div class="seg"><button data-a="sType" data-t="compra" class="${sT==='compra'?'on':''}">Compra</button><button data-a="sType" data-t="venta" class="${sT==='venta'?'on':''}">Venta</button></div>
 <p class="mu" id="sthint"></p>
 <input id="tk" type="file" accept="image/*"><div id="scst" class="mu" style="margin-top:10px"></div>
 <div class="act" style="justify-content:flex-start"><button class="btn g" data-a="manual">Introducir a mano</button></div><div id="scl"></div>
 <div class="act"><button class="btn g" data-a="close">Cerrar</button></div>`);
 setType(sT);
 $('#tk').onchange=e=>{const f=e.target.files[0];if(f)readTicket(f)};
 $('#scl').oninput=$('#scl').onchange=e=>{const t=e.target,h=t.dataset.h,f=t.dataset.f;
  if(h){hd[h]=t.type==='checkbox'?t.checked:t.type==='number'?(t.value===''?'':num(t.value)):t.value;return}
  if(!f)return;const iv=t.closest('.iv');
  if(iv){const x=hd.iva[+iv.dataset.k];x[f]=f==='r'?+t.value:(t.value===''?'':num(t.value));return}
  const r=t.closest('.rv');if(!r)return;const x=sc[+r.dataset.k];
  x[f]=(f==='price'||f==='qty')?(t.value===''?'':num(t.value)):t.value;if(f==='qty')t.classList.toggle('miss',t.value==='')};}
function setType(t){sT=t;document.querySelectorAll('.seg button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));
 const h=$('#sthint');if(h)h.textContent=t==='compra'?'Los productos se añaden al almacén y el ticket al libro de IVA.':'El ticket se guarda en el libro de IVA como venta.';
 if($('#scl')&&$('#scl').innerHTML.trim())drawScan()}
/* ---------- lector de tickets (OCR local, gratuito) ---------- */
function parseHead(txt){
 const L=txt.split('\n').map(l=>l.replace(/\s+/g,' ').trim()).filter(Boolean);
 let emp='';
 for(const l of L.slice(0,8)){
  if(/ticket|factura|simplificad|tel[eé]f|fecha|www|^c\/|calle|avda|^\d/i.test(l))continue;
  const c=l.replace(/\b(cif|nif)\b:?/ig,' ').replace(/\b[A-Z]-?\d{7,8}[A-Z]?\b/g,' ').replace(/\b\d{5,}\b/g,' ').replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9 .,&'\-]/g,' ').replace(/\s+/g,' ').trim();
  if((c.match(/[A-Za-zÁÉÍÓÚÑáéíóúñ]/g)||[]).length>=4){emp=c;break}}
 let fec='';const dm=txt.match(/\b(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4}|\d{2})\b/);
 if(dm){let y=+dm[3];if(y<100)y+=2000;const mo=+dm[2],d=+dm[1];if(mo>=1&&mo<=12&&d>=1&&d<=31)fec=y+'-'+String(mo).padStart(2,'0')+'-'+String(d).padStart(2,'0')}
 let tot='';
 L.forEach(l=>{if(/total/i.test(l)&&!/sub|entreg|iva|cambio|ahorro|desc/i.test(l)){const m=[...l.matchAll(/(\d{1,5}[.,]\d{2})(?!\d)/g)];if(m.length)tot=num(m[m.length-1][1])}});
 const iva=[];
 L.forEach(l=>{const pm=l.match(/(\d{1,2}(?:[.,]\d{1,2})?)\s*%/);if(!pm)return;const r=num(pm[1]);
  if(![0,4,5,10,21].includes(r)||iva.some(x=>x.r===r))return;
  if(!(/iva|i\.v\.a|base|cuota/i.test(l)||/^[A-Z]?\s*\d{1,2}(?:[.,]\d+)?\s*%/.test(l)))return;
  const v=[...l.matchAll(/(\d{1,5}[.,]\d{2})(?!\d)/g)].map(x=>num(x[1]));if(!v.length)return;
  let b='',c='';
  if(v.length>=3){b=v[0];c=v[1]}
  else if(v.length===2){if(Math.abs(v[0]*r/100-v[1])<.06){b=v[0];c=v[1]}else if(Math.abs(v[1]*r/100-v[0])<.06){b=v[1];c=v[0]}else{b=v[0];c=v[1]}}
  else c=v[0];
  iva.push({r,b,c})});
 return{emp,fec:fec||today(),tot,iva:iva.length?iva.slice(0,3):[{r:10,b:'',c:''}],net:true}}

const SKIP=/total|iva\b|i\.v\.a|entregad|cambio|efectivo|tarjeta|visa|master|factura|ticket|cif|nif|tel[eé]f|fecha|gracias|descuent|importe|base imp|cuota|operaci|cliente|atendi|devoluci|www|\.com|\.es\b/i;
const BOXRX=/\b(caja|cajas|bolsa|bolsas|papel|film|aluminio|envase|envases|bandeja|bandejas|etiqueta|etiquetas|cinta|cart[oó]n|blonda|blondas|vaso|vasos|desechable)\b/i;
const conv=(v,u)=>{u=u.toLowerCase();if(u[0]==='k')return[v*1000,'g'];if(u[0]==='g')return[v,'g'];if(u[0]==='l')return[v*1000,'ml'];if(u==='ml')return[v,'ml'];if(u==='cl')return[v*10,'ml'];return[v,'uds']};
function parseTicket(txt){const out=[];
 txt.split(/\n/).forEach(raw=>{
  const l=raw.replace(/[|_~]/g,' ').replace(/\s+/g,' ').trim();
  if(l.length<4||SKIP.test(l))return;
  const m=[...l.matchAll(/(-?)(\d{1,4}[.,]\d{2})(?!\d)(?!\s?(?:kg|gr?|lt?|ml|cl|uds?)\b)/gi)];
  if(!m.length)return;
  const last=m[m.length-1];if(last[1]==='-')return;
  const price=num(last[2]);if(!(price>0))return;
  let name=l.slice(0,m[0].index).replace(/[€*]+/g,' ').trim(),mult=1;
  const mm=name.match(/^(\d{1,2})\s*[xX*]?\s+(?=\D)/);if(mm){mult=+mm[1];name=name.slice(mm[0].length)}
  let qty='',unit='uds';
  const pk=name.match(/(\d+)\s*[xX]\s*(\d+(?:[.,]\d+)?)\s*(kg|gr?|lt?|ml|cl)\b/i);
  const sg=name.match(/(\d+(?:[.,]\d+)?)\s*(kgs?|grs?|g|litros?|lts?|l|ml|cl|uds?|unidades|u)\b/i);
  if(pk){[qty,unit]=conv(+pk[1]*num(pk[2]),pk[3]);name=name.replace(pk[0],' ')}
  else if(sg){[qty,unit]=conv(num(sg[1]),sg[2]);name=name.replace(sg[0],' ')}
  name=name.replace(/^[\d\s.\-*]+(?=[A-Za-zÁÉÍÓÚÑáéíóúñ])/,'');
  if(qty!==''&&mult>1)qty*=mult;
  else if(qty===''&&mult>1){qty=mult;unit='uds'}
  name=name.replace(/\s+/g,' ').replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9)\]%]+$/,'').trim();
  if((name.match(/[A-Za-zÁÉÍÓÚÑáéíóúñ]/g)||[]).length<3)return;
  name=name.charAt(0).toUpperCase()+name.slice(1).toLowerCase();
  const box=BOXRX.test(name);
  out.push({name,cat:box?'box':'ing',price,qty:qty===''?'':+(+qty).toFixed(3),unit:box?'uds':unit});
 });
 return out}
function loadOCR(){return window.Tesseract?Promise.resolve():new Promise((ok,ko)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';s.onload=ok;s.onerror=ko;document.head.appendChild(s)})}
async function prep(f){const bm=await createImageBitmap(f);const k=Math.min(2,1800/Math.max(bm.width,bm.height));
 const c=document.createElement('canvas');c.width=Math.round(bm.width*k);c.height=Math.round(bm.height*k);
 const x=c.getContext('2d');x.drawImage(bm,0,0,c.width,c.height);
 const im=x.getImageData(0,0,c.width,c.height),d=im.data;
 for(let i=0;i<d.length;i+=4){let g=.299*d[i]+.587*d[i+1]+.114*d[i+2];g=Math.max(0,Math.min(255,(g-128)*1.5+128+10));d[i]=d[i+1]=d[i+2]=g}
 x.putImageData(im,0,0);return new Promise(r=>c.toBlob(r,'image/png'))}
async function readTicket(f){const st=$('#scst');st.textContent='Preparando la imagen…';$('#scl').innerHTML='';
 try{const img=await prep(f);
  st.textContent='Cargando el lector (la primera vez tarda un poco)…';await loadOCR();
  const r=await Tesseract.recognize(img,'spa',{logger:m=>{if(m.status==='recognizing text')st.textContent='Leyendo el ticket… '+Math.round(m.progress*100)+'%'}});
  const tx=r.data.text||'';sc=parseTicket(tx);hd=parseHead(tx);st.textContent='';drawScan();
 }catch(e){st.textContent='No se pudo leer el ticket. Comprueba tu conexión (la primera vez descarga el lector) o prueba con una foto más nítida.'}}

function drawScan(){
 const uo=v=>['g','ml','uds'].map(u=>`<option value="${u}"${u===v?' selected':''}>${u}</option>`).join('');
 const rates=x=>[...new Set([21,10,4,0,x.r])].map(r=>`<option value="${r}"${r===x.r?' selected':''}>${r} %</option>`).join('');
 const compra=sT==='compra';
 const head=`<h3 style="margin:14px 0 2px;font-size:20px">Datos del ticket</h3>
 <label>Empresa</label><input data-h="emp" value="${esc(hd.emp)}">
 <div class="g2"><div><label>Fecha</label><input data-h="fec" type="date" value="${esc(hd.fec)}"></div><div><label>Total (€)</label><input data-h="tot" type="number" step="any" inputmode="decimal" value="${hd.tot}"></div></div>
 <label>IVA (tipo, base y cuota)</label>`+hd.iva.map((x,k)=>`<div class="iv" data-k="${k}"><select data-f="r">${rates(x)}</select><input data-f="b" type="number" step="any" inputmode="decimal" placeholder="Base" value="${x.b}"><input data-f="c" type="number" step="any" inputmode="decimal" placeholder="Cuota" value="${x.c}"></div>`).join('')+(hd.iva.length<3?`<button class="btn g" data-a="addIva">Añadir otro tipo</button>`:'');
 const rows=sc.map((x,k)=>compra?`<div class="rv" data-k="${k}"><div class="w"><input data-f="name" value="${esc(x.name)}" aria-label="Nombre"></div>
 <div><label>Categoría</label><select data-f="cat"><option value="ing"${x.cat==='ing'?' selected':''}>Ingrediente</option><option value="box"${x.cat==='box'?' selected':''}>Caja / embalaje</option><option value="skip"${x.cat==='skip'?' selected':''}>No añadir</option></select></div>
 <div><label>Precio total (€)</label><input data-f="price" type="number" step="any" inputmode="decimal" value="${x.price}"></div>
 <div><label>Cantidad</label><input data-f="qty" class="${x.qty===''?'miss':''}" type="number" step="any" inputmode="decimal" value="${x.qty}" placeholder="Falta"></div>
 <div><label>Unidad</label><select data-f="unit">${uo(x.unit)}</select></div></div>`
 :`<div class="rv" data-k="${k}"><div class="w"><input data-f="name" value="${esc(x.name)}" aria-label="Producto"></div>
 <div><label>Precio (€)</label><input data-f="price" type="number" step="any" inputmode="decimal" value="${x.price}"></div>
 <div style="text-align:right"><button class="lk d" data-a="rmRow" data-k="${k}">Quitar</button></div></div>`).join('');
 $('#scl').innerHTML=head+`<h3 style="margin:16px 0 2px;font-size:20px">Productos${sc.length?' ('+sc.length+')':''}</h3>`+(rows||'<div class="mu" style="margin:6px 0">Sin productos. Puedes añadirlos a mano.</div>')
 +`<button class="btn g" data-a="addRow">Añadir producto</button>`
 +(compra?`<label class="ck"><input type="checkbox" data-h="net"${hd.net?' checked':''}> Guardar el coste sin IVA en el almacén</label>`:'')
 +`<div class="err" id="err2"></div><div class="act"><button class="btn" data-a="saveEntry">${compra?'Añadir al almacén y al libro':'Guardar en el libro'}</button></div>`;
}
function addStock(lines,f){let n=0,m=0;
 lines.forEach(x=>{
  const ing=x.cat==='ing',arr=ing?D.ing:D.box,q=x.qty===''?0:num(x.qty),u=ing&&q>0?x.unit:'uds',pr=num(x.price)*f;
  const p=+(q>0?pr/(q/(ing?fac(u):1)):pr).toFixed(4),key=String(x.name).trim().toLowerCase();
  const ex=arr.find(i=>i.n.trim().toLowerCase()===key&&(!ing||i.u===u));
  if(ex){ex.st=+(ex.st+q).toFixed(3);if(q>0){ex.p=p;delete ex.inc}else if(ex.st<=0)ex.inc=1}
  else{const it={id:uid(),n:String(x.name).trim(),st:q,p};if(ing)it.u=u;if(!q)it.inc=1;arr.push(it)}
  n++;if(!q)m++});
 return{n,m}}
function saveEntry(){
 const iva=hd.iva.map(x=>{let b=x.b===''?0:x.b,c=x.c===''?0:x.c;if(!b&&c&&x.r)b=+(c*100/x.r).toFixed(2);if(!c&&b&&x.r)c=+(b*x.r/100).toFixed(2);return{r:x.r,b,c}}).filter(x=>x.b||x.c);
 const lines=sc.filter(x=>x.cat!=='skip'&&String(x.name).trim());
 const sumL=+lines.reduce((a,x)=>a+num(x.price),0).toFixed(2);
 let tot=hd.tot===''?0:hd.tot;
 if(!iva.length&&!tot&&!sumL){$('#err2').textContent='Indica el total o el IVA del ticket.';return}
 if(!tot)tot=iva.length?+iva.reduce((a,x)=>a+x.b+x.c,0).toFixed(2):sumL;
 if(!iva.length)iva.push({r:0,b:tot,c:0});
 const C=+iva.reduce((a,x)=>a+x.c,0).toFixed(2);
 D.led.push({id:uid(),tipo:sT,fecha:hd.fec||today(),emp:String(hd.emp||'').trim()||'Sin nombre',tot,iva,lines:lines.map(x=>({n:String(x.name).trim(),p:num(x.price)}))});
 let body;
 if(sT==='compra'){const f=hd.net&&C>0&&tot>C?(tot-C)/tot:1;const r=addStock(lines,f);
  body=`<p>${r.n} productos en el almacén${r.m?`, ${r.m} sin cantidad`:''}.</p><p>Asiento de compra guardado en el libro · IVA soportado: ${eur(C)}.</p>${r.m?'<p class="mu">Los que no tienen cantidad llevan la etiqueta “Falta cantidad”. Pulsa Editar para completarlos.</p>':''}`}
 else body=`<p>Asiento de venta guardado en el libro · IVA repercutido: ${eur(C)}.</p>`;
 save();render();open(`<h2>Ticket guardado</h2>${body}<div class="act"><button class="btn" data-a="close">Listo</button></div>`)}
function delEntry(id){ask('¿Eliminar este asiento del libro? El almacén no se modifica.',()=>{D.led=D.led.filter(x=>x.id!==id)},'Eliminar')}
const fmtD=d=>new Date(d+'T12:00').toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'});
function ledgerView(){
 const yrs=[...new Set([lp.y,new Date().getFullYear(),...D.led.map(e=>+e.fecha.slice(0,4))])].sort((a,b)=>b-a);
 const inP=e=>{const y=+e.fecha.slice(0,4),q=Math.floor((+e.fecha.slice(5,7)-1)/3)+1;return y===lp.y&&(!lp.q||q===lp.q)};
 const list=D.led.filter(inP).sort((a,b)=>b.fecha.localeCompare(a.fecha));
 const A={};let rep=0,sop=0,bv=0,bc=0;
 list.forEach(e=>e.iva.forEach(x=>{const a=A[x.r]=A[x.r]||{vb:0,vc:0,cb:0,cc:0};
  if(e.tipo==='venta'){a.vb+=x.b;a.vc+=x.c;rep+=x.c;bv+=x.b}else{a.cb+=x.b;a.cc+=x.c;sop+=x.c;bc+=x.b}}));
 const res=+(rep-sop).toFixed(2),rs=Object.keys(A).map(Number).sort((a,b)=>b-a);
 const qn=['Año completo','1.º trimestre','2.º trimestre','3.º trimestre','4.º trimestre'];
 return `<div class="bar"><h2>Libro</h2><button class="btn" data-a="scan" data-t="venta">Escanear ticket</button></div>
 <div class="card"><h3>Liquidación de IVA</h3>
 <div class="g2"><div><label>Año</label><select data-lp="y">${yrs.map(y=>`<option value="${y}"${y===lp.y?' selected':''}>${y}</option>`).join('')}</select></div>
 <div><label>Periodo</label><select data-lp="q">${qn.map((n,i)=>`<option value="${i}"${i===lp.q?' selected':''}>${n}</option>`).join('')}</select></div></div>
 ${rs.length?`<div class="tw" style="margin-top:8px"><table><tr><th>Tipo</th><th class="r">Base ventas</th><th class="r">IVA repercutido</th><th class="r">Base compras</th><th class="r">IVA soportado</th></tr>`
 +rs.map(r=>`<tr><td>${r} %</td><td class="r">${eur(A[r].vb)}</td><td class="r">${eur(A[r].vc)}</td><td class="r">${eur(A[r].cb)}</td><td class="r">${eur(A[r].cc)}</td></tr>`).join('')
 +`<tr><td><b>Total</b></td><td class="r"><b>${eur(bv)}</b></td><td class="r"><b>${eur(rep)}</b></td><td class="r"><b>${eur(bc)}</b></td><td class="r"><b>${eur(sop)}</b></td></tr></table></div>`:'<div class="empty" style="margin-top:10px">No hay asientos en este periodo.</div>'}
 <div class="rows" style="margin-top:10px"><div><span>IVA repercutido (ventas)</span><span>${eur(rep)}</span></div><div><span>IVA soportado (compras)</span><span>${eur(sop)}</span></div>
 <div class="t"><span>${res>=0?'A ingresar':'A compensar o devolver'}</span><span>${eur(Math.abs(res))}</span></div></div></div>
 <h3 style="margin:18px 0 10px;font-size:22px">Asientos</h3>`
 +(list.length?list.map(e=>`<div class="card"><div class="oh"><div><h3>${esc(e.emp)}<span class="chip">${e.tipo==='venta'?'Venta':'Compra'}</span></h3><div class="mu">${fmtD(e.fecha)}</div></div><div class="tot">${eur(e.tot)}</div></div>
 <details><summary>Ver detalles</summary><div class="rows">${e.iva.map(x=>`<div><span>IVA ${x.r} % · base ${eur(x.b)}</span><span>${eur(x.c)}</span></div>`).join('')}
 ${e.lines.map(l=>`<div><span>${esc(l.n)}</span><span>${eur(l.p)}</span></div>`).join('')}</div>
 <div class="act"><button class="lk d" data-a="delEntry" data-id="${e.id}">Eliminar asiento</button></div></details></div>`).join(''):'<div class="empty">Escanea un ticket de compra o de venta para crear el primer asiento.</div>');
}

function finOrder(id){const o=D.ord.find(x=>x.id===id);if(!o)return;
 ask('¿Terminar el pedido de '+esc(o.client)+'? Se quitará de la lista y el stock seguirá descontado.',()=>{D.ord=D.ord.filter(x=>x.id!==id)},'Terminar pedido')}

function exportData(){const b=new Blob([JSON.stringify(D)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='ohana-copia-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove()}
function importData(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(!x.s||!Array.isArray(x.ing)||!Array.isArray(x.box)||!Array.isArray(x.ord))throw 0;ask('¿Sustituir los datos actuales por la copia?',()=>{x.led=x.led||[];D=x},'Importar')}catch(_){open('<h2>Archivo no válido</h2><div class="act"><button class="btn" data-a="close">Cerrar</button></div>')}};r.readAsText(f)}

/* ---------- eventos ---------- */
document.addEventListener('click',e=>{
 if(e.target.id==='modal'){close();return}
 const t=e.target.closest('[data-a]');if(!t)return;const a=t.dataset.a,id=t.dataset.id;
 if(a==='close')close();
 else if(a==='settings')settingsModal();
 else if(a==='exp')exportData();
 else if(a==='imp')$('#imp').click();
 else if(a==='scan')scanModal(t.dataset.t);
 else if(a==='sType')setType(t.dataset.t);
 else if(a==='manual')drawScan();
 else if(a==='addRow'){sc.push({name:'',cat:'ing',price:'',qty:'',unit:'g'});drawScan()}
 else if(a==='rmRow'){sc.splice(+t.dataset.k,1);drawScan()}
 else if(a==='addIva'){hd.iva.push({r:21,b:'',c:''});drawScan()}
 else if(a==='saveEntry')saveEntry();
 else if(a==='delEntry')delEntry(id);
 else if(a==='newOrder')orderModal();
 else if(a==='saveOrder')saveOrder();
 else if(a==='addLine'){if(!D.ing.length){$('#err').textContent='Primero añade ingredientes en el almacén.';return}d.lines.push({id:D.ing[0].id,q:0});drawLines();sum()}
 else if(a==='rmLine'){d.lines.splice(+t.dataset.k,1);drawLines();sum()}
 else if(a==='delOrder')delOrder(id);
 else if(a==='finOrder')finOrder(id);
 else if(a==='newIng')itemModal('ing');
 else if(a==='newBox')itemModal('box');
 else if(a==='editIng')itemModal('ing',D.ing.find(x=>x.id===id));
 else if(a==='editBox')itemModal('box',D.box.find(x=>x.id===id));
 else if(a==='delIng')ask('¿Borrar este ingrediente?',()=>{D.ing=D.ing.filter(x=>x.id!==id)},'Borrar');
 else if(a==='delBox')ask('¿Borrar este tamaño de caja?',()=>{D.box=D.box.filter(x=>x.id!==id)},'Borrar');
});
document.addEventListener('input',e=>{const t=e.target,k=t.dataset&&t.dataset.k;if(k===undefined||!d)return;
 if(t.dataset.r==='qty'){d.lines[k].q=num(t.value);sum()}});
document.addEventListener('change',e=>{const t=e.target;if(t.dataset&&t.dataset.r==='sel'){d.lines[t.dataset.k].id=t.value;drawLines();sum()}
 if(t.dataset&&t.dataset.r==='qty')drawLines()});
document.addEventListener('change',e=>{const t=e.target;if(t.dataset&&t.dataset.lp){lp[t.dataset.lp]=+t.value;render()}});
window.addEventListener('hashchange',render);
render();
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
