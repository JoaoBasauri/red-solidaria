create sequence public.solicitud_codigo_seq;

create table public.solicitudes (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique default ('RS-' || to_char(current_date,'YYYY') || '-' || lpad(nextval('public.solicitud_codigo_seq')::text,6,'0')),
  tipo public.tipo_solicitud not null,
  estado public.estado_solicitud not null default 'RECIBIDA',
  prioridad public.prioridad_solicitud not null default 'MEDIA',
  nombre_solicitante text not null,
  email_solicitante text not null check (email_solicitante ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  telefono_solicitante text,
  asunto text,
  descripcion text not null,
  region text,
  provincia text,
  distrito text,
  direccion text,
  latitud numeric(9,6) check (latitud between -90 and 90),
  longitud numeric(9,6) check (longitud between -180 and 180),
  consentimiento_privacidad boolean not null check (consentimiento_privacidad),
  datos jsonb not null default '{}'::jsonb check (jsonb_typeof(datos) = 'object'),
  asignado_a uuid references public.profiles(id) on delete set null,
  observacion_actual text,
  fecha_ultimo_cambio timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.solicitud_historial (
  id bigint generated always as identity primary key,
  solicitud_id uuid not null references public.solicitudes(id) on delete cascade,
  estado_anterior public.estado_solicitud,
  estado_nuevo public.estado_solicitud not null,
  observacion text,
  realizado_por uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.evidencias (
  id uuid primary key default gen_random_uuid(),
  solicitud_id uuid not null references public.solicitudes(id) on delete cascade,
  storage_path text not null unique,
  nombre_original text not null,
  mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp','application/pdf')),
  tamano_bytes bigint not null check (tamano_bytes > 0 and tamano_bytes <= 10485760),
  created_at timestamptz not null default now()
);

create table public.notificaciones_oli (
  id bigint generated always as identity primary key,
  solicitud_id uuid references public.solicitudes(id) on delete cascade,
  tipo text not null,
  titulo text not null,
  mensaje text not null,
  leida_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.correos_salida (
  id bigint generated always as identity primary key,
  solicitud_id uuid references public.solicitudes(id) on delete cascade,
  destinatario text not null,
  plantilla text not null,
  datos jsonb not null default '{}'::jsonb,
  estado public.estado_correo not null default 'PENDIENTE',
  intentos smallint not null default 0,
  ultimo_error text,
  disponible_desde timestamptz not null default now(),
  enviado_at timestamptz,
  created_at timestamptz not null default now()
);

create index solicitudes_estado_idx on public.solicitudes(estado, created_at desc);
create index solicitudes_tipo_idx on public.solicitudes(tipo, created_at desc);
create index solicitudes_asignado_idx on public.solicitudes(asignado_a) where asignado_a is not null;
create index solicitudes_email_idx on public.solicitudes(lower(email_solicitante));
create index correos_pendientes_idx on public.correos_salida(disponible_desde) where estado in ('PENDIENTE','ERROR');

create trigger solicitudes_updated_at before update on public.solicitudes for each row execute function public.actualizar_updated_at();

create or replace function public.registrar_cambio_solicitud()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    insert into public.solicitud_historial(solicitud_id, estado_nuevo) values(new.id, new.estado);
    insert into public.notificaciones_oli(solicitud_id,tipo,titulo,mensaje)
      values(new.id,'NUEVA_SOLICITUD','Nueva solicitud ' || new.codigo,'Se recibio una solicitud de tipo ' || new.tipo::text);
    insert into public.correos_salida(solicitud_id,destinatario,plantilla,datos)
      values(new.id,new.email_solicitante,'solicitud_recibida',jsonb_build_object('codigo',new.codigo,'nombre',new.nombre_solicitante));
  elsif new.estado is distinct from old.estado then
    insert into public.solicitud_historial(solicitud_id,estado_anterior,estado_nuevo,observacion,realizado_por)
      values(new.id,old.estado,new.estado,new.observacion_actual,auth.uid());
    insert into public.correos_salida(solicitud_id,destinatario,plantilla,datos)
      values(new.id,new.email_solicitante,'cambio_estado',jsonb_build_object('codigo',new.codigo,'estado',new.estado,'observacion',new.observacion_actual));
    new.fecha_ultimo_cambio = now();
  end if;
  return new;
end;
$$;

create trigger solicitudes_al_crear after insert on public.solicitudes
for each row execute function public.registrar_cambio_solicitud();

create trigger solicitudes_al_actualizar before update on public.solicitudes
for each row execute function public.registrar_cambio_solicitud();

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
  if p_tipo = 'PUNTO_ACOPIO' and (p_latitud is null or p_longitud is null or nullif(trim(p_direccion),'') is null) then
    raise exception 'El punto de acopio requiere direccion, latitud y longitud';
  end if;
  insert into public.solicitudes(tipo,nombre_solicitante,email_solicitante,telefono_solicitante,asunto,descripcion,
    region,provincia,distrito,direccion,latitud,longitud,datos,consentimiento_privacidad)
  values(p_tipo,trim(p_nombre),lower(trim(p_email)),nullif(trim(p_telefono),''),nullif(trim(p_asunto),''),trim(p_descripcion),
    nullif(trim(p_region),''),nullif(trim(p_provincia),''),nullif(trim(p_distrito),''),nullif(trim(p_direccion),''),
    p_latitud,p_longitud,coalesce(p_datos,'{}'::jsonb),p_consentimiento)
  returning solicitudes.id, solicitudes.codigo into v_id, v_codigo;
  return query select v_id, v_codigo;
end;
$$;

revoke all on function public.crear_solicitud_publica(public.tipo_solicitud,text,text,text,text,text,text,text,text,text,numeric,numeric,jsonb,boolean) from public;
grant execute on function public.crear_solicitud_publica(public.tipo_solicitud,text,text,text,text,text,text,text,text,text,numeric,numeric,jsonb,boolean) to anon, authenticated;

alter table public.solicitudes enable row level security;
alter table public.solicitud_historial enable row level security;
alter table public.evidencias enable row level security;
alter table public.notificaciones_oli enable row level security;
alter table public.correos_salida enable row level security;

create policy solicitudes_oli on public.solicitudes for all to authenticated using (public.es_trabajador_oli()) with check (public.es_trabajador_oli());
create policy historial_oli_lectura on public.solicitud_historial for select to authenticated using (public.es_trabajador_oli());
create policy evidencias_oli on public.evidencias for all to authenticated using (public.es_trabajador_oli()) with check (public.es_trabajador_oli());
create policy notificaciones_oli on public.notificaciones_oli for all to authenticated using (public.es_trabajador_oli()) with check (public.es_trabajador_oli());
create policy correos_oli_lectura on public.correos_salida for select to authenticated using (public.es_trabajador_oli());

revoke all on public.solicitudes, public.solicitud_historial, public.evidencias, public.notificaciones_oli, public.correos_salida from anon;
grant select, insert, update on public.solicitudes, public.evidencias, public.notificaciones_oli to authenticated;
grant select on public.solicitud_historial, public.correos_salida to authenticated;
