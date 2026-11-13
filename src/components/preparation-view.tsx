'use client';
import {useEvidenceLabels} from './evidence-labels';
import {readableEvidence} from '@/lib/evidence-labels';
import {useState} from 'react';
import {Check,FileText,Pencil,ShieldCheck,Sparkles} from 'lucide-react';
import type {Client,Product,Guide,PersonaBriefing,BriefingItem} from '@/lib/types';
import {calendarText} from '@/lib/timeline';
import {buildBriefing} from '@/lib/preparation';
import {Badge,SourceButton} from './ui';

export function PersonaBrief({client,product,briefing,openSource}:{client:Client;product:Product;briefing?:PersonaBriefing;openSource:(c:Client,id:string)=>void}){
 const b=briefing||buildBriefing(client,product);
 const card=(item:BriefingItem,index:number)=><article className="briefing-card" key={item.title+index}><div className="briefing-card-top"><h3>{item.title}</h3><Badge tone={item.kind==='Documented'?'green':item.kind==='To confirm'?'amber':'gray'}>{item.kind}</Badge></div><p>{calendarText(item.text)}</p><div className="inline-badges">{item.sourceIds.map(id=><SourceButton key={id} id={id} onClick={()=>openSource(client,id)}/>)}</div></article>;
 return <section className="persona-briefing" aria-labelledby="persona-briefing-heading"><div className="briefing-title"><div><span className="eyebrow">01 / UNDERSTAND THE PERSONA</span><h2 id="persona-briefing-heading">How to approach {client.contact.split(' ')[0]}</h2></div><Badge tone="gray"><ShieldCheck size={13}/>Source-grounded briefing</Badge></div><p className="briefing-summary">{calendarText(b.summary)}</p><div className="briefing-grid">{b.dimensions.map(card)}</div><div className="reaction-grid"><section><h3>Likely receptive to</h3><p className="small muted">Discussion formats and next steps to test with the client.</p>{b.receptive.map(card)}</section><section><h3>Reservations and likely pushback</h3><p className="small muted">Recorded concerns and suggested questions to anticipate.</p>{b.challenge.map(card)}</section></div><p className="briefing-boundary"><ShieldCheck size={15}/>Suggested approaches are hypotheses for banker judgment. They describe possible reactions, not a simulated personality or a prediction of purchase.</p></section>;
}

export function Preparing({client}:{client:Client}){
 return <section className="preparing-panel" role="status" aria-live="polite" aria-busy="true"><div className="preparing-title"><span className="spinner dark"/><div><span className="eyebrow">PREPARING YOUR APPROACH</span><h2>Connecting the evidence for {client.contact}</h2><p>Reviewing the dimensions below to prepare the persona briefing and engagement guide.</p></div></div><div className="preparing-dimensions">{['Business impact and priorities','Scalability and adoption','Decision criteria and tradeoffs','Preferred structure and communication','Previous outcomes and what worked','Receptiveness, reservations and unknowns'].map(x=><span key={x}><FileText size={16}/>{x}</span>)}</div><p className="small muted">This is a source-based preparation task. Missing information stays visible as “To confirm.”</p></section>;
}

export function GuideDocument({guide,updateGuide}:{guide:Guide;updateGuide:(text:string)=>void}){
 const [editing,setEditing]=useState(false);
 const {labels}=useEvidenceLabels();const displayText=readableEvidence(guide.text,[...labels].map(([id,title])=>({id,title})));
 const chunks=calendarText(displayText).split(/\n\n+/);
 return <><div className="guide-view-controls"><span className="eyebrow">02 / CLIENT ENGAGEMENT GUIDE</span><button className="button secondary" onClick={()=>setEditing(x=>!x)}>{editing?<Check size={15}/>:<Pencil size={15}/>} {editing?'Done editing':'Edit guide'}</button></div>{editing?<><label className="sr-only" htmlFor="guide-editor">Edit client discussion guide</label><textarea id="guide-editor" className="guide-editor" value={calendarText(displayText)} onChange={e=>updateGuide(e.target.value)}/></>:<div className="guide-reader">{chunks.map((chunk,index)=>{const lines=chunk.split('\n');const heading=lines[0];return <section key={index}>{/^[A-Z][A-Z /-]+$/.test(heading)?<><h3>{heading}</h3><div>{lines.slice(1).join('\n')}</div></>:<div>{chunk}</div>}</section>;})}</div>}<div className="guide-paper-foot"><span><Pencil size={13}/>Edits save automatically and require a new review.</span><span>{guide.text.split(/\s+/).length} words</span></div></>;
}
