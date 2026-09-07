# URL pública para invitaciones y recuperación

No se usa window.location.origin ni el redirectTo que envíe el navegador al crear perfiles.

1. Configurar el secreto `APP_BASE_URL` de Edge Functions con la URL pública real del sitio y redesplegar `admin-profiles`.
2. Configurar `VITE_APP_BASE_URL` con la misma URL en el entorno de construcción del frontend y reconstruir/desplegar.
3. En Supabase Auth, configurar Site URL con la URL pública y añadir su ruta exacta `/actualizar-contrasena` a Redirect URLs. Si el destino no está autorizado, Supabase puede usar Site URL; no dejar localhost como valor de producción.
4. Las plantillas de invitación y recuperación deben conservar `{{ .ConfirmationURL }}`, que contiene el enlace de verificación. No sustituirlo por un enlace directo sin token.
5. Generar una nueva invitación de prueba autorizada: los correos ya enviados no se modifican.

La URL pública todavía debe ser proporcionada/configurada. Sin ella, el código rechaza el envío en lugar de generar un enlace localhost.
