-- Restrict API table privileges explicitly. Row-level policies remain the
-- authorization boundary; these grants also prevent unintended operations
-- on projects that still grant all table privileges by default.

revoke all privileges on table public.profiles,
  public.purchase_requests,
  public.request_items
from public, anon, authenticated;

grant select on table public.profiles,
  public.purchase_requests,
  public.request_items
to authenticated;

revoke insert, update, delete on table public.sets, public.cards
from public, anon;

grant select on table public.sets, public.cards to anon, authenticated;
grant insert, update, delete on table public.sets, public.cards to authenticated;

revoke insert, update, delete on table storage.objects
from public, anon;

grant select on table storage.objects to anon, authenticated;
grant insert, update, delete on table storage.objects to authenticated;
