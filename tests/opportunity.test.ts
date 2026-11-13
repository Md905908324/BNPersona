import {test} from 'node:test';import assert from 'node:assert/strict';
import {seedClients} from '../src/lib/seed';import {productTemplates} from '../src/lib/products';import {opportunityBrief} from '../src/lib/opportunity';
test('Airbus rationale connects a recorded need, production uncertainty, format and missing evidence',()=>{
 const c=seedClients('Specialist').find(c=>c.id==='vale')!;const b=opportunityBrief(c,productTemplates.FX);
 assert.match(b.headline,/flexibility/);assert.match(b.quantitative,/9,000,000/);assert.ok(b.limits.some(x=>/production/.test(x.text)));assert.ok(b.supports.some(x=>/spreadsheet/.test(x.text)));
 assert.match(b.sections.find(s=>s.title==='Recommended opening')!.text,/firm.*variable/);assert.match(b.sections.find(s=>s.title==='What we still need to learn')!.text,/committee|approves/);assert.equal(b.sections.length,6);assert.equal(b.coverage,5);
 assert.ok(!b.sections.some(s=>/87%|probability of purchase|multi-variable/.test(s.text)));
});
test('cost objections and unconfirmed interest produce different discussion rationales',()=>{
 const c=seedClients('Specialist');const cost=opportunityBrief(c.find(c=>c.id==='atlas')!,productTemplates.FX);const inferred=opportunityBrief(c.find(c=>c.id==='summit')!,productTemplates.FX);
 assert.match(cost.headline,/Cost/);assert.equal(cost.readiness,'Low');assert.equal(inferred.readiness,'Unknown');assert.match(inferred.approach,/whether.*warrants a conversation/);
});
test('withdrawn exposure evidence cannot support discussion readiness',()=>{
 const c=seedClients('Specialist').find(c=>c.id==='vale')!;c.sources.find(s=>s.id===c.sourceId)!.status='Withdrawn';const b=opportunityBrief(c,productTemplates.FX);assert.equal(b.readiness,'Unknown');assert.ok(!b.supports.some(p=>p.sourceIds.includes(c.sourceId)));
});
