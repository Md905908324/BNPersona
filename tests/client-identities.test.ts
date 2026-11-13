import {test} from 'node:test';import assert from 'node:assert/strict';
import {canonicalClientLocation,legacyClientIds,migrateCachedState} from '../src/lib/client-identities';
import {createState} from '../src/lib/seed';
test('every former client route redirects to its company and retains product context',()=>{
 for(const [old,next]of Object.entries(legacyClientIds)){
  assert.equal(canonicalClientLocation('/clients/'+old+'/prepare',{productId:'fx-forward'}),'/clients/'+next+'/prepare?productId=fx-forward');
  assert.equal(canonicalClientLocation('/data',{client:old,tag:['one','two']}),'/data?client='+next+'&tag=one&tag=two');
 }
 assert.equal(canonicalClientLocation('/clients/volvo-group',{}),null);
 assert.equal(canonicalClientLocation('/clients/not-a-client',{}),null);
});
test('company migration preserves saved work, approved guides, uploads and withdrawn evidence',()=>{
 const state=createState('Specialist');const c=state.clients[0];c.id='northstar';c.version=7;
 c.sources.find(s=>s.id===c.sourceId)!.status='Withdrawn';
 c.sources.push({id:'SRC-upload',title:'My uploaded note',type:'Note',day:2,text:'Northstar was a project codename; preserve this original note.',status:'Verified'});
 state.saved.push({id:'saved-1',clientId:'northstar',product:state.product,note:'Keep my notes',owner:'Matthew Ding',status:'Saved'});
 state.guides.push({id:'guide-1',clientId:'northstar',productId:state.product.id,productName:state.product.name,personaVersion:7,text:'Reviewed guide [profile-northstar-reporting]',mode:'Live AI',sourceIds:['profile-northstar-reporting'],status:'Approved',comment:'Keep review',updated:'2026-11-12',formatVersion:2});
 state.proposals.push({id:'proposal-1',clientId:'northstar',source:c.sources.at(-1)!,changes:[],mode:'Live AI'});
 state.activity.push({id:'log-1',time:'2026-11-12',action:'Saved',clientId:'northstar',detail:'Open /clients/northstar/prepare?productId=fx-forward'});
 const legacy=JSON.parse(JSON.stringify(state).replaceAll('profile-volvo-group-','profile-northstar-'));
 const migrated=migrateCachedState(legacy);
 assert.equal(migrated.clients[0].id,'volvo-group');assert.equal(migrated.clients[0].version,7);
 assert.equal(migrated.clients[0].sources.find(s=>s.id===c.sourceId)!.status,'Withdrawn');
 assert.equal(migrated.clients[0].sources.at(-1)!.text,c.sources.at(-1)!.text);
 assert.equal(migrated.saved[0].clientId,'volvo-group');assert.equal(migrated.saved[0].note,'Keep my notes');
 assert.equal(migrated.guides[0].status,'Approved');assert.equal(migrated.guides[0].text,'Reviewed guide [profile-volvo-group-reporting]');
 assert.equal(migrated.proposals[0].clientId,'volvo-group');assert.match(migrated.activity[0].detail,/clients\/volvo-group\/prepare/);
 assert.deepEqual(migrateCachedState(migrated),migrated);
});
test('fresh portfolio uses current companies in identifiers and evidence',()=>{
 const state=createState('Specialist');for(const c of state.clients){assert.ok(!legacyClientIds[c.id]);assert.ok(c.sources.some(s=>s.id===`profile-${c.id}-business`));}
 assert.doesNotMatch(JSON.stringify(state),/Northstar|Summit Foods|Meridian Components|Vale Automotive/);
});
