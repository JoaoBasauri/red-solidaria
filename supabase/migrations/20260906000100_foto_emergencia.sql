-- Solo la fotografía elegida por OLI es publicable; las evidencias permanecen privadas.
create table public.emergencia_fotos (
  solicitud_id uuid primary key references public.solicitudes(id) on delete cascade,
  storage_path text not null unique,
  publicada_por uuid not null references public.profiles(id),
  updated_at timestamptz not null default now()
);
alter table public.emergencia_fotos enable row level security;
grant select on public.emergencia_fotos to authenticated;
create policy foto_lectura_oli on public.emergencia_fotos for select to authenticated using(public.es_trabajador_oli());

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('emergencia-fotos','emergencia-fotos',false,5242880,array['image/jpeg']);
create policy foto_subida_oli on storage.objects for insert to authenticated with check (
  bucket_id='emergencia-fotos' and public.puede_gestionar_solicitudes()
  and exists(select 1 from public.solicitudes s where s.id::text=(storage.foldername(name))[1]
    and s.tipo='EMERGENCIA' and s.estado in ('EN_REVISION','APROBADA'))
);

create or replace function public.publicar_foto_emergencia(p_solicitud_id uuid,p_path text,p_aprobar boolean default false,p_observacion text default null)
returns void language plpgsql security definer set search_path='' as $$
declare v_s public.solicitudes;
begin
  if not public.puede_gestionar_solicitudes() then raise exception 'No autorizado'; end if;
  select * into v_s from public.solicitudes where id=p_solicitud_id and tipo='EMERGENCIA' for update;
  if not found or v_s.estado not in ('EN_REVISION','APROBADA') then raise exception 'Estado de emergencia no válido'; end if;
  if not p_aprobar and v_s.estado<>'APROBADA' then raise exception 'La emergencia debe estar aprobada'; end if;
  if split_part(p_path,'/',1)<>p_solicitud_id::text or not exists(
    select 1 from storage.objects where bucket_id='emergencia-fotos' and name=p_path
  ) then raise exception 'Fotografía no válida para esta emergencia'; end if;
  insert into public.emergencia_fotos(solicitud_id,storage_path,publicada_por)
  values(p_solicitud_id,p_path,auth.uid()) on conflict(solicitud_id) do update
    set storage_path=excluded.storage_path,publicada_por=auth.uid(),updated_at=now();
  if p_aprobar then perform public.cambiar_estado_solicitud(p_solicitud_id,'APROBADA',p_observacion); end if;
end; $$;
revoke all on function public.publicar_foto_emergencia(uuid,text,boolean,text) from public,anon;
grant execute on function public.publicar_foto_emergencia(uuid,text,boolean,text) to authenticated;

create or replace view public.emergencias_publicas as
select s.id, 'Emergencia en ' || coalesce(nullif(s.distrito,''),nullif(s.region,''),'zona por confirmar') as titulo,
  s.region,s.provincia,s.distrito,s.estado,s.created_at,
  round(s.latitud,2) as latitud,round(s.longitud,2) as longitud,
  e.tipo_emergencia,e.poblacion_afectada,
  s.codigo like 'RS-DEMO-%' as es_demo, f.storage_path as foto_path
from public.solicitudes s join public.solicitud_emergencia e on e.solicitud_id=s.id
left join public.emergencia_fotos f on f.solicitud_id=s.id
where s.tipo='EMERGENCIA' and s.estado='APROBADA';
create policy foto_lectura on storage.objects for select to anon,authenticated using (
  bucket_id='emergencia-fotos' and (public.es_trabajador_oli() or exists(
    select 1 from public.emergencias_publicas e where e.foto_path=name
  ))
);

-- También impedir aprobaciones sin foto desde clientes antiguos o llamadas directas.
-- No modifica las emergencias que ya estaban aprobadas antes de esta migración.
create function public.validar_foto_al_aprobar_emergencia()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  if new.tipo='EMERGENCIA' and new.estado='APROBADA' and old.estado is distinct from new.estado
    and not exists(select 1 from public.emergencia_fotos where solicitud_id=new.id) then
    raise exception 'Carga y confirma una foto pública antes de aprobar la emergencia';
  end if;
  return new;
end; $$;
create trigger emergencia_requiere_foto before update of estado on public.solicitudes
for each row execute function public.validar_foto_al_aprobar_emergencia();
