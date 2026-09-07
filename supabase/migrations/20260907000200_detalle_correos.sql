-- Conservar el detalle enviado por el solicitante al crear el correo, sin evidencias
-- privadas, asignaciones internas ni enlaces administrativos.
create function public.agregar_detalle_correo()
returns trigger language plpgsql security definer set search_path='' as $$
declare s public.solicitudes;
begin
  select * into s from public.solicitudes where id=new.solicitud_id;
  if found and new.plantilla in ('solicitud_recibida','cambio_estado') then
    new.datos := jsonb_build_object(
      'codigo',s.codigo,'nombre',s.nombre_solicitante,'tipo',s.tipo,
      'asunto',s.asunto,'descripcion',s.descripcion,
      'region',s.region,'provincia',s.provincia,'distrito',s.distrito,
      'direccion',s.direccion,'detalle',s.datos,'estado',s.estado
    ) || new.datos;
  end if;
  return new;
end; $$;
create trigger correo_con_detalle before insert on public.correos_salida
for each row execute function public.agregar_detalle_correo();
-- No reenviar ni modificar el historial de correos enviados o cancelados.
