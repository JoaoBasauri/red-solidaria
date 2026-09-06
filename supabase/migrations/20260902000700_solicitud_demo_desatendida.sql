begin;

insert into public.solicitudes (
  codigo,tipo,estado,prioridad,nombre_solicitante,email_solicitante,
  telefono_solicitante,asunto,descripcion,region,provincia,distrito,direccion,
  latitud,longitud,consentimiento_privacidad,datos,created_at,fecha_ultimo_cambio
)
values (
  'RS-DEMO-ATRASADA','EMERGENCIA','RECIBIDA','CRITICA','Elena Vargas Demo',
  'elena.vargas@example.com','999 000 199','Solicitud desatendida - inundación',
  'Familias aisladas necesitan agua potable, alimentos y evaluación urgente.',
  'San Martín','Moyobamba','Moyobamba','Sector Bajo Mayo, Moyobamba',
  -6.034600,-76.974200,true,
  '{"tipo_emergencia":"Inundación","fecha_emergencia":"2026-08-29","poblacion_afectada":"65","necesidades_urgentes":"Agua, alimentos y evaluación de viviendas"}',
  now()-interval '3 days 4 hours',now()-interval '3 days 4 hours'
)
on conflict (codigo) do nothing;

insert into public.solicitud_emergencia (
  solicitud_id,tipo_emergencia,fecha_emergencia,poblacion_afectada,necesidades_urgentes
)
select id,datos->>'tipo_emergencia',(datos->>'fecha_emergencia')::date,
  (datos->>'poblacion_afectada')::integer,datos->>'necesidades_urgentes'
from public.solicitudes where codigo='RS-DEMO-ATRASADA'
on conflict (solicitud_id) do nothing;

update public.notificaciones_oli n
set created_at=now()-interval '3 days 4 hours'
from public.solicitudes s
where n.solicitud_id=s.id and s.codigo='RS-DEMO-ATRASADA';

-- Reinicia la lectura del caso demo para que cada trabajador pueda probar la alerta.
delete from public.notificacion_lecturas l
using public.notificaciones_oli n,public.solicitudes s
where l.notificacion_id=n.id and n.solicitud_id=s.id and s.codigo='RS-DEMO-ATRASADA';

update public.correos_salida set estado='CANCELADO',ultimo_error='Correo ficticio: envío deshabilitado'
where destinatario='elena.vargas@example.com' and estado in ('PENDIENTE','ERROR');

commit;

