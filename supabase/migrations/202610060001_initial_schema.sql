create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  role text not null default 'customer' check (role in ('admin','customer')),
  created_at timestamptz not null default now()
);
create table public.sets (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  series text,
  code text,
  release_date date,
  logo_url text,
  created_at timestamptz not null default now()
);
create table public.cards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  set_id uuid references public.sets(id) on delete set null,
  card_number text,
  rarity text,
  language text,
  condition text,
  price numeric(10,2) not null default 0 check (price >= 0),
  quantity integer not null default 0 check (quantity >= 0),
  description text,
  image_url text,
  status text not null default 'available' check (status in ('available','reserved','sold')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.purchase_requests (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (char_length(customer_name) between 2 and 120),
  customer_email text not null check (char_length(customer_email) <= 320),
  message text check (char_length(message) <= 1000),
  status text not null default 'new' check (status in ('new','contacted','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.request_items (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.purchase_requests(id) on delete cascade,
  card_id uuid not null references public.cards(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  price numeric(10,2) not null check (price >= 0)
);
create index cards_name_search_idx on public.cards using gin (to_tsvector('simple', name || ' ' || coalesce(card_number,'') || ' ' || coalesce(description,'')));
create index cards_set_id_idx on public.cards(set_id);
create index cards_status_idx on public.cards(status);
create index cards_price_idx on public.cards(price);
create index cards_created_at_idx on public.cards(created_at desc);
create index requests_status_created_idx on public.purchase_requests(status, created_at desc);
create index request_items_card_id_idx on public.request_items(card_id);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;
create or replace function public.create_profile_for_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, name) values (new.id, coalesce(new.raw_user_meta_data->>'name', new.email));
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.create_profile_for_user();

alter table public.profiles enable row level security;
alter table public.sets enable row level security;
alter table public.cards enable row level security;
alter table public.purchase_requests enable row level security;
alter table public.request_items enable row level security;
create policy "Admins manage profiles" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Public reads sets" on public.sets for select to anon, authenticated using (true);
create policy "Admins manage sets" on public.sets for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Public reads available cards" on public.cards for select to anon, authenticated using ((status = 'available' and quantity > 0) or public.is_admin());
create policy "Admins manage cards" on public.cards for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins read purchase requests" on public.purchase_requests for select to authenticated using (public.is_admin());
create policy "Admins update purchase requests" on public.purchase_requests for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins read request items" on public.request_items for select to authenticated using (public.is_admin());

create or replace function public.create_purchase_request(p_customer_name text, p_customer_email text, p_message text, p_card_id uuid, p_quantity integer)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_card public.cards%rowtype; v_request_id uuid;
begin
  if p_quantity is null or p_quantity < 1 or char_length(trim(p_customer_name)) < 2 or char_length(p_customer_name) > 120 or p_customer_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' or char_length(p_customer_email) > 320 or char_length(coalesce(p_message,'')) > 1000 then
    raise exception 'invalid_request' using errcode = '22023';
  end if;
  select * into v_card from public.cards where id = p_card_id for update;
  if not found or v_card.status <> 'available' or v_card.quantity < p_quantity then
    raise exception 'card_unavailable' using errcode = 'P0001';
  end if;
  insert into public.purchase_requests(customer_name,customer_email,message) values(trim(p_customer_name),lower(trim(p_customer_email)),nullif(trim(p_message),'')) returning id into v_request_id;
  insert into public.request_items(request_id,card_id,quantity,price) values(v_request_id,v_card.id,p_quantity,v_card.price);
  return v_request_id;
end;
$$;
revoke all on function public.create_purchase_request(text,text,text,uuid,integer) from public;
grant execute on function public.create_purchase_request(text,text,text,uuid,integer) to anon, authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('card-images','card-images',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=true,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp'];
create policy "Public reads card images" on storage.objects for select to anon,authenticated using (bucket_id='card-images');
create policy "Admins upload card images" on storage.objects for insert to authenticated with check (bucket_id='card-images' and public.is_admin());
create policy "Admins update card images" on storage.objects for update to authenticated using (bucket_id='card-images' and public.is_admin()) with check (bucket_id='card-images' and public.is_admin());
create policy "Admins delete card images" on storage.objects for delete to authenticated using (bucket_id='card-images' and public.is_admin());
