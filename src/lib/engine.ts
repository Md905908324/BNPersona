import {opportunityBrief} from './opportunity';
import {calendarDate,dateFromInput} from './timeline';
import {composeGuide} from './preparation';
import type {Client,Product,Match,Level,Change,FieldKey,Source} from './types';
import {SCENARIO_DAY} from './constants';
// Import this module from the client only via engine-client.ts; seed data stays on the server.
export const money=(n:number,currency='USD')=>new Intl.NumberFormat('en-US',{style:'currency',currency,maximumFractionDigits:0}).format(n);
export const remaining=(c:Client)=>Math.max(0,(c.gross??0)-c.hedged);
export const days=(c:Client)=>c.due===undefined?undefined:c.due-SCENARIO_DAY;
export function interpretProduct(text:string):Product['category']|null{const s=text.toLowerCase();for(const [category,pattern]of Object.entries({ 'Supply chain finance':/supply.chain|receivables financ|supplier financ/, 'Corporate financing':/syndicated|corporate loan|credit facilit/, 'Debt capital markets':/bond|debt capital/, 'Equity capital markets':/ipo|equity capital|listing/, 'M&A advisory':/merger|acquisition|m&a/, 'Interest-rate risk':/interest.rate|floating.rate/, 'Commodity risk':/commodity/, 'Sustainable finance':/sustainab|green financ|transition financ/, 'Securities services':/custody|fund admin|securities servic/})){if(pattern.test(s))return category;}if(/forward|hedg|\bfx\b|currency|foreign exchange/.test(s))return 'FX';if(/letter.? of credit|trade finance|shipment|supplier.*assurance|import finance/.test(s))return 'Trade finance';if(/cash|liquidity|treasury account|balance visibility/.test(s))return 'Cash management';return null;}
export function matchClient(c:Client,p:Product):Match{
 const d=days(c);const stale=SCENARIO_DAY-c.sourceDay>90;const disputed=c.facts.some(f=>f.status==='Disputed'||f.status==='Withdrawn');const sourceMissing=!c.sources.some(s=>s.id===c.sourceId&&s.status==='Verified');
 let reason='';
 const currencies:string[]=p.currencies.toUpperCase().match(/\b[A-Z]{3}\b/g)||[];
 if(stale)reason='Exposure evidence is stale. Reconfirm before outreach.';
 else if(disputed||sourceMissing)reason='Supporting information needs review before outreach.';
 else if(c.category!==p.category&&!c.facts.some(f=>f.status==='Verified'&&String(f.value).toLowerCase().includes(p.category.toLowerCase())))reason='No verified need matching this product category.';
 else if(p.category==='FX'&&(!c.currency||!c.gross))reason='No verified foreign currency exposure.';
 else if(p.category==='FX'&&currencies.length>0&&!currencies.includes(c.currency!))reason='The documented currency is outside this product search.';
 else if(p.category==='FX'&&remaining(c)===0)reason='No remaining unhedged payable is recorded.';
 else if(c.due===undefined)reason='No dated payment or decision. Confirm timing first.';
 else if(d!<0||d!>p.horizon)reason='The decision is outside the selected time horizon.';
 const eligible=!reason;
 const urgency:Level=d===undefined?'Unknown':d<=30?'High':d<=60?'Medium':'Low';
 const recordedInterest=c.category===p.category?c.interest:String(c.facts.find(f=>f.key==='interest'&&f.status==='Verified'&&String(f.value).toLowerCase().includes(p.category.toLowerCase()))?.value||'');
 const acceptance:Level=opportunityBrief(c,p).readiness;
 return {client:c,eligible,reason:reason||(p.category==='FX'?`${c.currency} ${remaining(c).toLocaleString('en-US')} unhedged supplier payments due in ${d} days.`:c.priority),urgency,acceptance,interestStatus:stale||disputed?'Unknown':recordedInterest?'Documented interest':'Inferred product fit',evidence:stale||disputed||sourceMissing?'Needs review':c.sources.some(s=>s.id===c.sourceId&&s.status==='Verified')?'Strong':'Limited',drivers:[c.interest?`Recorded interest: ${c.interest}`:'Verified exposure suggests fit; no direct appetite recorded.',d===undefined?'Payment timing needs confirmation.':`Recorded ${p.category==='FX'?'payment':'review / shipment'} deadline: ${calendarDate(c.due)} (${d} days remaining from ${calendarDate(SCENARIO_DAY)}). This is not a forecast of purchase timing.`,stale?'Evidence requires reconfirmation.':`Source ${c.sourceId} reviewed by ${c.owner}.`],counter:[c.objection||'No unresolved objection is recorded.',...(c.interest?[]:['Interest in purchasing this product is unconfirmed.'])]};
}
export function discover(clients:Client[],p:Product,sort='priority'){const rank:Record<Level,number>={High:0,Medium:1,Low:2,Unknown:3};return clients.map(c=>matchClient(c,p)).sort((a,b)=>Number(b.eligible)-Number(a.eligible)||(sort==='deadline'?(days(a.client)??999)-(days(b.client)??999):rank[a.urgency]-rank[b.urgency]||rank[a.acceptance]-rank[b.acceptance]||(days(a.client)??999)-(days(b.client)??999))||b.client.sourceDay-a.client.sourceDay);}
export function makeGuide(c:Client,p:Product):string{return composeGuide(c,p);}
export function extractChanges(text:string):Change[]{
 const out:Change[]=[];const sentence=(re:RegExp)=>text.split(/(?<=[.!?])\s+|\n/).find(x=>re.test(x))?.trim()||text.slice(0,250);
 const add=(key:FieldKey,label:string,value:string|number,re:RegExp)=>out.push({key,label,value,excerpt:sentence(re),selected:true});
 const amount=/\b(?:MXN|EUR|USD)\s*([\d,]+(?:\.\d+)?)\s*(million|m\b)?/gi;let a;while((a=amount.exec(text))){const n=Number(a[1].replaceAll(',',''))*(a[2]?1e6:1);const around=text.slice(a.index,Math.min(text.length,a.index+90));if(/remain|unhedged/.test(around)&&/hedged/.test(text)&&/\b6\s*million/.test(text)){continue;}if(/(?:has|have|now|is|been).*hedged|hedged\b/i.test(around)&&!/unhedged/i.test(around)){if(!out.some(x=>x.key==='hedged'))add('hedged','Amount hedged',n,/hedged/); }else if(!out.some(x=>x.key==='gross')&&!/remain/.test(around)){add('gross','Gross payable',n,/payable|payment|supplier/);}}
 const hedge=text.match(/(?:MXN|EUR|USD)\s*([\d,]+(?:\.\d+)?)\s*(million|m\b)?[^.\n]{0,35}(?:now been hedged|has been hedged|is now hedged|has now been hedged)/i);if(hedge){const value=Number(hedge[1].replaceAll(',',''))*(hedge[2]?1e6:1);const old=out.find(x=>x.key==='hedged');if(old)old.value=value;else add('hedged','Amount hedged',value,/hedged/);}
 const due=text.match(/(?:scenario\s+)?day\s+(\d{1,3})/i);if(due)add('due','Payment or review date',Number(due[1]),/day/);else {const iso=text.match(/\b(?:due|payable|payment|shipment|review|deadline)[^.\n]{0,45}?(\d{4}-\d{2}-\d{2})\b/i);const value=iso?dateFromInput(iso[1]):undefined;if(value!==undefined&&value>=0)add('due','Payment or review date',value,/due|payable|payment|shipment|review|deadline/i);}
 const pref=sentence(/prefer|please send|one.page|scenario comparison|requests? .*scenario|written summary/i);if(/prefer|please send|one.page|scenario comparison|requests? .*scenario|written summary/i.test(text))add('preference','Communication preference',pref,/prefer|please send|one.page|scenario|written/);
 const interest=sentence(/interested|would like to discuss|want to discuss/i);if(/interested|would like to discuss|want to discuss/i.test(text))add('interest','Recorded interest',interest,/interested|would like to discuss|want to discuss/);
 const sentences=text.split(/(?<=[.!?])\s+|\n/).map(x=>x.trim()).filter(Boolean);
 const patterns:[FieldKey,string,RegExp][]=[['reporting','Reporting requirement',/customi[sz]ed report|report per data point|reporting pack/i],['reporting','Historical and inflation-adjusted analysis',/inflation.adjusted|\bYOY\b|year.over.year|five.year|5 year/i],['comparison','Competitor financial comparison',/competitor|peer group|benchmark/i],['analysisStyle','Preferred chart and presentation style',/basic charts|simple.*chart|line.*bar.*pie|calculations.*appendix/i],['observation','Meeting observation — confirm with client',/meeting went|shows sign|seemed|appeared|distaste/i],['implementation','Implementation requirement',/ERP replacement|existing.*spreadsheet|repeatable.*template/i]];
 for(const [key,label,pattern]of patterns){const excerpt=sentences.find(x=>pattern.test(x));if(excerpt)out.push({key,label,value:key==='observation'?'Meeting observation — confirm with client: '+excerpt:excerpt,excerpt,selected:true});}
 return out.filter(x=>typeof x.value!=='number'||(Number.isFinite(x.value)&&x.value>=0));
}
export function applyChanges(c:Client,source:Source,changes:Change[]):Client{
 const next=structuredClone(c);const chosen=changes.filter(x=>x.selected);for(const ch of chosen){if(typeof ch.value==='number'&&(!Number.isFinite(ch.value)||ch.value<0))throw new Error('Amounts and payment dates must be valid and non-negative.');if(ch.key==='gross')next.gross=Number(ch.value);else if(ch.key==='hedged')next.hedged=Number(ch.value);else if(ch.key==='due')next.due=Number(ch.value);else if(['preference','priority','interest','objection'].includes(ch.key))(next as unknown as Record<string,unknown>)[ch.key]=String(ch.value);const fact={key:ch.key,label:ch.label,value:ch.value,group:ch.group,sourceId:source.id,status:'Verified' as const};next.facts=[...next.facts.filter(f=>f.key!==ch.key||(!['gross','hedged','due'].includes(ch.key)&&f.label!==ch.label)),fact];}
 if(next.hedged>(next.gross??0)&&next.gross!==undefined)throw new Error('Hedged amount cannot exceed the gross payable.');
 for(const key of ['preference','priority','interest','objection'] as const){const items=chosen.filter(ch=>ch.key===key);if(items.length)(next as unknown as Record<string,unknown>)[key]=items.map(ch=>String(ch.value)).join('; ');}
 next.version++;if(chosen.some(x=>['gross','hedged','due'].includes(x.key))) {next.sourceDay=source.day;next.sourceId=source.id;}
 next.sources.push({...source,status:'Verified',reviewer:'Authorized demo banker'});next.history.push({number:next.version,day:source.day,note:`Reviewed ${chosen.length} field updates from ${source.id}`,reviewer:'Authorized demo banker',facts:structuredClone(next.facts)});return next;
}
