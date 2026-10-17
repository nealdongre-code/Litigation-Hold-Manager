import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../../chatgpt-auth';
import { calendar } from '../../../lib/domain.mjs';
export const dynamic='force-dynamic';
export async function GET(req:Request){const u=await getChatGPTUser();if(!u)return new Response('Sign in required',{status:401});const r=await env.DB!.prepare('SELECT data FROM workspaces WHERE owner=?').bind('legal-workspace').first<{data:string}>();const id=new URL(req.url).searchParams.get('id');const h=r&&JSON.parse(r.data).holds.find((x:any)=>x.id===id&&x.status==='Active');if(!h)return new Response('Active hold not found',{status:404});return new Response(calendar(h,new URL(req.url).origin),{headers:{'Content-Type':'text/calendar; charset=utf-8','Content-Disposition':'attachment; filename="hold-review.ics"','Cache-Control':'no-store'}});}
