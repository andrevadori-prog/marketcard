'use client';
import {useState} from 'react';

const labels={new:'Nuova',contacted:'Contattato',completed:'Completata',cancelled:'Annullata'} as const;
type RequestState=keyof typeof labels;

export function RequestStatus({id,status}:{id:string;status:RequestState}){
 const[value,setValue]=useState<RequestState>(status);const[busy,setBusy]=useState(false);const[message,setMessage]=useState('');
 async function update(next:RequestState){if(next===value)return;setBusy(true);setMessage('');try{const response=await fetch(`/api/admin/requests/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:next})});const result=await response.json();if(!response.ok)throw new Error(result.error??'Non è stato possibile aggiornare lo stato.');setValue(next);setMessage('Stato aggiornato.');}catch(error){setMessage(error instanceof Error?error.message:'Non è stato possibile aggiornare lo stato.');}finally{setBusy(false);}}
 const terminal=value==='completed'||value==='cancelled';
 const allowed:RequestState[]=value==='new'?['new','contacted','completed','cancelled']:value==='contacted'?['contacted','completed','cancelled']:[value];
 return <div><label className="grid max-w-xs gap-2 text-sm">Stato richiesta<select disabled={busy||terminal} value={value} onChange={e=>update(e.target.value as RequestState)} className="rounded-xl border border-[#e4e7e2] bg-white px-3 py-3 disabled:opacity-60">{allowed.map(key=><option key={key} value={key}>{labels[key]}</option>)}</select></label><p role="status" aria-live="polite" className="mt-2 text-xs text-[#758078]">{busy?'Aggiornamento…':terminal?'Stato finale':message}</p></div>
}
