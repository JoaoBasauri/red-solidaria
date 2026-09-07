-- Reclamo atómico: solo un procesador puede tomar cada correo.
create function public.reclamar_correo()
returns setof public.correos_salida language plpgsql security definer set search_path='' as $$
begin
  return query with candidato as (
    select c.id from public.correos_salida c join public.solicitudes s on s.id=c.solicitud_id
    where c.estado in ('PENDIENTE','ERROR') and c.intentos<5 and c.disponible_desde<=now()
      and s.codigo not like 'RS-DEMO-%'
      and lower(c.destinatario) !~ '@(example\.(com|org|net)|[^@]+\.(test|invalid))$'
    order by c.created_at,c.id for update of c skip locked limit 1
  ) update public.correos_salida c set estado='PROCESANDO',intentos=c.intentos+1,
      ultimo_error=null
    from candidato where c.id=candidato.id returning c.*;
end; $$;
revoke all on function public.reclamar_correo() from public,anon,authenticated;
grant execute on function public.reclamar_correo() to service_role;
grant select,update on public.correos_salida to service_role;
