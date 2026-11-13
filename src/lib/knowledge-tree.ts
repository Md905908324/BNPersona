import type {Client,Fact} from './types';
import {calendarDate,calendarText} from './timeline';
export type KnowledgeNode={id:string;label:string;detail:string;sourceIds:string[];children:KnowledgeNode[]};
export type PositionedNode=KnowledgeNode&{parent?:string;x:number;y:number;depth:number;branch?:string;source?:string};
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
/** Tidy bilateral tree. Every subtree owns a disjoint vertical band. Fixed-size
 * cards in separate depth columns cannot overlap, irrespective of leaf count. */
export function layoutKnowledge(root:KnowledgeNode,collapsed:string[]=[]){
 const hidden=new Set(collapsed);const children=(n:KnowledgeNode)=>hidden.has(n.id)?[]:n.children;
 const size=(n:KnowledgeNode):number=>Math.max(156,children(n).reduce((sum,ch)=>sum+size(ch),0));
 const left=root.children.slice(0,3),right=root.children.slice(3);const height=Math.max(950,left.reduce((n,c)=>n+size(c),0),right.reduce((n,c)=>n+size(c),0))+160;const width=3040,cx=width/2;
 const out:PositionedNode[]=[{...root,x:cx,y:height/2,depth:0}];
 function place(n:KnowledgeNode,parent:string,depth:number,sign:number,top:number,branch:string){const band=size(n);out.push({...n,parent,x:cx+sign*depth*310,y:top+band/2,depth,branch,source:n.sourceIds[0]});let cursor=top;for(const child of children(n)){place(child,n.id,depth+1,sign,cursor,branch);cursor+=size(child);}}
 for(const [list,sign]of [[left,-1],[right,1]] as const){let top=(height-list.reduce((n,c)=>n+size(c),0))/2;for(const child of list){place(child,root.id,1,sign,top,child.id);top+=size(child);}}
 return {nodes:out,width,height};
}
