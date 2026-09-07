# Activar correos de solicitudes

Implementado, pero desactivado hasta disponer de credenciales y desplegarlo.

Remitente elegido por OLI para las solicitudes: `innovacion.digital@olifoundation.org`.
Configurar `MAIL_FROM_EMAIL` con ese valor en los secretos. El usuario SMTP puede
ser distinto del remitente; se debe usar el que indique el proveedor.

1. Aplicar las migraciones pendientes en orden, con respaldo y `supabase db push --dry-run` antes de `supabase db push`. El envío necesita `20260907000200_detalle_correos.sql` y `20260907000300_procesador_correos.sql`.
2. En los secretos de Supabase Edge Functions configurar las variables indicadas en `smtp.env.example`. No ponerlas en `.env` de Vite ni en el navegador. `MAIL_FROM_EMAIL` será el remitente autorizado (por ejemplo, el futuro correo de OLI). Las credenciales deben admitir SMTP; algunos proveedores requieren contraseña de aplicación o habilitación por su administrador.
3. Generar `MAIL_WORKER_SECRET` aleatorio (al menos 32 caracteres) y guardarlo también como secreto del programador. Mantener `MAIL_ENABLED=false` mientras se configura.
4. Desplegar `supabase functions deploy send-request-emails --no-verify-jwt`. Esta función no usa sesiones de usuarios: valida obligatoriamente `x-mail-worker-secret` antes de consultar la cola. No llamar desde React ni exponer el secreto. El control JWT del gateway se sustituye únicamente para esta función por su autenticación privada.
5. Programar un POST por minuto a `/functions/v1/send-request-emails` con el encabezado `x-mail-worker-secret` obtenido de un almacén de secretos (por ejemplo Vault con Supabase Cron). El cuerpo es `{}`; no admite destinatarios ni contenido proporcionado por quien llama. Procesa un correo por invocación.
6. Antes de activar, revisar la cola existente: mensajes anteriores podrían no contener el detalle completo. Los cancelados, demos y dominios de prueba no se envían. No activar sin revisar destinatarios pendientes; al habilitarlo se procesarán los elegibles, incluidos los antiguos.
7. Establecer `MAIL_ENABLED=true` y realizar una prueba autorizada con un correo controlado. Comprobar recepción, idioma, detalle y estado de cola. Una aceptación SMTP no garantiza llegada a la bandeja de entrada.

## Variables

- `MAIL_ENABLED`: solo el valor `true` activa el envío.
- `SMTP_HOST`, `SMTP_PORT` (587 por defecto, también 465 o 2525).
- `SMTP_USER`, `SMTP_PASSWORD`: credenciales del proveedor.
- `MAIL_FROM_EMAIL`, `MAIL_FROM_NAME`: remitente autorizado y nombre visible.
- `MAIL_WORKER_SECRET`: secreto exclusivo del proceso programado.
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`: variables del entorno de la función, nunca del frontend.

TLS y verificación de certificados son obligatorios. No se registran destinatarios, cuerpos ni respuestas SMTP crudas en logs. Los rechazos temporales se reintentan hasta cinco intentos con espera creciente. Los fallos ambiguos quedan en PROCESANDO con aviso; comprobar entrega antes de reencolar. Un proceso interrumpido también puede quedar en PROCESANDO y requiere revisión. SMTP no ofrece garantía de envío exactamente una vez; Message-ID estable no es una garantía de deduplicación.

## Contraseñas e invitaciones

Configurar el mismo proveedor en Custom SMTP de Supabase Auth por separado y aplicar los asuntos y cuerpos de `templates/`. Las variables de Edge Functions no cambian automáticamente Auth. No se han aplicado cambios remotos ni enviado correos con esta implementación.

Referencias: https://nodemailer.com/smtp y https://supabase.com/docs/guides/auth/auth-smtp
