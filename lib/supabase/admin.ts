import {createClient,isSupabaseConfigured} from './server';import {isAdminRole} from '@/lib/auth';
export async function requireAdmin(){if(!isSupabaseConfigured())return null;const db=await createClient();const{data:{user}}=await db.auth.getUser();if(!user)return null;const{data}=await db.from('profiles').select('role').eq('id',user.id).single();return isAdminRole(data?.role)?db:null;}
