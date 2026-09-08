begin;
alter table public.solicitudes add column publicacion_retirada_at timestamptz;
alter table public.solicitudes add column publicacion_retirada_por uuid references public.profiles(id);
alter table public.solicitudes add column motivo_retiro_publicacion text;
alter table public.puntos_acopio add column retirado_at timestamptz;
alter table public.puntos_acopio add column retirado_por uuid references public.profiles(id);
alter table public.puntos_acopio add column motivo_retiro text;

create or replace function public.retirar_publicacion(p_tipo text,p_id uuid,p_motivo text)
returns void language plpgsql security definer set search_path='' as $$
begin
  if not public.puede_gestionar_solicitudes() then raise exception 'No autorizado para retirar publicaciones'; end if;
  if p_motivo is null or length(trim(p_motivo)) not between 5 and 500 then
    raise exception 'Indica un motivo de entre 5 y 500 caracteres';
  end if;
  if p_tipo='EMERGENCIA' then
    update public.solicitudes set publicacion_retirada_at=now(),publicacion_retirada_por=auth.uid(),
      motivo_retiro_publicacion=trim(p_motivo)
    where id=p_id and tipo='EMERGENCIA' and estado='APROBADA' and publicacion_retirada_at is null;
  elsif p_tipo='PUNTO_ACOPIO' then
    update public.puntos_acopio set estado='SUSPENDIDO',retirado_at=now(),retirado_por=auth.uid(),motivo_retiro=trim(p_motivo)
    where id=p_id and estado='PUBLICADO';
  else
    raise exception 'Tipo de publicación inválido';
  end if;
  if not found then raise exception 'La publicación ya fue retirada o no está publicada. Actualiza la lista.'; end if;
end; $$;
revoke all on function public.retirar_publicacion(text,uuid,text) from public,anon;
grant execute on function public.retirar_publicacion(text,uuid,text) to authenticated;

-- Conservar las columnas de la vista instalada, incluidas las migraciones de fotos si existen.
DO $$
declare v_definition text;
begin
  v_definition := rtrim(pg_get_viewdef('public.emergencias_publicas'::regclass, true), E'; \\n\\r');
  execute format('create or replace view public.emergencias_publicas as select p.* from (%s) p join public.solicitudes s on s.id=p.id where s.publicacion_retirada_at is null', v_definition);
end; $$;
commit;
