import {SCENARIO_DAY} from './constants';

// A fixed demo calendar keeps payment urgency stable across repeated walkthroughs.
const BASE=Date.UTC(2026,10,10);
const DAY=86_400_000;
export function dateInput(day:number){return new Date(BASE+day*DAY).toISOString().slice(0,10);}
export function dateFromInput(value:string):number|undefined{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return undefined;
 const time=Date.parse(value+'T00:00:00Z');
 if(!Number.isFinite(time)||new Date(time).toISOString().slice(0,10)!==value)return undefined;
 return Math.round((time-BASE)/DAY);
}
export function calendarDate(day:number|undefined){return day===undefined||!Number.isFinite(day)?'Date not recorded':new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(BASE+day*DAY));}
export const DEMO_DATE=calendarDate(SCENARIO_DAY);
export function calendarText(text:string){return text.replace(/\bscenario days\b/gi,'days').replace(/\b(?:scenario\s+)?day(?:\s+|-)(-?\d+)\b/gi,(_,day:string)=>calendarDate(Number(day)));}
export function factDisplay(key:string,value:string|number){return key==='due'?calendarDate(Number(value)):typeof value==='number'?value.toLocaleString('en-US'):calendarText(value);}
