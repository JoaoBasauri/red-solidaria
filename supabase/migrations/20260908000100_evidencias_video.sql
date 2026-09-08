-- Permitir videos privados de hasta 10 MB sin modificar el acceso a evidencias.
begin;
alter table public.evidencias drop constraint evidencias_mime_type_check;
alter table public.evidencias add constraint evidencias_mime_type_check
  check (mime_type in ('image/jpeg','image/png','image/webp','application/pdf','video/mp4','video/webm'));
update storage.buckets
set allowed_mime_types = array['image/jpeg','image/png','image/webp','application/pdf','video/mp4','video/webm']
where id = 'evidencias';
commit;
