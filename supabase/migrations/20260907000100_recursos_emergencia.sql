-- Requiere 20260906000100_foto_emergencia.sql. No convierte solicitudes en resultados.
alter table public.emergencia_fotos add column recursos_necesarios text[] not null default '{}';

create function public.publicar_emergencia(p_solicitud_id uuid,p_path text,p_recursos text[],p_aprobar boolean default false,p_observacion text default null)
returns void language plpgsql security definer set search_path='' as $$
declare v_s public.solicitudes; v_recursos text[];
begin
  if not public.puede_gestionar_solicitudes() then raise exception 'No autorizado'; end if;
  if p_recursos is null or cardinality(p_recursos) not between 1 and 20
    or array_ndims(p_recursos)<>1 or exists(
      select 1 from unnest(p_recursos) r where r is null or length(trim(r)) not between 1 and 150
    ) then raise exception 'Ingresa entre 1 y 20 recursos, de hasta 150 caracteres cada uno'; end if;
  select array_agg(trim(r) order by pos) into v_recursos from unnest(p_recursos) with ordinality as t(r,pos);
  select * into v_s from public.solicitudes where id=p_solicitud_id and tipo='EMERGENCIA' for update;
  if not found or v_s.estado not in ('EN_REVISION','APROBADA') then raise exception 'Estado de emergencia no válido'; end if;
  if not p_aprobar and v_s.estado<>'APROBADA' then raise exception 'La emergencia debe estar aprobada'; end if;
  if p_path is null or split_part(p_path,'/',1)<>p_solicitud_id::text or not exists(
    select 1 from storage.objects where bucket_id='emergencia-fotos' and name=p_path
  ) then raise exception 'Fotografía no válida para esta emergencia'; end if;
  insert into public.emergencia_fotos(solicitud_id,storage_path,publicada_por,recursos_necesarios)
  values(p_solicitud_id,p_path,auth.uid(),v_recursos) on conflict(solicitud_id) do update
    set storage_path=excluded.storage_path,recursos_necesarios=excluded.recursos_necesarios,
        publicada_por=auth.uid(),updated_at=now();
  if p_aprobar then perform public.cambiar_estado_solicitud(p_solicitud_id,'APROBADA',p_observacion); end if;
end; $$;
revoke all on function public.publicar_emergencia(uuid,text,text[],boolean,text) from public,anon;
grant execute on function public.publicar_emergencia(uuid,text,text[],boolean,text) to authenticated;
-- El cliente anterior no debe omitir los recursos obligatorios.
revoke execute on function public.publicar_foto_emergencia(uuid,text,boolean,text) from authenticated;

create or replace function public.validar_foto_al_aprobar_emergencia()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  if new.tipo='EMERGENCIA' and new.estado='APROBADA' and old.estado is distinct from new.estado
    and not exists(select 1 from public.emergencia_fotos where solicitud_id=new.id and cardinality(recursos_necesarios)>0) then
    raise exception 'Carga una foto pública e ingresa los recursos necesarios antes de aprobar';
  end if;
  return new;
end; $$;

create or replace view public.emergencias_publicas as
select s.id, 'Emergencia en ' || coalesce(nullif(s.distrito,''),nullif(s.region,''),'zona por confirmar') as titulo,
  s.region,s.provincia,s.distrito,s.estado,s.created_at,
  round(s.latitud,2) as latitud,round(s.longitud,2) as longitud,
  e.tipo_emergencia,e.poblacion_afectada,
  s.codigo like 'RS-DEMO-%' as es_demo, f.storage_path as foto_path,
  coalesce(f.recursos_necesarios,'{}'::text[]) as recursos_necesarios
from public.solicitudes s join public.solicitud_emergencia e on e.solicitud_id=s.id
left join public.emergencia_fotos f on f.solicitud_id=s.id
where s.tipo='EMERGENCIA' and s.estado='APROBADA';
