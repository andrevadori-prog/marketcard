'use client';import {LogOut} from 'lucide-react';import {createClient} from '@/lib/supabase/browser';
export function AdminLogout(){return <button onClick={async()=>{await createClient().auth.signOut();window.location.href='/admin/login';}} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#758078] hover:bg-[#f2f5f1]"><LogOut size={17}/> Esci</button>}
