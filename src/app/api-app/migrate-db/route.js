import {NextResponse} from 'next/server';
export const dynamic='force-dynamic';
export async function GET(){return NextResponse.json({message:'Remote database migrations are disabled. Run reviewed SQL migrations through a protected database administrator connection.'},{status:404});}
export async function POST(){return NextResponse.json({message:'Remote database migrations are disabled. Run reviewed SQL migrations through a protected database administrator connection.'},{status:404});}
