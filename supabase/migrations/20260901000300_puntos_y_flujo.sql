create table public.puntos_acopio (
  id uuid primary key default gen_random_uuid(),
  solicitud_origen_id uuid unique references public.solicitudes(id) on delete set null,
  nombre_publico text not null,
  descripcion_publica text,
  direccion_publica text not null,
  region text,
  provincia text,
  distrito text,
  latitud numeric(9,6) not null check (latitud between -90 and 90),
  longitud numeric(9,6) not null check (longitud between -180 and 180),
  horario text,
  contacto_publico text,
  estado public.estado_publicacion not null default 'BORRADOR',
  publicado_desde timestamptz,
  publicado_hasta timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (publicado_hasta is null or publicado_desde is null or publicado_hasta > publicado_desde)
);

create index puntos_acopio_publicos_idx on public.puntos_acopio(estado, publicado_desde, publicado_hasta);
create trigger puntos_acopio_updated_at before update on public.puntos_acopio for each row execute function public.actualizar_updated_at();

create or replace view public.puntos_acopio_publicos as
select id,nombre_publico,descripcion_publica,direccion_publica,region,provincia,distrito,latitud,longitud,horario,contacto_publico,publicado_desde,publicado_hasta
from public.puntos_acopio
where estado = 'PUBLICADO' and (publicado_desde is null or publicado_desde <= now()) and (publicado_hasta is null or publicado_hasta > now());

create or replace function public.cambiar_estado_solicitud(p_solicitud_id uuid, p_estado public.estado_solicitud, p_observacion text default null)
returns public.solicitudes language plpgsql security definer set search_path = '' as $$
declare v_actual public.solicitudes; v_valido boolean;
begin
  if not public.es_trabajador_oli() then raise exception 'No autorizado'; end if;
  select * into v_actual from public.solicitudes where id=p_solicitud_id for update;
  if not found then raise exception 'Solicitud no encontrada'; end if;
  v_valido := case v_actual.estado
    when 'RECIBIDA' then p_estado in ('EN_REVISION','RECHAZADA','CANCELADA')
    when 'EN_REVISION' then p_estado in ('OBSERVADA','APROBADA','RECHAZADA','CANCELADA')
    when 'OBSERVADA' then p_estado in ('EN_REVISION','RECHAZADA','CANCELADA')
    when 'APROBADA' then p_estado in ('ATENDIDA','CERRADA','CANCELADA')
    when 'ATENDIDA' then p_estado = 'CERRADA'
    else false end;
  if not v_valido then raise exception 'Transicion no permitida: % -> %',v_actual.estado,p_estado; end if;
  update public.solicitudes set estado=p_estado, observacion_actual=nullif(trim(p_observacion),'') where id=p_solicitud_id returning * into v_actual;
  return v_actual;
end;
$$;

alter table public.puntos_acopio enable row level security;
create policy puntos_publicos_lectura on public.puntos_acopio for select to anon using (estado='PUBLICADO' and (publicado_desde is null or publicado_desde <= now()) and (publicado_hasta is null or publicado_hasta > now()));
create policy puntos_oli_gestion on public.puntos_acopio for all to authenticated using (public.es_trabajador_oli()) with check (public.es_trabajador_oli());

grant select on public.puntos_acopio, public.puntos_acopio_publicos to anon;
grant select, insert, update, delete on public.puntos_acopio to authenticated;
grant execute on function public.cambiar_estado_solicitud(uuid,public.estado_solicitud,text) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('evidencias','evidencias',false,10485760,array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create policy evidencias_storage_oli_select on storage.objects for select to authenticated using (bucket_id='evidencias' and public.es_trabajador_oli());
create policy evidencias_storage_oli_insert on storage.objects for insert to authenticated with check (bucket_id='evidencias' and public.es_trabajador_oli());
create policy evidencias_storage_oli_delete on storage.objects for delete to authenticated using (bucket_id='evidencias' and public.es_trabajador_oli());

