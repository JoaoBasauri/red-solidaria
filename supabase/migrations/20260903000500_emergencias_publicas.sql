-- Proyección pública limitada: no expone contactos ni direcciones particulares.
create or replace view public.emergencias_publicas as
select s.id, 'Emergencia en ' || coalesce(nullif(s.distrito,''),nullif(s.region,''),'zona por confirmar') as titulo,
  s.region,s.provincia,s.distrito,s.estado,s.created_at,
  round(s.latitud,2) as latitud,round(s.longitud,2) as longitud,
  e.tipo_emergencia,e.poblacion_afectada,
  s.codigo like 'RS-DEMO-%' as es_demo
from public.solicitudes s
join public.solicitud_emergencia e on e.solicitud_id=s.id
where s.tipo='EMERGENCIA' and s.estado='APROBADA';

revoke all on public.emergencias_publicas from public,anon,authenticated;
grant select on public.emergencias_publicas to anon,authenticated;
