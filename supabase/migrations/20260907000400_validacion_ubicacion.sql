-- Aplicar solo a nuevas solicitudes; no altera solicitudes históricas ni demos.
create function public.validar_nueva_solicitud()
returns trigger language plpgsql set search_path='' as $$
begin
  if new.nombre_solicitante is null or length(trim(new.nombre_solicitante))<2
    or new.descripcion is null or length(trim(new.descripcion))<5
    or new.consentimiento_privacidad is distinct from true then
    raise exception 'Nombre, descripción o consentimiento inválidos';
  end if;
  if new.tipo in ('EMERGENCIA','PUNTO_ACOPIO') and
    (new.latitud is null or new.longitud is null or new.latitud not between -90 and 90 or new.longitud not between -180 and 180) then
    raise exception 'Selecciona una ubicación válida en el mapa';
  end if;
  if new.tipo='PUNTO_ACOPIO' and nullif(trim(new.direccion),'') is null then
    raise exception 'Ingresa la dirección del punto de acopio';
  end if;
  return new;
end; $$;
create trigger solicitud_validacion_servidor before insert on public.solicitudes
for each row execute function public.validar_nueva_solicitud();
