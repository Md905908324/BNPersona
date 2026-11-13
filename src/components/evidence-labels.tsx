'use client';
import {createContext,useContext,useMemo} from 'react';
import type {Client} from '@/lib/types';
const Context=createContext<{labels:Map<string,string>;open:(id:string)=>void}>({labels:new Map(),open:()=>{}});
export function EvidenceLabels({clients,open,children}:{clients:Client[];open:(client:Client,id:string)=>void;children:React.ReactNode}){
 const value=useMemo(()=>({labels:new Map(clients.flatMap(c=>c.sources.map(s=>[s.id,s.title] as const))),open:(id:string)=>{const client=clients.find(c=>c.sources.some(s=>s.id===id));if(client)open(client,id);}}),[clients,open]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useEvidenceLabels(){return useContext(Context);}
