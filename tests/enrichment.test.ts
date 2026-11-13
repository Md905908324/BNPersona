import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seedClients} from '../src/lib/seed';
import {readableEvidence} from '../src/lib/evidence-labels';

test('every demo relationship has distinct financial, stakeholder and operating evidence',()=>{
 const clients=[...seedClients('Specialist'),...seedClients('Restricted desk')];
 assert.equal(clients.length,31);
 const histories=new Set<string>();
 for(const c of clients){
  assert.ok(c.facts.length>=25,c.name);assert.ok(c.sources.length>=8,c.name);
  for(const suffix of ['business','financial','stakeholders','reporting','operations','outcome','actions']){
   const source=c.sources.find(s=>s.id===`profile-${c.id}-${suffix}`)!;
   assert.ok(source,c.name+suffix);assert.match(source.text,/SYNTHETIC DEMO ONLY/);
  }
  const history=c.facts.find(f=>f.label==='Five-year illustrative revenue history')!;
  assert.match(String(history.value),/2026.*planning estimate/);histories.add(String(history.value));
  assert.ok(c.facts.every(f=>c.sources.some(s=>s.id===f.sourceId)));
  assert.ok(c.dossier);assert.ok(c.successSource);
 }
 assert.equal(histories.size,31);
});
test('evidence names replace stable codes in text without altering unrelated text',()=>{
 const c=seedClients('Specialist').find(c=>c.id==='airbus')!;
 const text=readableEvidence('[N010] [profile-airbus-reporting] CB009',c.sources);
 assert.match(text,/Treasury discovery meeting — Airbus/);
 assert.match(text,/Reporting and communication preference interview — Airbus/);
 assert.doesNotMatch(text,/N010|CB009|profile-airbus/);
 assert.equal(readableEvidence('2026 revenue forecast',c.sources),'2026 revenue forecast');
});
