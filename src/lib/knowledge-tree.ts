import type {Client,Fact} from './types';
import {calendarDate,calendarText} from './timeline';
export type KnowledgeNode={id:string;label:string;detail:string;sourceIds:string[];children:KnowledgeNode[]};
export type PositionedNode=KnowledgeNode&{parent?:string;x:number;y:number;depth:number;branch?:string;source?:string;width:number;height:number;preview:string};
export function knowledgeTree(c:Client):KnowledgeNode{
 let serial=0;const valid=(id:string)=>c.sources.some(s=>s.id===id&&s.status==='Verified');
 const node=(label:string,detail='',children:KnowledgeNode[]=[],sourceIds:string[]=[],id?:string):KnowledgeNode=>({id:id||'knowledge-'+serial++,label,detail:calendarText(detail),children,sourceIds:[...new Set(sourceIds.filter(valid))]});
 const facts=c.facts.filter(f=>f.status==='Verified'&&valid(f.sourceId));const leaf=(f:Fact)=>node(f.label,String(f.value),[],[f.sourceId]);
 const group=(label:string,items:Fact[])=>node(label,`${items.length} reviewed insights`,items.map(leaf));
 const select=(keys:string[])=>facts.filter(f=>keys.includes(f.key));
 const report=select(['reporting','comparison']);
 const communication=select(['preference','analysisStyle','objection','observation']);
 const reportGroups=new Map<string,Fact[]>();for(const f of report){const t=(f.group||f.label+' '+f.value).toLowerCase();const name=/competi|peer|benchmark/.test(t)?'Peer comparison':/inflation|revenue|growth|year|yoy/.test(t)?'Revenue & real growth':'Report structure';reportGroups.set(name,[...(reportGroups.get(name)||[]),f]);}
 const commGroups=new Map<string,Fact[]>();for(const f of communication){const t=(f.group||f.label+' '+f.value).toLowerCase();const name=f.key==='observation'?'Meeting observations — confirm':/appendix|formula|calculation|regression|avoid|spider|quant/.test(t)?'Technical detail & friction':/chart|visual|line|bar|pie/.test(t)?'Visual language':'Meeting & presentation format';commGroups.set(name,[...(commGroups.get(name)||[]),f]);}
 const commNodes=[...commGroups].map(([name,items])=>{if(name!=='Visual language')return group(name,items);const charts=items.filter(f=>/line chart|bar chart|pie chart/i.test(f.label+' '+f.value));const other=items.filter(f=>!charts.includes(f));return node(name,'How to visualize the business impact',[...other.map(leaf),...(charts.length>1?[node('Chart choices','Use only appropriate chart types',charts.map(leaf))]:charts.map(leaf))]);});
 const dossier=c.dossier&&valid(c.dossier.sourceId)?c.dossier:undefined;
 const financial=select(['gross','hedged','due','financialContext']);
 const financeNodes=financial.filter(f=>['gross','hedged','due'].includes(f.key)).map(f=>node(f.key==='due'?'Payment / review date':f.label,f.key==='due'?calendarDate(Number(f.value)):String(f.value),[],[f.sourceId]));
 const sources=c.sources.filter(s=>s.status==='Verified'&&s.id.startsWith('SRC-'));
 const roots=[
 node('People & leadership','Stakeholders and roles',[node(c.contact,c.title,[],[c.sourceId]),node('Internal coverage',c.owner),...select(['stakeholder']).map(leaf)],[],'leadership'),
 node('Business & financial position','Documented obligations and financial priorities',[node('Treasury position','Current recorded exposure',financeNodes),...select(['financialContext']).map(leaf)],[],'financial'),
 node('Goals & opportunities','Business outcomes and areas of interest',[group('Business outcomes',select(['priority','goal'])),group('Recorded interests',select(['interest']))],[],'goals'),
 node('Reporting & decision evidence','Analysis the client needs to make a decision',reportGroups.size?[...reportGroups].map(([name,items])=>group(name,items)):[node('Reporting requirements','No specific reporting requirement has been reviewed yet.')],[],'reporting'),
 node('Communication & engagement','How to structure the conversation',commNodes.length?commNodes:[node('Communication format','Confirm the preferred format.')],[],'communication'),
 node('Decision process & delivery','Approvals, operations and adoption',[...(dossier?[node('Decision criteria',dossier.criteria,[],[dossier.sourceId]),node('Adoption & scalability',dossier.scalability,[],[dossier.sourceId])]:[node('Approval path','Approvers and limits need confirmation.')]),...select(['implementation']).map(leaf)],[],'decision'),
 node('Relationship & evidence','History, reviewed sources and unresolved context',[node('Past engagement',c.success||'No prior outcome is recorded.',[],c.successSource?[c.successSource]:[]),...select(['context']).map(leaf),...(sources.length?[node('Reviewed source records','Inspect the source behind new knowledge',sources.map(s=>node(s.title,s.text,[],[s.id])))]:[])],[],'history')
 ];
 return node(c.name,c.industry,roots,[],'company');
}
export function nodePreview(detail:string){
 if(detail.length<=115)return detail;
 const end=detail.lastIndexOf(' ',112);
 return detail.slice(0,end>60?end:112).trimEnd()+'…';
}
function wrappedLines(text:string,characters:number){
 let lines=1,used=0;for(const word of text.split(/\s+/)){const length=word.length;if(used&&used+1+length>characters){lines++;used=0;}lines+=Math.floor(length/characters);used+=(used?1:0)+length%characters;}return lines;
}
/** Weighted angular sectors retain the hierarchy. Each depth ring reserves
 * enough room for its cards and relaxes crowded angles without overlap. */
export function layoutKnowledge(root:KnowledgeNode,collapsed:string[]=[]){
 const hidden=new Set(collapsed);const children=(n:KnowledgeNode)=>hidden.has(n.id)?[]:n.children;
 const mass=(n:KnowledgeNode):number=>Math.max(1,children(n).reduce((sum,ch)=>sum+mass(ch),0));
 const out:(PositionedNode&{angle:number})[]=[];
 function place(n:KnowledgeNode,parent:string|undefined,depth:number,start:number,end:number,branch?:string){
  const width=[360,270,238,210,190][Math.min(depth,4)],font=[30,20,17,15,14][Math.min(depth,4)];
  const preview=nodePreview(n.detail),labelLines=wrappedLines(n.label,Math.floor((width-40)/(font*.56)));
  const detailLines=wrappedLines(preview,Math.floor((width-40)/(13*.55)));
  const height=Math.max(depth===0?190:124,48+labelLines*font*1.4+detailLines*19+(preview.length<n.detail.length?22:0));
  out.push({...n,parent,x:0,y:0,depth,branch,source:n.sourceIds[0],width,height,preview,angle:(start+end)/2});
  const kids=children(n),weights=kids.map(ch=>depth===0?Math.sqrt(mass(ch)):mass(ch)),total=weights.reduce((a,b)=>a+b,0);let cursor=start;
  kids.forEach((child,i)=>{const span=(end-start)*weights[i]/total,gap=Math.min(.065,span*.12);place(child,n.id,depth+1,cursor+gap/2,cursor+span-gap/2,branch||child.id);cursor+=span;});
 }
 place(root,undefined,0,-Math.PI/2,Math.PI*1.5);
 let previousRadius=0,previousDiameter=Math.hypot(out[0].width,out[0].height);
 for(let depth=1;depth<=Math.max(...out.map(n=>n.depth));depth++){
  const ring=out.filter(n=>n.depth===depth).sort((a,b)=>a.angle-b.angle);
  const diameter=Math.max(...ring.map(n=>Math.hypot(n.width,n.height)));
  const radius=Math.max(depth*380,previousRadius+(previousDiameter+diameter)/2+65,(diameter+45)*ring.length/(Math.PI*2*.85));
  const gap=2*Math.asin((diameter+40)/(2*radius));
  // Relax crowded angles locally instead of enlarging the entire map for one
  // busy branch. Ordering stays stable, so descendants keep their sector order.
  for(let pass=0;pass<2000;pass++){
   let correction=0;
   for(let i=0;i<ring.length-1;i++){const delta=gap-(ring[i+1].angle-ring[i].angle);if(delta>0){ring[i].angle-=delta/2;ring[i+1].angle+=delta/2;correction=Math.max(correction,delta);}}
   if(ring.length>1){const delta=gap-(ring[0].angle+Math.PI*2-ring.at(-1)!.angle);if(delta>0){ring[0].angle+=delta/2;ring.at(-1)!.angle-=delta/2;correction=Math.max(correction,delta);}}
   if(correction<.00001)break;
  }
  for(const n of ring){n.x=Math.cos(n.angle)*radius;n.y=Math.sin(n.angle)*radius;}
  previousRadius=radius;previousDiameter=diameter;
 }
 const minX=Math.min(...out.map(n=>n.x-n.width/2))-100,maxX=Math.max(...out.map(n=>n.x+n.width/2))+100;
 const minY=Math.min(...out.map(n=>n.y-n.height/2))-100,maxY=Math.max(...out.map(n=>n.y+n.height/2))+100;
 return {nodes:out.map(n=>({...n,x:n.x-minX,y:n.y-minY})),width:maxX-minX,height:maxY-minY};
}
