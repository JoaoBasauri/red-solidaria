# Formularios de solicitudes actualizados

## Alcance

- Selectores con búsqueda sin distinción de tildes, navegación con teclado, máximo de ocho filas de 44 px y scroll.
- Región, provincia y distrito dependientes para todas las solicitudes, también las que tienen mapa.
- Emergencias: tipo, activa/proyectada, fecha y hora de Perú, familias y personas por separado, necesidades múltiples, contacto territorial y enlace opcional de evidencia.
- Aliados: persona/organización, clasificación, modalidades múltiples, datos de acopio condicionales, edad/DNI/disponibilidad para personas y emergencia de interés.
- Ofertas: persona/organización, clasificación, naturaleza/cantidad/unidad, región, plazo y emergencia de interés.
- Voluntarios: disponibilidad/habilidades múltiples, distrito preferido identificable con provincia y región, edad/DNI y emergencia de interés.
- Confirmación de veracidad para aliados, ofertas y voluntarios. El consentimiento de privacidad sigue siendo independiente.

Los campos adicionales se guardan en `solicitudes.datos` mediante el RPC existente. No se altera el significado de las columnas históricas: `poblacion_afectada` sigue contando personas y `familias_afectadas` es un dato independiente. La solicitud de aliado persona usa su nombre de contacto en la columna histórica obligatoria `nombre_organizacion` y se distingue por `datos.tipo_participante`.

El panel OLI combina el detalle tipado con `datos`. Los correos incluyen los nuevos datos operativos; no incluyen DNI ni edad. Elegir Punto de acopio dentro de Aliado registra la propuesta, no publica automáticamente un punto. El flujo de publicación de PUNTO_ACOPIO no cambia.

## Publicación pendiente

1. Aplicar `migrations/20260908000100_evidencias_video.sql` antes de ofrecer videos en producción. Amplía los MIME permitidos, mantiene bucket privado y límite de 10 MB.
2. Redesplegar `upload-evidence` y `send-request-emails` (esta última con su configuración privada existente).
3. Publicar frontend en Vercel.
4. Probar con cuentas/destinatarios controlados: creación, revisión OLI, correo, mapa, cambio de provincia y selección múltiple.

La carga de evidencias sigue dependiendo de `CARGA_EVIDENCIAS`. Para videos mayores de 10 MB se ofrece un enlace de respaldo. No se han aplicado migraciones remotas ni enviado solicitudes de prueba reales en esta actualización.
