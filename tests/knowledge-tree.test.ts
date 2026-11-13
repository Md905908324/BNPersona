import {test} from 'node:test';import assert from 'node:assert/strict';
import {seedClients} from '../src/lib/seed';import {applyChanges} from '../src/lib/engine';import {knowledgeTree,layoutKnowledge} from '../src/lib/knowledge-tree';
test('seven stable branches aggregate many insights without overlapping cards',()=>{
 let c=seedClients('Specialist')[0];const changes=Array.from({length:60},(_,i)=>({key:(i%2?'reporting':'analysisStyle') as 'reporting'|'analysisStyle',label:i%2?'Revenue analysis '+i:'Line chart '+i,value:'An independently reviewed requirement '+i,excerpt:'A supporting excerpt for this requirement.',selected:true,group:i%2?'Revenue & real growth':'Visual language'}));
 c=applyChanges(c,{id:'SRC-many',title:'Rich meeting',type:'Note',day:2,text:'A supporting excerpt for this requirement.',status:'Proposed'},changes);
 const tree=knowledgeTree(c);assert.equal(tree.children.length,7);const {nodes}=layoutKnowledge(tree);assert.ok(nodes.some(n=>n.depth===4));assert.ok(nodes.filter(n=>n.depth===3).length>10);
 for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=nodes[i],b=nodes[j];assert.ok(Math.abs(a.x-b.x)>=230||Math.abs(a.y-b.y)>=136,`${a.label} overlaps ${b.label}`);}
 assert.ok(nodes.filter(n=>n.source==='SRC-many').length>=60);
});
