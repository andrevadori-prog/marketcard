export function canRequestPurchase(card:{status:string;quantity:number},quantity:number):boolean{return Number.isInteger(quantity)&&quantity>0&&card.status==='available'&&quantity<=card.quantity;}
