create or replace function public.puede_gestionar_solicitudes()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles p where p.id=auth.uid() and p.activo and p.rol in ('ADMIN','GESTOR'));
$$;

drop policy if exists solicitudes_oli on public.solicitudes;
create policy solicitudes_oli_lectura on public.solicitudes for select to authenticated using(public.es_trabajador_oli());
revoke insert, update, delete on public.solicitudes from authenticated;
grant select on public.solicitudes to authenticated;

create or replace function public.cambiar_estado_solicitud(p_solicitud_id uuid,p_estado public.estado_solicitud,p_observacion text default null)
returns public.solicitudes language plpgsql security definer set search_path='' as $$
declare v_actual public.solicitudes; v_valido boolean;
begin
  if not public.puede_gestionar_solicitudes() then raise exception 'No autorizado para gestionar solicitudes'; end if;
  select * into v_actual from public.solicitudes where id=p_solicitud_id for update;
  if not found then raise exception 'Solicitud no encontrada'; end if;
  v_valido:=case v_actual.estado
    when 'RECIBIDA' then p_estado in ('EN_REVISION','RECHAZADA','CANCELADA')
    when 'EN_REVISION' then p_estado in ('OBSERVADA','APROBADA','RECHAZADA','CANCELADA')
    when 'OBSERVADA' then p_estado in ('EN_REVISION','RECHAZADA','CANCELADA')
    when 'APROBADA' then p_estado in ('ATENDIDA','CERRADA','CANCELADA')
    when 'ATENDIDA' then p_estado='CERRADA'
    else false end;
  if not v_valido then raise exception 'Transicion no permitida: % -> %',v_actual.estado,p_estado; end if;
  update public.solicitudes set estado=p_estado,observacion_actual=nullif(trim(p_observacion),'')
  where id=p_solicitud_id returning * into v_actual;
  return v_actual;
end; $$;

create or replace function public.asignar_solicitud(p_solicitud_id uuid,p_asignado_a uuid)
returns public.solicitudes language plpgsql security definer set search_path='' as $$
declare v_resultado public.solicitudes;
begin
  if not public.puede_gestionar_solicitudes() then raise exception 'No autorizado para asignar solicitudes'; end if;
  if p_asignado_a is not null and not exists(select 1 from public.profiles where id=p_asignado_a and activo) then
    raise exception 'El trabajador seleccionado no esta activo';
  end if;
  update public.solicitudes set asignado_a=p_asignado_a where id=p_solicitud_id returning * into v_resultado;
  if not found then raise exception 'Solicitud no encontrada'; end if;
  return v_resultado;
end; $$;

create or replace function public.publicar_punto_acopio(p_solicitud_id uuid,p_contacto_publico text default null)
returns public.puntos_acopio language plpgsql security definer set search_path='' as $$
declare v_s public.solicitudes; v_d public.solicitud_punto_acopio; v_p public.puntos_acopio;
begin
  if not public.puede_gestionar_solicitudes() then raise exception 'No autorizado para publicar puntos'; end if;
  select * into v_s from public.solicitudes where id=p_solicitud_id and tipo='PUNTO_ACOPIO' for update;
  if not found then raise exception 'Solicitud de punto no encontrada'; end if;
  if v_s.estado not in ('APROBADA','ATENDIDA') then raise exception 'La solicitud debe estar aprobada'; end if;
  select * into v_d from public.solicitud_punto_acopio where solicitud_id=p_solicitud_id;
  insert into public.puntos_acopio(solicitud_origen_id,nombre_publico,descripcion_publica,direccion_publica,region,provincia,distrito,
    latitud,longitud,horario,contacto_publico,estado,publicado_desde,created_by)
  values(v_s.id,v_d.nombre_propuesto,v_s.descripcion,v_s.direccion,v_s.region,v_s.provincia,v_s.distrito,
    v_s.latitud,v_s.longitud,v_d.horario_propuesto,nullif(trim(p_contacto_publico),''),'PUBLICADO',now(),auth.uid())
  on conflict(solicitud_origen_id) do update set nombre_publico=excluded.nombre_publico,descripcion_publica=excluded.descripcion_publica,
    direccion_publica=excluded.direccion_publica,region=excluded.region,provincia=excluded.provincia,distrito=excluded.distrito,
    latitud=excluded.latitud,longitud=excluded.longitud,horario=excluded.horario,contacto_publico=excluded.contacto_publico,
    estado='PUBLICADO',publicado_desde=coalesce(public.puntos_acopio.publicado_desde,now()),updated_at=now()
  returning * into v_p;
  return v_p;
end; $$;

drop policy if exists puntos_oli_gestion on public.puntos_acopio;
create policy puntos_oli_lectura on public.puntos_acopio for select to authenticated using(public.es_trabajador_oli());
create policy puntos_oli_escritura on public.puntos_acopio for all to authenticated
using(public.puede_gestionar_solicitudes()) with check(public.puede_gestionar_solicitudes());

grant execute on function public.puede_gestionar_solicitudes() to authenticated;
grant execute on function public.asignar_solicitud(uuid,uuid) to authenticated;
grant execute on function public.publicar_punto_acopio(uuid,text) to authenticated;

