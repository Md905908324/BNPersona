import {NextRequest,NextResponse} from 'next/server';
import {createState} from '@/lib/seed';
import type {Role} from '@/lib/types';
export const dynamic='force-dynamic';
export async function GET(req:NextRequest){const r=req.nextUrl.searchParams.get('role');const role:Role=r==='Relationship manager'||r==='Restricted desk'?r:'Specialist';return NextResponse.json(createState(role),{headers:{'Cache-Control':'no-store'}});}
