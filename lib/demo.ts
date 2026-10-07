import type { Card } from './types';
export function shouldUseDemoData(isSupabaseConfigured: boolean, nodeEnv = process.env.NODE_ENV) {
  return !isSupabaseConfigured && nodeEnv !== 'production';
}
const seeds = [
['Charizard','Fiamme Oscure','006/197','Illustrazione speciale','IT','Near Mint',189.9,1,'Una carta iconica in condizioni eccellenti.','#f27c49'],
['Pikachu','151','025/165','Illustrazione rara','IT','Near Mint',24.5,3,'Il compagno più amato, dal set 151.','#f5c84c'],
['Gengar','Zenit Regale','TG06/TG30','Galleria Galar','EN','Excellent',42,1,'Illustrazione suggestiva della galleria.','#7664a8'],
['Mew ex','151','205/165','Special Illustration Rare','EN','Near Mint',89,2,'Mew ex dalla collezione Scarlet & Violet 151.','#ee8cab'],
['Umbreon V','Cieli Evolutivi','189/203','Illustrazione alternativa','EN','Excellent',145,1,'Una delle illustrazioni più ricercate del set.','#74809b'],
['Eevee','Evoluzioni a Paldea','188/193','Illustrazione rara','IT','Near Mint',18,4,'Eevee in una scena luminosa e colorata.','#c99b5c'],
['Mewtwo','Pokemon GO','072/078','Ultra rara','IT','Good',12.5,2,'Mewtwo in versione VSTAR.','#7c83c1'],
['Dragonite','Pokemon GO','081/078','Secret rare','EN','Near Mint',34.9,1,'Dragonite VSTAR fuori numerazione.','#60a5a6'],
['Gardevoir ex','Stili di Lotta','086/163','Ultra rara','IT','Excellent',9.9,3,'Carta in ottimo stato, ben conservata.','#cd7ca4'],
['Snorlax','151','143/165','Illustrazione rara','IT','Near Mint',15,2,'Un classico del Pokédex in una scena rilassata.','#8ab1a1']
] as const;
function art(name:string,color:string,index:number){const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 660"><defs><linearGradient id="g" x2=".8" y2="1"><stop stop-color="${color}"/><stop offset="1" stop-color="#171a22"/></linearGradient><radialGradient id="r"><stop stop-color="#fff" stop-opacity=".38"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="480" height="660" rx="30" fill="#f6f3ec"/><rect x="20" y="20" width="440" height="620" rx="24" fill="url(#g)"/><circle cx="240" cy="310" r="188" fill="url(#r)"/><path d="M65 430 Q170 ${260+index*7} 270 355 T420 270 L420 610 65 610Z" fill="#101827" opacity=".38"/><circle cx="240" cy="288" r="83" fill="#fff" opacity=".13"/><text x="240" y="305" text-anchor="middle" font-family="Arial" font-size="76" font-weight="700" fill="#fff">${name.slice(0,1)}</text><rect x="40" y="40" width="400" height="48" rx="14" fill="#fff" opacity=".18"/><text x="60" y="72" font-family="Arial" font-size="22" fill="#fff">POKÉMON</text><text x="60" y="568" font-family="Arial" font-size="28" font-weight="700" fill="#fff">${name}</text><text x="60" y="602" font-family="Arial" font-size="17" fill="#fff" opacity=".85">DEMO ART · ${String(index+1).padStart(3,'0')}</text></svg>`;return `data:image/svg+xml,${encodeURIComponent(svg)}`;}
export const demoCards:Card[]=seeds.map((s,i)=>({id:`demo-${i+1}`,name:s[0],set_name:s[1],card_number:s[2],rarity:s[3],language:s[4],condition:s[5],price:s[6],quantity:s[7],description:s[8],image_url:art(s[0],s[9],i),status:s[7]>0?'available':'sold',created_at:new Date(Date.now()-i*86400000).toISOString()}));
