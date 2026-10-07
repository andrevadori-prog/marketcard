create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger cards_set_updated_at
before update on public.cards
for each row execute function public.set_updated_at();

create trigger purchase_requests_set_updated_at
before update on public.purchase_requests
for each row execute function public.set_updated_at();

grant select on public.sets, public.cards to anon, authenticated;
grant insert, update, delete on public.sets, public.cards to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, update on public.purchase_requests to authenticated;
grant select on public.request_items to authenticated;
update storage.buckets set file_size_limit = 4194304 where id = 'card-images';
revoke all on function public.create_profile_for_user() from public;

create or replace function public.create_purchase_request(
  p_customer_name text,
  p_customer_email text,
  p_message text,
  p_card_id uuid,
  p_quantity integer
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_card public.cards%rowtype;
  v_request_id uuid;
  v_remaining integer;
begin
  if p_quantity is null or p_quantity < 1
     or char_length(trim(coalesce(p_customer_name, ''))) < 2
     or char_length(p_customer_name) > 120
     or coalesce(p_customer_email, '') !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
     or char_length(p_customer_email) > 320
     or char_length(coalesce(p_message, '')) > 1000 then
    raise exception 'invalid_request' using errcode = '22023';
  end if;

  select * into v_card
  from public.cards
  where id = p_card_id
  for update;

  if not found or v_card.status <> 'available' or v_card.quantity < p_quantity then
    raise exception 'card_unavailable' using errcode = 'P0001';
  end if;

  v_remaining := v_card.quantity - p_quantity;

  insert into public.purchase_requests(customer_name, customer_email, message)
  values (trim(p_customer_name), lower(trim(p_customer_email)), nullif(trim(p_message), ''))
  returning id into v_request_id;

  insert into public.request_items(request_id, card_id, quantity, price)
  values (v_request_id, v_card.id, p_quantity, v_card.price);

  update public.cards
  set quantity = v_remaining,
      status = case when v_remaining = 0 then 'sold' else 'available' end
  where id = v_card.id;

  return v_request_id;
end;
$$;
revoke all on function public.create_purchase_request(text, text, text, uuid, integer) from public;
grant execute on function public.create_purchase_request(text, text, text, uuid, integer) to anon, authenticated;

create or replace function public.update_purchase_request_status(p_request_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_request public.purchase_requests%rowtype;
  v_item record;
begin
  if not public.is_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  if p_status is null or p_status not in ('new', 'contacted', 'completed', 'cancelled') then
    raise exception 'invalid_status' using errcode = '22023';
  end if;

  select * into v_request
  from public.purchase_requests
  where id = p_request_id
  for update;
  if not found then
    raise exception 'request_not_found' using errcode = 'P0002';
  end if;
  if v_request.status = p_status then
    return;
  end if;
  if v_request.status in ('completed', 'cancelled') then
    raise exception 'request_status_is_terminal' using errcode = '22023';
  end if;

  if p_status = 'cancelled' then
    for v_item in
      select card_id, quantity from public.request_items where request_id = p_request_id
    loop
      update public.cards
      set quantity = quantity + v_item.quantity,
          status = case when status = 'sold' then 'available' else status end
      where id = v_item.card_id;
    end loop;
  end if;

  update public.purchase_requests
  set status = p_status
  where id = p_request_id;
end;
$$;
revoke all on function public.update_purchase_request_status(uuid, text) from public;
grant execute on function public.update_purchase_request_status(uuid, text) to authenticated;
