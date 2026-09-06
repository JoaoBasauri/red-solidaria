create table if not exists public.notificacion_lecturas (
  notificacion_id bigint not null references public.notificaciones_oli(id) on delete cascade,
  usuario_id uuid not null references public.profiles(id) on delete cascade,
  leida_at timestamptz not null default now(),
  primary key (notificacion_id, usuario_id)
);

alter table public.notificacion_lecturas enable row level security;

drop policy if exists lecturas_propias_select on public.notificacion_lecturas;
drop policy if exists lecturas_propias_insert on public.notificacion_lecturas;
drop policy if exists lecturas_propias_update on public.notificacion_lecturas;

create policy lecturas_propias_select on public.notificacion_lecturas
for select to authenticated using (usuario_id=auth.uid());
create policy lecturas_propias_insert on public.notificacion_lecturas
for insert to authenticated with check (usuario_id=auth.uid());
create policy lecturas_propias_update on public.notificacion_lecturas
for update to authenticated using (usuario_id=auth.uid()) with check (usuario_id=auth.uid());

grant select,insert,update on public.notificacion_lecturas to authenticated;
grant select on public.notificaciones_oli to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname='supabase_realtime' and schemaname='public' and tablename='notificaciones_oli'
  ) then
    alter publication supabase_realtime add table public.notificaciones_oli;
  end if;
end $$;

