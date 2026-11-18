// SECOND SUN prototype engine, extracted from second-sun.html. Plain JS, no dependencies.
// Verified only by a Node script: toy example plus 600 seeded random runs, no limit violations. Not yet unit tested or typed.
// Port to src/domain in TypeScript, keep the logic, add tests.
const SLOTS=48,MIN=30;
const rng=(a,b)=>{const o=[];for(let i=a;i!==b;i=(i+1)%SLOTS)o.push(i);return o};
const wm=w=>w*MIN, kwhToWm=k=>Math.round(k*60000);
const fmtT=i=>String(Math.floor(i/2)).padStart(2,'0')+':'+(i%2?'30':'00');
const PRESETS={
 hollow:()=>({id:'hollow',title:'Hollow Level 9, rotating shifts',baseKWh:3.8,budgetKWh:3.8,peakW:1100,
  rooms:[{id:'R1',name:'Atrium',cap:60,watts:600,enabled:true},{id:'R2',name:'Annex',cap:30,watts:400,enabled:true},{id:'R3',name:'Mess East',cap:40,watts:500,enabled:true}],
  cohorts:[
   {id:'M',name:'Morning maintenance',pop:48,req:4,allowed:rng(10,20),quiet:[],rooms:['R1','R3']},
   {id:'N',name:'Night ventilation',pop:32,req:4,allowed:rng(38,4),quiet:[],rooms:['R1','R3']},
   {id:'H',name:'Hydroponics',pop:36,req:4,allowed:rng(14,26),quiet:rng(14,16),rooms:['R1','R3']},
   {id:'S',name:'Medical support',pop:24,req:3,allowed:rng(12,22).concat(rng(34,40)),quiet:rng(12,14),rooms:['R1','R2','R3']}]}) ,
 rationing:()=>{const s=PRESETS.hollow();s.id='rationing';s.title='Emergency rationing';s.baseKWh=1.2;s.budgetKWh=1.2;s.peakW=600;s.rooms[0].enabled=false;return s},
 toy:()=>({id:'toy',title:'Toy fairness example',baseKWh:0.4,budgetKWh:0.4,peakW:400,
  rooms:[{id:'R1',name:'Single room',cap:100,watts:400,enabled:true}],
  cohorts:[{id:'A',name:'Group A',pop:10,req:2,allowed:rng(10,14),quiet:[],rooms:['R1']},{id:'B',name:'Group B',pop:10,req:2,allowed:rng(10,14),quiet:[],rooms:['R1']}]})
};
function candidates(sc,c){const q=new Set(c.quiet),al=[...new Set(c.allowed)].sort((a,b)=>a-b),o=[];
 for(const r of sc.rooms){if(!r.enabled||!c.rooms.includes(r.id)||r.cap<c.pop)continue;for(const s of al)if(!q.has(s))o.push({r,s})}return o}
function solve(sc,mode){
 const budget=kwhToWm(sc.budgetKWh),peak=sc.peakW,used0={v:0};
 const cand={};sc.cohorts.forEach(c=>cand[c.id]=candidates(sc,c));
 const roomUse=new Set(),cohUse=new Set(),slotW=Array(SLOTS).fill(0),got={},asg=[];
 sc.cohorts.forEach(c=>got[c.id]=0);
 const cont=s=>sc.cohorts.filter(c=>c.allowed.includes(s)).length;
 const feas=c=>cand[c.id].filter(({r,s})=>!roomUse.has(r.id+'|'+s)&&!cohUse.has(c.id+'|'+s)&&used0.v+wm(r.watts)<=budget&&slotW[s]+r.watts<=peak);
 const put=(c,{r,s})=>{roomUse.add(r.id+'|'+s);cohUse.add(c.id+'|'+s);slotW[s]+=r.watts;used0.v+=wm(r.watts);got[c.id]++;asg.push({cohortId:c.id,roomId:r.id,slot:s,watts:r.watts})};
 if(mode==='fair'){for(;;){
  const open=sc.cohorts.filter(c=>c.req>0&&got[c.id]<c.req).map(c=>({c,f:feas(c)})).filter(x=>x.f.length);
  if(!open.length)break;
  open.sort((a,b)=>got[a.c.id]/a.c.req-got[b.c.id]/b.c.req||a.c.id.localeCompare(b.c.id));
  const {c,f}=open[0];
  f.sort((a,b)=>a.r.watts-b.r.watts||cont(a.s)-cont(b.s)||a.s-b.s||a.r.id.localeCompare(b.r.id));
  put(c,f[0])}}
 else{for(const c of sc.cohorts)while(got[c.id]<c.req){const f=feas(c);if(!f.length)break;f.sort((a,b)=>a.s-b.s||a.r.id.localeCompare(b.r.id));put(c,f[0])}}
 const used=used0.v,pop=Object.fromEntries(sc.cohorts.map(c=>[c.id,c.pop]));
 const cov=sc.cohorts.filter(c=>c.req>0).map(c=>Math.min(1,got[c.id]/c.req));
 const m={sessions:asg.length,minCov:cov.length?Math.min(...cov):null,avgCov:cov.length?cov.reduce((a,b)=>a+b,0)/cov.length:null,
  gap:cov.length?Math.max(...cov)-Math.min(...cov):null,kwh:used/60000,personSlots:asg.reduce((a,x)=>a+pop[x.cohortId],0),peakW:Math.max(0,...slotW),
  unmet:sc.cohorts.reduce((a,c)=>a+Math.max(0,c.req-got[c.id]),0)};
 const why={};
 for(const c of sc.cohorts){const un=c.req-got[c.id];
  if(c.req<=0){why[c.id]='No request.';continue}
  if(un<=0){why[c.id]='Fully served.';continue}
  if(!cand[c.id].length){why[c.id]='Unmet '+un+' of '+c.req+'. No eligible room and slot exists: check its window, quiet hours, room access, room capacity and whether rooms are enabled.';continue}
  let occ=0,en=0,pk=0;
  for(const {r,s} of cand[c.id]){if(cohUse.has(c.id+'|'+s))continue;if(roomUse.has(r.id+'|'+s)){occ++;continue}if(used+wm(r.watts)>budget)en++;else if(slotW[s]+r.watts>peak)pk++}
  const p=[];if(en)p.push(en+' open option'+(en>1?'s':'')+' need more energy than remains');if(pk)p.push(pk+' would exceed the peak-power cap');if(occ)p.push(occ+' room-slot'+(occ>1?'s are':' is')+' already booked');
  why[c.id]='Unmet '+un+' of '+c.req+'. Of '+cand[c.id].length+' eligible options, '+(p.length?p.join('; '):'the rest overlap sessions this group already has')+'. Several limits can apply at once.'}
 return {asg,got,m,why,budgetWm:budget}}
function validate(sc,res){const v=[],rm={},ch={},sw=Array(SLOTS).fill(0),cnt={};let e=0;
 for(const a of res.asg){const c=sc.cohorts.find(x=>x.id===a.cohortId),r=sc.rooms.find(x=>x.id===a.roomId);
  if(!c||!r){v.push('unknown ref');continue}
  if(!r.enabled)v.push('disabled room');if(!c.allowed.includes(a.slot))v.push('outside window');if(c.quiet.includes(a.slot))v.push('quiet slot');
  if(r.cap<c.pop)v.push('capacity');if(!c.rooms.includes(r.id))v.push('room access');
  if(rm[r.id+a.slot])v.push('room double-booked');rm[r.id+a.slot]=1;if(ch[c.id+a.slot])v.push('group double-booked');ch[c.id+a.slot]=1;
  sw[a.slot]+=a.watts;e+=wm(a.watts);cnt[c.id]=(cnt[c.id]||0)+1}
 sc.cohorts.forEach(c=>{if((cnt[c.id]||0)>c.req)v.push('over request')});
 if(sw.some(w=>w>sc.peakW))v.push('peak cap');if(e>kwhToWm(sc.budgetKWh))v.push('energy cap');return v}
if(typeof module!=='undefined')module.exports={SLOTS,rng,PRESETS,candidates,solve,validate,fmtT,kwhToWm};
export {SLOTS,rng,PRESETS,candidates,solve,validate,fmtT,kwhToWm};
