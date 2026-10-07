import {createClient} from '@/lib/supabase/server';
import {RequestTable} from '@/components/request-table';
import type {PurchaseRequest} from '@/lib/types';

type RequestRow={id:string;customer_name:string;customer_email:string;message:string|null;status:PurchaseRequest['status'];created_at:string;request_items:{quantity:number;price:number;cards:{name:string}|null}[]};
export default async function Requests(){
 const db=await createClient();
 const{data,error}=await db.from('purchase_requests').select('id,customer_name,customer_email,message,status,created_at,request_items(quantity,price,cards(name))').order('created_at',{ascending:false});
 if(error)throw new Error('Richieste temporaneamente non disponibili.');
 const rows:PurchaseRequest[]=((data??[]) as unknown as RequestRow[]).map(r=>({id:r.id,customer_name:r.customer_name,customer_email:r.customer_email,message:r.message,status:r.status,created_at:r.created_at,quantity:Number(r.request_items?.[0]?.quantity??0),price:Number(r.request_items?.[0]?.price??0),card_name:r.request_items?.[0]?.cards?.name??'Carta'}));
 return <main><p className="text-xs font-semibold uppercase tracking-widest text-[#69836f]">Vendite</p><h1 className="mt-2 text-3xl font-semibold">Richieste</h1><RequestTable requests={rows}/></main>
}
