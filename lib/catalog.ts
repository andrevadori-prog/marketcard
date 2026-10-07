import type {Card} from './types';

export type CatalogFilters={query?:string;set?:string;rarity?:string;language?:string;condition?:string;availability?:'available'|'unavailable'|'all'|'';min?:string;max?:string;sort?:'recent'|'price-asc'|'price-desc'|'name'};

export function filterCards(cards:Card[],filters:CatalogFilters):Card[]{
 const{query='',set='',rarity='',language='',condition='',availability='available',min='',max='',sort='recent'}=filters;
 return cards.filter(card=>
  `${card.name} ${card.card_number} ${card.set_name}`.toLowerCase().includes(query.toLowerCase())&&
  (!set||card.set_name===set)&&(!rarity||card.rarity===rarity)&&(!language||card.language===language)&&(!condition||card.condition===condition)&&
  (!min||card.price>=Number(min))&&(!max||card.price<=Number(max))&&
  (availability===''||availability==='all'||(availability==='available'?card.status==='available'&&card.quantity>0:card.status!=='available'||card.quantity===0))
 ).sort((a,b)=>sort==='price-asc'?a.price-b.price:sort==='price-desc'?b.price-a.price:sort==='name'?a.name.localeCompare(b.name):b.created_at.localeCompare(a.created_at));
}
