import {PersonaLogo} from '@/components/persona-logo';
import {Suspense} from 'react';
import Workspace from '@/components/workspace';
export default function Page(){return <Suspense fallback={<div className="boot"><PersonaLogo/><h2>Opening your workspace</h2></div>}><Workspace/></Suspense>;}
