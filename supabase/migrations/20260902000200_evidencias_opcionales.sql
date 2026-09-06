create table public.configuracion_funcionalidades (
  clave text primary key,
  habilitada boolean not null default false,
  descripcion text,
  updated_at timestamptz not null default now()
);

insert into public.configuracion_funcionalidades(clave,habilitada,descripcion)
values('CARGA_EVIDENCIAS',true,'Permite adjuntar evidencias a emergencias y solicitudes de kits.')
on conflict(clave) do nothing;

alter table public.configuracion_funcionalidades enable row level security;
create policy funcionalidades_lectura_publica on public.configuracion_funcionalidades
for select to anon, authenticated using (true);
create policy funcionalidades_admin_actualiza on public.configuracion_funcionalidades
for update to authenticated using (public.es_admin_oli()) with check (public.es_admin_oli());

grant select on public.configuracion_funcionalidades to anon, authenticated;
grant update(habilitada) on public.configuracion_funcionalidades to authenticated;

comment on table public.configuracion_funcionalidades is
'Interruptores funcionales. CARGA_EVIDENCIAS=false retira la carga sin alterar solicitudes ni archivos existentes.';

