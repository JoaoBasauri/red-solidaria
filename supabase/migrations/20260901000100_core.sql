create extension if not exists pgcrypto;

create type public.rol_oli as enum ('ADMIN', 'GESTOR', 'LECTURA');
create type public.tipo_solicitud as enum ('EMERGENCIA', 'KIT', 'OFERTA_RECURSO', 'ALIADO', 'VOLUNTARIO', 'PUNTO_ACOPIO');
create type public.estado_solicitud as enum ('RECIBIDA', 'EN_REVISION', 'OBSERVADA', 'APROBADA', 'RECHAZADA', 'ATENDIDA', 'CERRADA', 'CANCELADA');
create type public.prioridad_solicitud as enum ('BAJA', 'MEDIA', 'ALTA', 'CRITICA');
create type public.estado_publicacion as enum ('BORRADOR', 'PUBLICADO', 'SUSPENDIDO', 'FINALIZADO');
create type public.estado_correo as enum ('PENDIENTE', 'PROCESANDO', 'ENVIADO', 'ERROR', 'CANCELADO');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre_completo text not null,
  rol public.rol_oli not null default 'GESTOR',
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Solo trabajadores de OLI; los solicitantes publicos no tienen cuenta.';

create or replace function public.es_trabajador_oli()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles p where p.id = auth.uid() and p.activo);
$$;

create or replace function public.es_admin_oli()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles p where p.id = auth.uid() and p.activo and p.rol = 'ADMIN');
$$;

create or replace function public.crear_profile_oli()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id, nombre_completo)
  values(new.id, coalesce(nullif(new.raw_user_meta_data ->> 'full_name',''), split_part(new.email,'@',1)));
  return new;
end;
$$;

create trigger crear_profile_oli_al_registrar
after insert on auth.users for each row execute function public.crear_profile_oli();

create or replace function public.actualizar_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;

alter table public.profiles enable row level security;
create policy profiles_lectura_oli on public.profiles for select to authenticated using (public.es_trabajador_oli());
create policy profiles_admin_actualiza on public.profiles for update to authenticated using (public.es_admin_oli()) with check (public.es_admin_oli());

revoke all on public.profiles from anon;
grant select on public.profiles to authenticated;
grant update (nombre_completo, rol, activo) on public.profiles to authenticated;

