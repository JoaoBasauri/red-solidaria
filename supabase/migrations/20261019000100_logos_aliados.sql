-- Logos de organizaciones aliadas para el banner público de la página de inicio.
-- Un logo enviado desde el formulario de aliado queda PENDIENTE hasta que un ADMIN lo publica.
create type public.estado_logo_aliado as enum ('PENDIENTE', 'PUBLICADO', 'OCULTO');

create table public.aliados_logos (
  id uuid primary key default gen_random_uuid(),
  solicitud_id uuid unique references public.solicitudes(id) on delete set null,
  nombre text not null check (char_length(btrim(nombre)) between 2 and 120),
  sitio_web text check (sitio_web is null or sitio_web ~* '^https?://[^\s]+$'),
  storage_path text not null unique,
  mime_type text not null check (mime_type in ('image/png','image/jpeg','image/webp','image/svg+xml')),
  ancho integer check (ancho > 0),
  alto integer check (alto > 0),
  estado public.estado_logo_aliado not null default 'PENDIENTE',
  orden integer not null default 0,
  publicado_por uuid references public.profiles(id) on delete set null,
  publicado_en timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index aliados_logos_publicados_idx on public.aliados_logos(orden, nombre) where estado = 'PUBLICADO';
create trigger aliados_logos_updated_at before update on public.aliados_logos
for each row execute function public.actualizar_updated_at();

-- Registra quién y cuándo publicó el logo.
create function public.registrar_publicacion_logo()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.estado = 'PUBLICADO' and (tg_op = 'INSERT' or old.estado is distinct from 'PUBLICADO') then
    new.publicado_por := auth.uid();
    new.publicado_en := now();
  end if;
  return new;
end; $$;
create trigger aliados_logos_publicacion before insert or update of estado on public.aliados_logos
for each row execute function public.registrar_publicacion_logo();

-- Gestión completa solo para ADMIN. Las inserciones públicas pasan por la función upload-ally-logo (service role).
alter table public.aliados_logos enable row level security;
grant select, insert, update, delete on public.aliados_logos to authenticated;
create policy aliados_logos_admin on public.aliados_logos for all to authenticated
  using (public.es_admin_oli()) with check (public.es_admin_oli());

-- Vista pública del banner: solo logos publicados y solo las columnas necesarias.
create view public.aliados_publicos as
select id, nombre, sitio_web, storage_path, ancho, alto, orden
from public.aliados_logos
where estado = 'PUBLICADO';
grant select on public.aliados_publicos to anon, authenticated;

-- Bucket privado: los publicados se leen con URL firmada; nadie anónimo puede escribir.
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('logos-aliados', 'logos-aliados', false, 1048576, array['image/png','image/jpeg','image/webp','image/svg+xml']);
create policy logos_aliados_lectura on storage.objects for select to anon, authenticated using (
  bucket_id = 'logos-aliados' and (public.es_admin_oli() or exists(
    select 1 from public.aliados_publicos a where a.storage_path = name
  ))
);
create policy logos_aliados_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'logos-aliados' and public.es_admin_oli());
create policy logos_aliados_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'logos-aliados' and public.es_admin_oli()) with check (bucket_id = 'logos-aliados' and public.es_admin_oli());
create policy logos_aliados_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'logos-aliados' and public.es_admin_oli());
