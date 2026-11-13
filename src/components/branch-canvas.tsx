'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {Minus,Plus,Maximize2,RotateCcw,ChevronDown,ChevronRight,MousePointer2} from 'lucide-react';
import type {Client} from '@/lib/types';
import {knowledgeTree,layoutKnowledge} from '@/lib/knowledge-tree';
import {SourceButton} from './ui';
type Branch={id:string;label:string;facts:{label:string;value:string}[];sourceIds:string[]};
export function BranchCanvas({client,branches,onSelect,openSource}:{client:Client;branches:Branch[];onSelect:(id:string)=>void;openSource:(c:Client,id:string)=>void}){
 const [focus,setFocus]=useState('all'),[zoom,setZoom]=useState(.3),[pan,setPan]=useState({x:0,y:0}),[collapsed,setCollapsed]=useState<string[]>([]),[selected,setSelected]=useState<string|null>(null);
 const drag=useRef<{x:number;y:number;px:number;py:number}|null>(null),frame=useRef<HTMLDivElement>(null);
 const latest=client.version>1?client.sources.filter(s=>s.status==='Verified'&&s.id.startsWith('SRC-')).at(-1)?.id:undefined;
 const fullTree=useMemo(()=>knowledgeTree(client),[client]);
 const {nodes,width,height}=useMemo(()=>layoutKnowledge(focus==='all'?fullTree:{...fullTree,children:fullTree.children.filter(c=>c.id===focus)},collapsed),[fullTree,focus,collapsed]);
 const inspected=nodes.find(n=>n.id===selected);
 const fit=()=>Math.max(.035,Math.min(.7,((frame.current?.clientWidth||800)-50)/width,((frame.current?.clientHeight||720)-50)/height));
 useEffect(()=>{const el=frame.current;if(!el)return;const resize=()=>{const fitted=Math.max(.035,Math.min(.7,(el.clientWidth-50)/width,(el.clientHeight-50)/height));const initial=focus==='all'?Math.max(.45,fitted):fitted;setZoom(initial);setPan(focus==='all'?{x:(width/2-nodes[0].x)*initial,y:(height/2-nodes[0].y)*initial}:{x:0,y:0});};resize();const observer=new ResizeObserver(resize);observer.observe(el);return()=>observer.disconnect();},[width,height,focus]);
 useEffect(()=>{const el=frame.current;if(!el)return;const wheel=(e:WheelEvent)=>{e.preventDefault();setZoom(z=>Math.min(2.5,Math.max(.035,z*(e.deltaY<0?1.1:1/1.1))));};el.addEventListener('wheel',wheel,{passive:false});return()=>el.removeEventListener('wheel',wheel);},[]);
 const reset=()=>{setZoom(fit());setPan({x:0,y:0});},change=(factor:number)=>setZoom(z=>Math.min(2.5,Math.max(.035,z*factor)));
 return <div className="branch-workspace">
  <div className="branch-toolbar"><label className="branch-focus">Inspect branch<select aria-label="Focus map branch" value={focus} onChange={e=>{setFocus(e.target.value);setCollapsed([]);setSelected(null);}}><option value="all">All seven themes</option>{fullTree.children.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select></label><span>Drag to pan · scroll to zoom · select a node</span><div><button aria-label="Zoom out" onClick={()=>change(1/1.2)}><Minus size={16}/></button><output aria-label="Map zoom">{Math.round(zoom*100)}%</output><button aria-label="Zoom in" onClick={()=>change(1.2)}><Plus size={16}/></button><button aria-label="Fit map" onClick={reset}><Maximize2 size={16}/></button><button aria-label="Expand all branches" onClick={()=>setCollapsed([])}><RotateCcw size={16}/></button></div></div>
  <div className="branch-body-scroll"><div className="branch-body">
   <div className="branch-viewport" ref={frame} tabIndex={0} aria-label="Zoomable company knowledge map" onKeyDown={e=>{if(e.target!==e.currentTarget)return;if(e.key==='+'||e.key==='=')change(1.2);if(e.key==='-')change(1/1.2);if(e.key==='0')reset();if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();setPan(p=>({x:p.x+(e.key==='ArrowLeft'?40:e.key==='ArrowRight'?-40:0),y:p.y+(e.key==='ArrowUp'?40:e.key==='ArrowDown'?-40:0)}));}}}
    onPointerDown={e=>{if((e.target as HTMLElement).closest('button'))return;drag.current={x:e.clientX,y:e.clientY,px:pan.x,py:pan.y};e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{if(drag.current)setPan({x:drag.current.px+e.clientX-drag.current.x,y:drag.current.py+e.clientY-drag.current.y});}} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}>
    <div className="branch-world" style={{width,height,transform:`translate(calc(-50% + ${pan.x}px),calc(-50% + ${pan.y}px)) scale(${zoom})`}}>
     <svg width={width} height={height} aria-hidden="true">{nodes.filter(n=>n.parent).map(n=>{const parent=nodes.find(p=>p.id===n.parent)!,dx=n.x-parent.x,dy=n.y-parent.y;return <path key={n.id} d={`M${parent.x} ${parent.y} C${parent.x+dx*.4} ${parent.y+dy*.15},${n.x-dx*.3} ${n.y-dy*.15},${n.x} ${n.y}`} fill="none" stroke={n.depth===1?'#75b695':'#c1dccc'} strokeWidth={n.depth===1?3:2}/>;})}</svg>
     {nodes.map(n=><div key={n.id} className={`branch-node depth-${n.depth} ${selected===n.id?'selected':''} ${latest&&n.sourceIds.includes(latest)?'new-knowledge':''}`} style={{left:n.x,top:n.y,width:n.width,height:n.height}}>
      <button aria-label={`Inspect ${n.label}`} aria-pressed={selected===n.id} onClick={()=>{setSelected(n.id);if(n.branch&&branches.some(b=>b.id===n.branch))onSelect(n.branch);}}>
       <span className="branch-node-level">{n.depth===0?'COMPANY':n.depth===1?'THEME':'LEVEL '+(n.depth-1)}</span><strong>{n.label}</strong>{latest&&n.sourceIds.includes(latest)&&<span className="new-knowledge-label">NEW / UPDATED</span>}<span className="branch-node-preview">{n.preview}</span>{n.preview!==n.detail&&<small className="branch-read-more">Select for full details ↗</small>}
      </button>{n.children.length>0&&n.depth>0&&<button className="branch-collapse" aria-label={`${collapsed.includes(n.id)?'Expand':'Collapse'} ${n.label}`} onClick={()=>setCollapsed(v=>v.includes(n.id)?v.filter(x=>x!==n.id):[...v,n.id])}>{collapsed.includes(n.id)?<ChevronRight size={15}/>:<ChevronDown size={15}/>}</button>}
     </div>)}
    </div>
   </div>
   <aside className="branch-inspector" aria-label="Selected map node" aria-live="polite">{inspected?<><span className="eyebrow">SELECTED NODE</span><h3>{inspected.label}</h3><span className="branch-selection-depth">{inspected.depth===0?'Company overview':inspected.depth===1?'Primary theme':`Detail level ${inspected.depth-1}`}</span><p>{inspected.detail}</p>{inspected.children.length>0&&<div className="branch-child-list"><h4>Explore this branch</h4>{inspected.children.map(child=><button key={child.id} onClick={()=>{setCollapsed(v=>v.filter(id=>id!==inspected.id));setSelected(child.id);}}>{child.label}<ChevronRight size={14}/></button>)}</div>}<div className="branch-selected-sources">{inspected.sourceIds.map(id=><SourceButton key={id} id={id} onClick={()=>openSource(client,id)}/>)}</div></>:<><MousePointer2 size={24}/><span className="eyebrow">EXPLORE THE PERSONA</span><h3>Select a node</h3><p>Inspect the full context and supporting evidence here. The company sits at the center; smaller cards reveal each deeper level.</p><p>Use the branch selector to focus a theme. Fit map shows every branch; zoom and drag to inspect the details.</p></>}</aside>
  </div></div>
 </div>;
}
