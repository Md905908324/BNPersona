import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calendarDate,calendarText,dateInput,dateFromInput} from '../src/lib/timeline';
import {extractChanges,days} from '../src/lib/engine';
import {seedClients} from '../src/lib/seed';

test('calendar labels preserve existing payment urgency across month and year boundaries',()=>{
 assert.equal(calendarDate(0),'Nov 10, 2026');
 assert.equal(calendarDate(2),'Nov 12, 2026');
 assert.equal(calendarDate(20),'Nov 30, 2026');
 assert.equal(calendarDate(60),'Jan 9, 2027');
 assert.equal(dateInput(-20),'2026-10-21');
 assert.equal(dateFromInput('2027-01-09'),60);
 assert.equal(dateFromInput('2026-02-30'),undefined);
 assert.equal(dateFromInput(''),undefined);
 assert.equal(days(seedClients('Specialist').find(c=>c.id==='meridian')!),18);
 assert.equal(calendarText('Supplier payment due on scenario day 20.'),'Supplier payment due on Nov 30, 2026.');
});
test('a source with an explicit calendar payment date still creates a usable reviewed update',()=>{
 const source='The supplier payment is due on 2027-01-09. Please confirm the documented amount before arranging a meeting.';
 const result=extractChanges(source).find(c=>c.key==='due');
 assert.equal(result?.value,60);
 assert.ok(source.includes(result!.excerpt));
 assert.equal(result?.label,'Payment or review date');
});
