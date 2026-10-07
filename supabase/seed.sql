insert into public.sets(name,series,code,release_date) values
('Fiamme Oscure','Scarlatto e Violetto','OBF','2023-08-11'),
('Pokemon 151','Scarlatto e Violetto','MEW','2023-09-22'),
('Zenit Regale','Spada e Scudo','CRZ','2023-01-20')
on conflict(name) do nothing;
insert into public.cards(name,set_id,card_number,rarity,language,condition,price,quantity,description,image_url,status)
select d.name,s.id,d.card_number,d.rarity,d.language,d.condition,d.price,d.quantity,d.description,'/demo-card.svg',case when d.quantity=0 then 'sold' else 'available' end
from (values
('Charizard','Fiamme Oscure','006/197','Illustrazione speciale','IT','Near Mint',189.90,1,'Carta demo: Charizard in ottime condizioni.'),
('Pikachu','Pokemon 151','025/165','Illustrazione rara','IT','Near Mint',24.50,3,'Carta demo Pikachu.'),
('Gengar','Zenit Regale','TG06/TG30','Galleria Galar','EN','Excellent',42.00,1,'Carta demo Gengar.'),
('Mew ex','Pokemon 151','205/165','Special Illustration Rare','EN','Near Mint',89.00,2,'Carta demo Mew ex.'),
('Eevee','Pokemon 151','188/193','Illustrazione rara','IT','Near Mint',18.00,4,'Carta demo Eevee.'),
('Snorlax','Pokemon 151','143/165','Illustrazione rara','IT','Near Mint',15.00,2,'Carta demo Snorlax.'),
('Dragonite','Fiamme Oscure','081/078','Secret rare','EN','Near Mint',34.90,1,'Carta demo Dragonite.'),
('Mewtwo','Zenit Regale','072/078','Ultra rara','IT','Good',12.50,0,'Carta demo Mewtwo esaurita.'),
('Umbreon V','Fiamme Oscure','189/203','Illustrazione alternativa','EN','Excellent',145.00,1,'Carta demo Umbreon.'),
('Gardevoir ex','Zenit Regale','086/163','Ultra rara','IT','Excellent',9.90,3,'Carta demo Gardevoir.')
) as d(name,set_name,card_number,rarity,language,condition,price,quantity,description)
join public.sets s on s.name=d.set_name
where not exists(select 1 from public.cards c where c.name=d.name and c.set_id=s.id and c.card_number=d.card_number);
