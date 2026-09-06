-- PostgREST necesita USAGE en el esquema además de permisos sobre cada tabla.
grant usage on schema public to anon, authenticated, service_role;

grant select on table public.profiles to authenticated;
grant execute on function public.es_trabajador_oli() to authenticated;
grant execute on function public.es_admin_oli() to authenticated;
grant execute on function public.puede_gestionar_solicitudes() to authenticated;

