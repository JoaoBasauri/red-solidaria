-- Las Edge Functions administrativas usan service_role para gestionar perfiles.
grant select, insert, update, delete on table public.profiles to service_role;
