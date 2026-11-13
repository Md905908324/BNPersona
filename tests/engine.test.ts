import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seedClients,createState} from '../src/lib/seed';
import {buildBriefing} from '../src/lib/preparation';
import {productTemplates} from '../src/lib/products';
import {discover,matchClient,remaining,applyChanges,extractChanges,makeGuide,interpretProduct} from '../src/lib/engine';
test('FX discovery respects urgency, preserves inferred appetite and suppresses stale or unsupported exposure',()=>{const clients=seedClients('Specialist').slice(0,8);const matches=discover(clients,productTemplates.FX);const eligible=matches.filter(m=>m.eligible);assert.deepEqual(eligible.map(m=>m.client.id),['cemex','lactalis','volvo-group','decathlon']);assert.equal(eligible.find(m=>m.client.id==='lactalis')!.acceptance,'Unknown');assert.equal(eligible.find(m=>m.client.id==='lactalis')!.interestStatus,'Inferred product fit');assert.equal(eligible.find(m=>m.client.id==='decathlon')!.evidence,'Strong');assert.ok(!matches.find(m=>m.client.id==='polygroup')!.eligible);assert.ok(!matches.find(m=>m.client.id==='arkadin')!.eligible);});
test('currency, horizon and product category alter results',()=>{const c=seedClients('Specialist').slice(0,8);assert.deepEqual(discover(c,{...productTemplates.FX,currencies:'MXN',horizon:30}).filter(m=>m.eligible).map(m=>m.client.id),['cemex']);assert.deepEqual(discover(c,productTemplates['Trade finance']).filter(m=>m.eligible).map(m=>m.client.id),['ingram-micro']);assert.deepEqual(discover(c,productTemplates['Cash management']).filter(m=>m.eligible).map(m=>m.client.id),['ch-robinson']);});
test('role seed payload contains no restricted relationship for coverage roles',()=>{for(const r of ['Specialist','Relationship manager'] as const){const raw=JSON.stringify(createState(r));assert.ok(!raw.includes('Juniper'));assert.ok(!raw.includes('X009'));}assert.equal(seedClients('Restricted desk').length,1);});
test('reviewed feedback preserves gross payable and updates only remaining exposure',()=>{const c=seedClients('Specialist')[0];const text='CFO confirms MXN 6 million has now been hedged. MXN 12 million remains unhedged. She requests three scenarios for the remaining amount.';const changes=extractChanges(text);assert.equal(changes.find(x=>x.key==='hedged')!.value,6000000);assert.ok(!changes.some(x=>x.key==='gross'));const n=applyChanges(c,{id:'F001',title:'Feedback',day:2,text,type:'Interaction feedback',status:'Proposed'},changes);assert.equal(c.version,1);assert.equal(n.version,2);assert.equal(n.gross,18000000);assert.equal(remaining(n),12000000);assert.equal(n.history.length,2);assert.equal(Math.round(remaining(n)/17),705882);assert.equal(Math.round(remaining(n)/18),666667);assert.equal(Math.round(remaining(n)/19),631579);assert.ok(makeGuide(n,productTemplates.FX).includes('$705,882'));});
test('invalid hedge amounts cannot corrupt a persona',()=>{const c=seedClients('Specialist')[0];assert.throws(()=>applyChanges(c,{id:'F002',title:'Bad feedback',day:2,text:'',type:'Note',status:'Proposed'},[{key:'hedged',label:'Hedged',value:20000000,selected:true,excerpt:''}]),/exceed/);assert.throws(()=>applyChanges(c,{id:'F003',title:'Bad feedback',day:2,text:'',type:'Note',status:'Proposed'},[{key:'gross',label:'Payable',value:-1,selected:true,excerpt:''}]),/non-negative/);});
test('ambiguous products and withdrawn sources do not produce actionable matches',()=>{assert.equal(interpretProduct('generic product for businesses'),null);const c=seedClients('Specialist')[0];c.sources[0].status='Withdrawn';assert.equal(matchClient(c,productTemplates.FX).eligible,false);});

test('expanded portfolio has 30 authorized relationships and varied needs',()=>{
 const c=seedClients('Specialist');assert.equal(c.length,30);assert.equal(new Set(c.map(x=>x.id)).size,30);
 assert.ok(c.every(x=>x.sources.some(s=>s.id===x.sourceId&&s.status==='Verified')));
 assert.equal(c.filter(x=>x.category==='FX').length,19);
 assert.equal(c.filter(x=>x.category==='Trade finance').length,5);
 assert.equal(c.filter(x=>x.category==='Cash management').length,6);
 assert.ok(!matchClient(c.find(x=>x.id==='maersk')!,productTemplates.FX).eligible);
 assert.ok(!matchClient(c.find(x=>x.id==='alliander')!,productTemplates.FX).eligible);
 assert.ok(matchClient(c.find(x=>x.id==='edp')!,productTemplates.FX).eligible);
});
test('persona briefing uses reviewed working-style evidence and keeps uncertainty explicit',()=>{
 const c=seedClients('Specialist');const north=c[0];const b=buildBriefing(north,productTemplates.FX);
 assert.match(b.dimensions.find(x=>x.title==='Scalability and adoption')!.text,/spreadsheet/);
 assert.ok(b.dimensions.find(x=>x.title==='Decision criteria')!.sourceIds.includes('P001'));
 assert.ok(b.receptive.every(x=>x.kind==='Suggested approach'));
 assert.match(b.dimensions.find(x=>x.title==='What worked in the past')!.text,/prior engagement only/);
 north.sources.find(s=>s.id==='P001')!.status='Withdrawn';
 const withdrawn=buildBriefing(north,productTemplates.FX);
 assert.equal(withdrawn.dimensions.find(x=>x.title==='Scalability and adoption')!.kind,'To confirm');
 const inferred=buildBriefing(c.find(x=>x.id==='lactalis')!,productTemplates.FX);
 assert.match(inferred.summary,/No product appetite/);
 assert.equal(inferred.dimensions.find(x=>x.title==='Preferred communication structure')!.kind,'To confirm');
 const meridian=buildBriefing(c.find(x=>x.id==='cemex')!,productTemplates.FX);
 assert.match(meridian.dimensions.find(x=>x.title==='Timing and buying signals')!.text,/18 days remaining/);
 assert.match(makeGuide(c[0],productTemplates.FX),/CURRENCY SENSITIVITY/);
});

test('distinct reporting requirements survive approval and inform preparation',()=>{
 const c=seedClients('Specialist')[0];const src={id:'SRC-report',title:'Reporting request',type:'Qualitative note',day:2,text:'A report per metric. Five years of inflation-adjusted revenue. Compare competitors. Use simple bar charts.',status:'Proposed' as const};
 const n=applyChanges(c,src,[{key:'reporting',label:'Report format',value:'A report per metric',excerpt:'A report per metric.',selected:true},{key:'reporting',label:'History requirement',value:'Five years of inflation-adjusted revenue',excerpt:'Five years of inflation-adjusted revenue.',selected:true},{key:'analysisStyle',label:'Chart style',value:'Use simple bar charts',excerpt:'Use simple bar charts.',selected:true}]);
 assert.equal(n.facts.filter(f=>f.key==='reporting'&&f.sourceId==='SRC-report').length,2);assert.equal(n.gross,c.gross);assert.match(makeGuide(n,productTemplates.FX),/Five years of inflation-adjusted revenue/);assert.match(makeGuide(n,productTemplates.FX),/Use simple bar charts/);
});
test('broader BNP product discovery uses explicit synthetic cross-business evidence',()=>{
 const clients=seedClients('Specialist');assert.ok(discover(clients,productTemplates['Corporate financing']).some(m=>m.eligible));assert.equal(interpretProduct('Interest-rate hedging for floating-rate debt'),'Interest-rate risk');
});
