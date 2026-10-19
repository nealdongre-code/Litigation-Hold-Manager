import test from 'node:test';
import assert from 'node:assert/strict';
import { loadDemo, applyDemo, resetDemo, demoCalendar, storageKey } from './state.mjs';
const storage = () => {const values=new Map();return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};};
test('visitors have isolated persistent records and can reset sample data',()=>{
 const a=storage(),b=storage(),initial=loadDemo(a),id=initial.holds[0].id;
 applyDemo(a,{type:'decision',id,decision:'release',reason:'Demo completed'});
 assert.equal(loadDemo(a).holds[0].status,'Released');
 assert.equal(loadDemo(b).holds[0].status,'Active');
 assert.ok(loadDemo(a).holds.some(h=>h.status==='Active'&&h.employeeIds.includes('EMP-1042')));
 resetDemo(a); assert.equal(loadDemo(a).holds[0].status,'Active');
 applyDemo(a,{type:'clearDemo'});assert.equal(loadDemo(a).holds.length,0);
 assert.ok(resetDemo(a).holds.length);
});
test('email simulation records an explicit simulated outcome without network access',()=>{
 const s=storage();applyDemo(s,{type:'prepare'});const request=loadDemo(s).requests[0];
 const result=applyDemo(s,{type:'send',id:request.id});
 assert.equal(result.requests.find(r=>r.id===request.id).status,'simulated');
 assert.match(result.history[0].text,/no email was sent/);
 assert.throws(()=>applyDemo(s,{type:'send',id:request.id}));
});
test('calendar links retain GitHub Pages project path and sample privacy',()=>{
 const hold=loadDemo(storage()).holds[0],ics=demoCalendar(hold,'https://nealdongre-code.github.io/Litigation-Hold-Manager/?hold=old');
 assert.match(ics,/BEGIN:VCALENDAR/);
 assert.ok(ics.replaceAll('\r\n ','').includes('/Litigation-Hold-Manager/?hold='+hold.id));
 assert.ok(!ics.includes(hold.matter));
});
test('broken or unavailable storage fails explicitly without discarding data',()=>{
 const s=storage();s.setItem(storageKey,'broken');assert.throws(()=>loadDemo(s),/Reset demo/);
 assert.equal(s.getItem(storageKey),'broken');
 const blocked={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}};
 assert.throws(()=>loadDemo(blocked));assert.throws(()=>resetDemo(blocked));
});
