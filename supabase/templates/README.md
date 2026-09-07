# Correos en español

Estas plantillas son archivos preparados, no configuración remota aplicada.
Configurar sus cuerpos y asuntos en Supabase Auth:

| Archivo | Asunto |
| --- | --- |
| invite.html | Invitación al equipo OLI · Red Solidaria |
| recovery.html | Restablece tu contraseña · Red Solidaria |
| confirmation.html | Confirma tu correo · Red Solidaria |
| magic-link.html | Tu enlace de acceso · Red Solidaria |
| email-change.html | Confirma el cambio de correo · Red Solidaria |
| reauthentication.html | Tu código de verificación · Red Solidaria |

Revisar también cualquier notificación de seguridad habilitada en Auth para traducir su asunto y cuerpo.

## Correos de solicitudes

La migración `20260907000200_detalle_correos.sql` agrega a los nuevos mensajes el detalle enviado por el solicitante. No reenvía correos anteriores.
`functions/_shared/email-templates.mjs` genera asunto, HTML seguro y texto en español para `solicitud_recibida` y `cambio_estado`.

Pendiente: elegir/configurar proveedor, desplegar un procesador privado de `correos_salida` y programarlo. Debe reclamar mensajes atómicamente, usar idempotencia, reintentar de forma limitada y registrar el resultado sin exponer datos personales en logs. Nunca enviar registros demo o cancelados ni poner credenciales en el frontend.
El procesador `functions/send-request-emails` ya está implementado y desactivado por defecto. Ver `../SMTP.md` para configurar secretos, desplegar y programar. La generación de la plantilla por sí sola no entrega correos.
