import type {State} from './types';
/** Compatibility aliases only. New records and links always use company slugs. */
export const legacyClientIds:Record<string,string>={northstar:'volvo-group',meridian:'cemex',summit:'lactalis',atlas:'decathlon',harbor:'arkadin',cedar:'ch-robinson',ridgeway:'polygroup',brookfield:'ingram-micro',vale:'airbus',alpine:'sandoz',orion:'ottobock',seabrook:'essity',maple:'amul',redwood:'thom-group',lakeside:'elior-group',helix:'roche',canyon:'babcock-international',oakmont:'fnac-darty',prairie:'fortum',sterling:'maersk',aurelia:'edp',fulton:'alliander',eastgate:'nippon-express',pacific:'motor-fuel-group',solstice:'xpfibre',westbridge:'air-france',clearwater:'boston-consulting-group',evergreen:'loreal',novus:'rtb-house',granite:'dlg-group',restricted:'juniper-infrastructure'};
export function canonicalClientId(id:string){return Object.hasOwn(legacyClientIds,id)?legacyClientIds[id]:id;}
const aliases=Object.keys(legacyClientIds).join('|');
const profilePattern=new RegExp(`\\bprofile-(${aliases})-`,'g');
const routePattern=new RegExp(`/clients/(${aliases})(?=[/?#\\s]|$)`,'g');
export function canonicalClientLocation(path:string,query:Record<string,string|string[]|undefined>){
 const parts=path.split('/');let changed=false;
 if(parts[1]==='clients'&&parts[2]){const next=canonicalClientId(parts[2]);changed=next!==parts[2];parts[2]=next;}
 const params=new URLSearchParams();for(const [key,value]of Object.entries(query)){for(const item of Array.isArray(value)?value:value===undefined?[]:[value]){const next=key==='client'?canonicalClientId(item):item;if(next!==item)changed=true;params.append(key,next);}}
 return changed?parts.join('/')+(params.size?'?'+params.toString():''):null;
}
/** Migrate references together, including evidence IDs inside guide citations.
 * User prose is preserved; only exact record IDs, profile IDs and route links change. */
export function migrateLegacyRecords<T>(value:T):T{
 function visit(item:unknown,key=''):unknown{
  if(Array.isArray(item))return item.map(x=>visit(x,key));
  if(item&&typeof item==='object')return Object.fromEntries(Object.entries(item).map(([k,v])=>[k,visit(v,k)]));
  if(typeof item!=='string')return item;
  let text=(key==='id'||key==='clientId')?canonicalClientId(item):item;
  text=text.replace(profilePattern,(_,old:string)=>`profile-${canonicalClientId(old)}-`).replace(routePattern,(_,old:string)=>`/clients/${canonicalClientId(old)}`);
  return text;
 }
 return visit(value) as T;
}
export function migrateCachedState(state:State){return migrateLegacyRecords(state);}
