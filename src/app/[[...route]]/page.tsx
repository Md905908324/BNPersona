import {PersonaLogo} from '@/components/persona-logo';
import {Suspense} from 'react';
import Workspace from '@/components/workspace';
import {permanentRedirect} from 'next/navigation';
import {canonicalClientLocation} from '@/lib/client-identities';
export default async function Page({params,searchParams}:{params:Promise<{route?:string[]}>;searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const [route,query]=await Promise.all([params,searchParams]);const location=canonicalClientLocation('/'+(route.route||[]).join('/'),query);if(location)permanentRedirect(location);
 return <Suspense fallback={<div className="boot"><PersonaLogo/><h2>Opening your workspace</h2></div>}><Workspace/></Suspense>;
}
