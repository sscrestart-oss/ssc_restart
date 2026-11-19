-- Run this AFTER you have set up the authenticator app on the admin page
-- (log in -> Admin -> scan QR -> enter code once).
-- From then on, admin powers work ONLY in a session verified with the 6-digit code,
-- even if someone steals the admin password.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
     and coalesce(auth.jwt()->>'aal', 'aal1') = 'aal2';
$$;
