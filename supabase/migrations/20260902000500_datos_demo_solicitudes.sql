-- Una solicitud ficticia por cada tipo. Idempotente por codigo.
begin;

insert into public.solicitudes
  (codigo,tipo,estado,prioridad,nombre_solicitante,email_solicitante,telefono_solicitante,asunto,descripcion,region,provincia,distrito,direccion,latitud,longitud,consentimiento_privacidad,datos,created_at)
values
  ('RS-DEMO-001','EMERGENCIA','RECIBIDA','CRITICA','María Torres Demo','maria.torres@example.com','999 000 101','Desborde de quebrada','Varias familias requieren evacuación preventiva y agua potable.','Lima','Huarochirí','Chosica','Quebrada California, Chosica',-11.927900,-76.690600,true,'{"tipo_emergencia":"Inundación","fecha_emergencia":"2026-09-01","poblacion_afectada":"85","necesidades_urgentes":"Agua, alimentos y refugio temporal"}',now()-interval '2 hours'),
  ('RS-DEMO-002','KIT','OBSERVADA','ALTA','Rosa Mendoza Demo','rosa.mendoza@example.com','999 000 102','Kits para familias afectadas','Solicitud de kits familiares para una comunidad con acceso restringido.','Piura','Piura','Catacaos','Centro poblado Simbilá',-5.412100,-80.675300,true,'{"tipo_kit":"Kit de alimentos","cantidad_solicitada":"40","poblacion_beneficiaria":"160","fecha_necesidad":"2026-09-08","condiciones_especiales":"Acceso por vía afirmada"}',now()-interval '3 days'),
  ('RS-DEMO-003','OFERTA_RECURSO','APROBADA','MEDIA','Ana Salazar Demo','ana.salazar@example.com','999 000 103','Donación de agua embotellada','Empresa local ofrece agua para emergencias dentro de Lima.','Lima','Lima','Ate','Zona industrial de Ate',-12.037800,-76.923600,true,'{"tipo_recurso":"Agua potable","descripcion_recurso":"Cajas de agua embotellada de 20 unidades","cantidad":"120","unidad":"cajas","disponibilidad_desde":"2026-09-03","disponibilidad_hasta":"2026-09-15"}',now()-interval '5 hours'),
  ('RS-DEMO-004','ALIADO','EN_REVISION','MEDIA','Claudia Vega Demo','claudia.vega@example.com','999 000 104','Alianza con asociación local','Asociación comunitaria interesada en integrar la red solidaria.','Arequipa','Arequipa','Cerro Colorado','Asociación Las Flores',-16.376400,-71.560800,true,'{"tipo_aliado":"Organización comunitaria","nombre_organizacion":"Asociación Las Flores Demo","cobertura":"Arequipa metropolitana","capacidades":"Voluntariado y distribución local","sitio_web":"https://example.com/las-flores"}',now()-interval '6 days'),
  ('RS-DEMO-005','VOLUNTARIO','ATENDIDA','BAJA','Miguel Soto Demo','miguel.soto@example.com','999 000 105','Apoyo logístico voluntario','Voluntario con experiencia en conducción y distribución.','Callao','Callao','Bellavista','Bellavista',-12.062700,-77.129100,true,'{"disponibilidad":"Tres tardes por semana","habilidades":"Conducción y logística","zona_preferida":"Callao","fecha_nacimiento":"1990-11-22"}',now()-interval '12 days'),
  ('RS-DEMO-006','PUNTO_ACOPIO','APROBADA','ALTA','Patricia León Demo','patricia.leon@example.com','999 000 106','Punto de acopio en Surco','Local seguro y accesible disponible para recibir donaciones.','Lima','Lima','Santiago de Surco','Av. Primavera 1200, Surco',-12.109700,-76.990600,true,'{"nombre_propuesto":"Centro Solidario Primavera","responsable_nombre":"Patricia León Demo","responsable_telefono":"999 000 106","horario_propuesto":"Lunes a sábado de 09:00 a 18:00","fecha_inicio":"2026-09-03","fecha_fin":"2026-09-30","capacidad_descripcion":"Local techado de 120 m² con acceso vehicular"}',now()-interval '5 days')
on conflict (codigo) do nothing;

insert into public.solicitud_emergencia(solicitud_id,tipo_emergencia,fecha_emergencia,poblacion_afectada,necesidades_urgentes)
select id,datos->>'tipo_emergencia',(datos->>'fecha_emergencia')::date,(datos->>'poblacion_afectada')::integer,datos->>'necesidades_urgentes' from public.solicitudes where codigo='RS-DEMO-001' on conflict(solicitud_id) do nothing;
insert into public.solicitud_kit(solicitud_id,tipo_kit,cantidad_solicitada,poblacion_beneficiaria,fecha_necesidad,condiciones_especiales)
select id,datos->>'tipo_kit',(datos->>'cantidad_solicitada')::integer,(datos->>'poblacion_beneficiaria')::integer,(datos->>'fecha_necesidad')::date,datos->>'condiciones_especiales' from public.solicitudes where codigo='RS-DEMO-002' on conflict(solicitud_id) do nothing;
insert into public.oferta_recursos(solicitud_id,tipo_recurso,descripcion_recurso,cantidad,unidad,disponibilidad_desde,disponibilidad_hasta)
select id,datos->>'tipo_recurso',datos->>'descripcion_recurso',(datos->>'cantidad')::numeric,datos->>'unidad',(datos->>'disponibilidad_desde')::date,(datos->>'disponibilidad_hasta')::date from public.solicitudes where codigo='RS-DEMO-003' on conflict(solicitud_id) do nothing;
insert into public.solicitud_aliado(solicitud_id,tipo_aliado,nombre_organizacion,cobertura,capacidades,sitio_web)
select id,datos->>'tipo_aliado',datos->>'nombre_organizacion',datos->>'cobertura',datos->>'capacidades',datos->>'sitio_web' from public.solicitudes where codigo='RS-DEMO-004' on conflict(solicitud_id) do nothing;
insert into public.solicitud_voluntario(solicitud_id,disponibilidad,habilidades,zona_preferida,fecha_nacimiento)
select id,datos->>'disponibilidad',datos->>'habilidades',datos->>'zona_preferida',(datos->>'fecha_nacimiento')::date from public.solicitudes where codigo='RS-DEMO-005' on conflict(solicitud_id) do nothing;
insert into public.solicitud_punto_acopio(solicitud_id,nombre_propuesto,responsable_nombre,responsable_telefono,horario_propuesto,fecha_inicio,fecha_fin,capacidad_descripcion)
select id,datos->>'nombre_propuesto',datos->>'responsable_nombre',datos->>'responsable_telefono',datos->>'horario_propuesto',(datos->>'fecha_inicio')::date,(datos->>'fecha_fin')::date,datos->>'capacidad_descripcion' from public.solicitudes where codigo='RS-DEMO-006' on conflict(solicitud_id) do nothing;

-- Evita que direcciones ficticias entren al procesador de correos.
update public.correos_salida set estado='CANCELADO',ultimo_error='Correo ficticio: envío deshabilitado'
where destinatario like '%@example.com' and estado in ('PENDIENTE','ERROR');

commit;

