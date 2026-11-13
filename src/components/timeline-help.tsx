'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {CircleHelp,Clock3} from 'lucide-react';
import {DEMO_DATE} from '@/lib/timeline';

export function TimelineHelp(){
 const id=useId();const ref=useRef<HTMLSpanElement>(null);const [hovered,setHovered]=useState(false);const [focused,setFocused]=useState(false);const [pinned,setPinned]=useState(false);const [dismissed,setDismissed]=useState(false);
 const open=!dismissed&&(hovered||focused||pinned);
 useEffect(()=>{if(!open)return;const close=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();setPinned(false);setDismissed(true);}};const outside=(event:PointerEvent)=>{if(!ref.current?.contains(event.target as Node)){setPinned(false);setDismissed(true);}};document.addEventListener('keydown',close,true);document.addEventListener('pointerdown',outside);return()=>{document.removeEventListener('keydown',close,true);document.removeEventListener('pointerdown',outside);};},[open]);
 return <span className="timeline-help" ref={ref} onMouseEnter={()=>{setHovered(true);setDismissed(false);}} onMouseLeave={()=>setHovered(false)} onFocus={()=>{setFocused(true);setDismissed(false);}} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node)){setFocused(false);setPinned(false);}}}><button type="button" className="timeline-help-button" aria-label="Explain demo dates" aria-describedby={open?id:undefined} onClick={()=>{setPinned(!pinned);setDismissed(pinned);}}><CircleHelp size={17}/></button>{open&&<span className="timeline-tooltip" role="tooltip" id={id}><strong>How demo dates work</strong><span>This demo is fixed as of {DEMO_DATE}. Source dates show when information was recorded; payment and review dates show the recorded deadlines.</span><span>Previously, “scenario day 0” meant Nov 10, 2026. We now show calendar dates. For example, a Nov 30 payment is 18 days away from the demo date.</span><span>These are simulated dates. They stay fixed and do not predict when a client will buy.</span></span>}</span>;
}
export function DemoClock(){
 const [now,setNow]=useState<Date|null>(null);
 useEffect(()=>{setNow(new Date());const timer=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(timer);},[]);
 const display=now?new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit',second:'2-digit',timeZoneName:'short'}).format(now):'Loading local time…';
 return <span className="demo-clock live-clock" title="Current time · America/New_York"><Clock3 size={14}/><time dateTime={now?.toISOString()} aria-label="Current date and time in America/New_York">{display}</time></span>;
}
