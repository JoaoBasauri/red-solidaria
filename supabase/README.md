# Base de datos - Red Solidaria

Las migraciones modelan una plataforma donde solo el personal de OLI utiliza Supabase Auth. Las personas externas envian formularios publicos y quedan registradas mediante sus datos de contacto.

## Migraciones

1. `20260901000100_core.sql`: tipos, perfiles internos, helpers de autorizacion y RLS.
2. `20260901000200_solicitudes.sql`: solicitudes publicas, historial, evidencias, notificaciones, cola de correo y RPC publica.
3. `20260901000300_puntos_y_flujo.sql`: puntos de acopio publicables, vista para el mapa, transiciones de estado y bucket privado.

## Flujo de solicitudes publicas

El frontend debe invocar `crear_solicitud_publica`. No debe insertar directamente en `solicitudes`. Para `PUNTO_ACOPIO` son obligatorios direccion, latitud y longitud.

Los datos particulares de cada formulario se envian en `p_datos` como JSON. Esto permite comenzar el MVP sin perder flexibilidad; cuando OLI congele los campos finales se pueden normalizar mediante una migracion posterior.

## Usuarios OLI

No debe existir una pantalla publica de registro. Los usuarios se crean por invitacion o desde la administracion de Supabase. El trigger crea su perfil con rol `GESTOR`; un administrador puede cambiar el rol posteriormente.

## Correos

Los triggers agregan mensajes a `correos_salida`. Una Edge Function programada debe reclamar los registros pendientes, enviarlos mediante el proveedor transaccional y actualizar estado, intentos, error y fecha de envio. No se deben exponer credenciales del proveedor en React.

## Evidencias publicas

El bucket es privado. La carga desde formularios anonimos debe pasar por una Edge Function que valide solicitud, MIME, tamano y ruta antes de utilizar la service role. No se concede escritura anonima directa al bucket.

## Aplicacion

Antes de aplicar estas migraciones a una base con estructuras existentes, obtener un `db dump` o ejecutar `supabase db pull` con acceso autenticado. Luego revisar colisiones con `profiles`, `requests`, funciones y politicas antiguas.

En un proyecto Supabase enlazado:

```sh
supabase migration list
supabase db push --dry-run
supabase db push
```

El `--dry-run` es obligatorio antes de modificar el proyecto remoto.
