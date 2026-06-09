
revoke execute on function public.has_role(uuid, public.app_role) from anon, authenticated, public;
grant execute on function public.has_role(uuid, public.app_role) to service_role;
-- allow RLS policies (definer chain) to keep using it via the SQL execution; security definer means
-- the function still works inside policies even without execute grants because policies run as definer.
revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.tg_set_updated_at() from anon, authenticated, public;
