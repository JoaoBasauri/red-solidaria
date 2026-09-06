begin;

insert into public.solicitudes(codigo,tipo,estado,prioridad,nombre_solicitante,email_solicitante,telefono_solicitante,asunto,descripcion,region,provincia,distrito,direccion,latitud,longitud,consentimiento_privacidad,datos,created_at)
values
('RS-DEMO-PALIMA-01','PUNTO_ACOPIO','APROBADA','MEDIA','Lucía Herrera Demo','lucia.herrera@example.com','999 000 201','Punto de acopio Lima Centro','Espacio demostrativo habilitado para recibir alimentos no perecibles, agua y artículos de higiene.','Lima','Lima','Lince','Av. Arequipa 1850, Lince',-12.084421,-77.035681,true,'{"nombre_propuesto":"Punto OLI Lima Centro (Demo)","responsable_nombre":"Lucía Herrera Demo","responsable_telefono":"999 000 201","horario_propuesto":"Lunes a sábado de 09:00 a 18:00","fecha_inicio":"2026-09-03","fecha_fin":"2026-10-03","capacidad_descripcion":"Área techada con acceso vehicular"}',now()-interval '2 days'),
('RS-DEMO-PALIMA-02','PUNTO_ACOPIO','APROBADA','ALTA','Jorge Castillo Demo','jorge.castillo@example.com','999 000 202','Punto de acopio Lima Este','Espacio demostrativo para recibir ropa en buen estado, frazadas y kits de emergencia.','Lima','Lima','San Juan de Lurigancho','Av. Próceres de la Independencia 1632, San Juan de Lurigancho',-12.018527,-77.002015,true,'{"nombre_propuesto":"Punto OLI Lima Este (Demo)","responsable_nombre":"Jorge Castillo Demo","responsable_telefono":"999 000 202","horario_propuesto":"Lunes a domingo de 08:00 a 17:00","fecha_inicio":"2026-09-03","fecha_fin":"2026-10-03","capacidad_descripcion":"Local de 150 m² con zona de clasificación"}',now()-interval '1 day')
on conflict(codigo) do nothing;

insert into public.solicitud_punto_acopio(solicitud_id,nombre_propuesto,responsable_nombre,responsable_telefono,horario_propuesto,fecha_inicio,fecha_fin,capacidad_descripcion)
select id,datos->>'nombre_propuesto',datos->>'responsable_nombre',datos->>'responsable_telefono',datos->>'horario_propuesto',(datos->>'fecha_inicio')::date,(datos->>'fecha_fin')::date,datos->>'capacidad_descripcion'
from public.solicitudes where codigo in('RS-DEMO-PALIMA-01','RS-DEMO-PALIMA-02')
on conflict(solicitud_id) do nothing;

insert into public.puntos_acopio(solicitud_origen_id,nombre_publico,descripcion_publica,direccion_publica,region,provincia,distrito,latitud,longitud,horario,contacto_publico,estado,publicado_desde)
select id,datos->>'nombre_propuesto',descripcion,direccion,region,provincia,distrito,latitud,longitud,datos->>'horario_propuesto',telefono_solicitante,'PUBLICADO',now()
from public.solicitudes where codigo in('RS-DEMO-PALIMA-01','RS-DEMO-PALIMA-02')
on conflict(solicitud_origen_id) do update set nombre_publico=excluded.nombre_publico,descripcion_publica=excluded.descripcion_publica,direccion_publica=excluded.direccion_publica,region=excluded.region,provincia=excluded.provincia,distrito=excluded.distrito,latitud=excluded.latitud,longitud=excluded.longitud,horario=excluded.horario,contacto_publico=excluded.contacto_publico,estado='PUBLICADO',publicado_desde=coalesce(public.puntos_acopio.publicado_desde,now());

update public.correos_salida set estado='CANCELADO',ultimo_error='Correo ficticio: envío deshabilitado'
where destinatario in('lucia.herrera@example.com','jorge.castillo@example.com') and estado in('PENDIENTE','ERROR');

commit;

