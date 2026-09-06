create table public.solicitud_emergencia (
  solicitud_id uuid primary key references public.solicitudes(id) on delete cascade,
  tipo_emergencia text not null,
  fecha_emergencia date not null,
  poblacion_afectada integer not null check (poblacion_afectada > 0),
  necesidades_urgentes text,
  created_at timestamptz not null default now()
);

create table public.solicitud_kit (
  solicitud_id uuid primary key references public.solicitudes(id) on delete cascade,
  tipo_kit text not null,
  cantidad_solicitada integer not null check (cantidad_solicitada > 0),
  poblacion_beneficiaria integer not null check (poblacion_beneficiaria > 0),
  fecha_necesidad date not null,
  condiciones_especiales text,
  created_at timestamptz not null default now()
);

create table public.oferta_recursos (
  solicitud_id uuid primary key references public.solicitudes(id) on delete cascade,
  tipo_recurso text not null,
  descripcion_recurso text not null,
  cantidad numeric(14,2) check (cantidad is null or cantidad > 0),
  unidad text,
  disponibilidad_desde date,
  disponibilidad_hasta date,
  created_at timestamptz not null default now(),
  check (disponibilidad_hasta is null or disponibilidad_desde is null or disponibilidad_hasta >= disponibilidad_desde)
);

create table public.solicitud_aliado (
  solicitud_id uuid primary key references public.solicitudes(id) on delete cascade,
  tipo_aliado text not null,
  nombre_organizacion text not null,
  cobertura text not null,
  capacidades text not null,
  sitio_web text,
  created_at timestamptz not null default now()
);

create table public.solicitud_voluntario (
  solicitud_id uuid primary key references public.solicitudes(id) on delete cascade,
  disponibilidad text not null,
  habilidades text not null,
  zona_preferida text not null,
  fecha_nacimiento date,
  created_at timestamptz not null default now()
);

create table public.solicitud_punto_acopio (
  solicitud_id uuid primary key references public.solicitudes(id) on delete cascade,
  nombre_propuesto text not null,
  responsable_nombre text not null,
  responsable_telefono text not null,
  horario_propuesto text not null,
  fecha_inicio date,
  fecha_fin date,
  capacidad_descripcion text,
  created_at timestamptz not null default now(),
  check (fecha_fin is null or fecha_inicio is null or fecha_fin >= fecha_inicio)
);

alter table public.solicitud_emergencia enable row level security;
alter table public.solicitud_kit enable row level security;
alter table public.oferta_recursos enable row level security;
alter table public.solicitud_aliado enable row level security;
alter table public.solicitud_voluntario enable row level security;
alter table public.solicitud_punto_acopio enable row level security;

create policy emergencia_oli on public.solicitud_emergencia for select to authenticated using (public.es_trabajador_oli());
create policy kit_oli on public.solicitud_kit for select to authenticated using (public.es_trabajador_oli());
create policy recursos_oli on public.oferta_recursos for select to authenticated using (public.es_trabajador_oli());
create policy aliado_oli on public.solicitud_aliado for select to authenticated using (public.es_trabajador_oli());
create policy voluntario_oli on public.solicitud_voluntario for select to authenticated using (public.es_trabajador_oli());
create policy punto_solicitud_oli on public.solicitud_punto_acopio for select to authenticated using (public.es_trabajador_oli());

grant select on public.solicitud_emergencia, public.solicitud_kit, public.oferta_recursos,
  public.solicitud_aliado, public.solicitud_voluntario, public.solicitud_punto_acopio to authenticated;
revoke all on public.solicitud_emergencia, public.solicitud_kit, public.oferta_recursos,
  public.solicitud_aliado, public.solicitud_voluntario, public.solicitud_punto_acopio from anon;

create or replace function public.crear_solicitud_publica(
  p_tipo public.tipo_solicitud, p_nombre text, p_email text, p_telefono text,
  p_asunto text, p_descripcion text, p_region text default null, p_provincia text default null,
  p_distrito text default null, p_direccion text default null, p_latitud numeric default null,
  p_longitud numeric default null, p_datos jsonb default '{}'::jsonb,
  p_consentimiento boolean default false
) returns table(id uuid, codigo text)
language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_codigo text;
begin
  if length(trim(p_nombre)) < 2 or length(trim(p_descripcion)) < 5 or not p_consentimiento then
    raise exception 'Datos obligatorios o consentimiento invalidos';
  end if;
  if p_email is null or p_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
    raise exception 'Correo electronico invalido';
  end if;
  if p_tipo = 'PUNTO_ACOPIO' and (p_latitud is null or p_longitud is null or nullif(trim(p_direccion),'') is null) then
    raise exception 'El punto de acopio requiere direccion y ubicacion seleccionada en el mapa';
  end if;

  insert into public.solicitudes(tipo,nombre_solicitante,email_solicitante,telefono_solicitante,asunto,descripcion,
    region,provincia,distrito,direccion,latitud,longitud,datos,consentimiento_privacidad)
  values(p_tipo,trim(p_nombre),lower(trim(p_email)),nullif(trim(p_telefono),''),nullif(trim(p_asunto),''),trim(p_descripcion),
    nullif(trim(p_region),''),nullif(trim(p_provincia),''),nullif(trim(p_distrito),''),nullif(trim(p_direccion),''),
    p_latitud,p_longitud,coalesce(p_datos,'{}'::jsonb),p_consentimiento)
  returning solicitudes.id, solicitudes.codigo into v_id, v_codigo;

  case p_tipo
    when 'EMERGENCIA' then
      insert into public.solicitud_emergencia(solicitud_id,tipo_emergencia,fecha_emergencia,poblacion_afectada,necesidades_urgentes)
      values(v_id,nullif(trim(p_datos->>'tipo_emergencia'),''),nullif(p_datos->>'fecha_emergencia','')::date,
        nullif(p_datos->>'poblacion_afectada','')::integer,nullif(trim(p_datos->>'necesidades_urgentes'),''));
    when 'KIT' then
      insert into public.solicitud_kit(solicitud_id,tipo_kit,cantidad_solicitada,poblacion_beneficiaria,fecha_necesidad,condiciones_especiales)
      values(v_id,nullif(trim(p_datos->>'tipo_kit'),''),nullif(p_datos->>'cantidad_solicitada','')::integer,
        nullif(p_datos->>'poblacion_beneficiaria','')::integer,nullif(p_datos->>'fecha_necesidad','')::date,
        nullif(trim(p_datos->>'condiciones_especiales'),''));
    when 'OFERTA_RECURSO' then
      insert into public.oferta_recursos(solicitud_id,tipo_recurso,descripcion_recurso,cantidad,unidad,disponibilidad_desde,disponibilidad_hasta)
      values(v_id,nullif(trim(p_datos->>'tipo_recurso'),''),nullif(trim(p_datos->>'descripcion_recurso'),''),
        nullif(p_datos->>'cantidad','')::numeric,nullif(trim(p_datos->>'unidad'),''),
        nullif(p_datos->>'disponibilidad_desde','')::date,nullif(p_datos->>'disponibilidad_hasta','')::date);
    when 'ALIADO' then
      insert into public.solicitud_aliado(solicitud_id,tipo_aliado,nombre_organizacion,cobertura,capacidades,sitio_web)
      values(v_id,nullif(trim(p_datos->>'tipo_aliado'),''),nullif(trim(p_datos->>'nombre_organizacion'),''),
        nullif(trim(p_datos->>'cobertura'),''),nullif(trim(p_datos->>'capacidades'),''),nullif(trim(p_datos->>'sitio_web'),''));
    when 'VOLUNTARIO' then
      insert into public.solicitud_voluntario(solicitud_id,disponibilidad,habilidades,zona_preferida,fecha_nacimiento)
      values(v_id,nullif(trim(p_datos->>'disponibilidad'),''),nullif(trim(p_datos->>'habilidades'),''),
        nullif(trim(p_datos->>'zona_preferida'),''),nullif(p_datos->>'fecha_nacimiento','')::date);
    when 'PUNTO_ACOPIO' then
      insert into public.solicitud_punto_acopio(solicitud_id,nombre_propuesto,responsable_nombre,responsable_telefono,
        horario_propuesto,fecha_inicio,fecha_fin,capacidad_descripcion)
      values(v_id,nullif(trim(p_datos->>'nombre_propuesto'),''),nullif(trim(p_datos->>'responsable_nombre'),''),
        nullif(trim(p_datos->>'responsable_telefono'),''),nullif(trim(p_datos->>'horario_propuesto'),''),
        nullif(p_datos->>'fecha_inicio','')::date,nullif(p_datos->>'fecha_fin','')::date,
        nullif(trim(p_datos->>'capacidad_descripcion'),''));
  end case;

  return query select v_id, v_codigo;
end;
$$;

