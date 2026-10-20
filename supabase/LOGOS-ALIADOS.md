# Banner de logos de organizaciones aliadas

## Qué hace

- **Página de inicio:** banner «Organizaciones que se suman» entre «¿Cómo utilizaremos los fondos?» y la convocatoria final. Lee solo los logos **publicados** desde Supabase (vista `aliados_publicos` + URL firmada de 1 hora). Si no hay ninguno publicado, el banner no aparece.
  - Logos en gris que toman color al pasar el mouse o con el teclado, todos a la misma altura visual.
  - Si no caben en el ancho, carrusel continuo con flechas que se pausa al pasar el mouse, enfocar o tocar. Con `prefers-reduced-motion` no se mueve solo (solo flechas y desplazamiento manual). Si caben, se muestran centrados y sin flechas.
- **Formulario «Sumarse como aliado»:** cuando se elige *Organización*, aparece el campo opcional «Logo de la organización» con vista previa (normal y como se verá en el banner) y el motivo exacto si no cumple.
- **Panel OLI → Aliados** (`/oli/aliados`, solo ADMIN, botón en la cabecera junto a Voluntarios): lista con vista previa, nombre, enlace, estado, posición y origen. Acciones: aprobar y publicar, ocultar, editar nombre y enlace, reemplazar logo, subir uno manual, reordenar (flechas ↑/↓ con el filtro «Todos») y eliminar con confirmación.

Un logo enviado desde el formulario **nunca se publica solo**: queda `PENDIENTE` hasta que un ADMIN lo aprueba.

## Reglas del logo

Se validan en el navegador y otra vez en el servidor con el mismo código (`functions/_shared/ally-logo.mjs`):

| Regla | Valor |
| --- | --- |
| Formatos | PNG, JPG, WebP o SVG (se comprueba el contenido real del archivo, no solo la extensión) |
| Peso máximo | 1 MB |
| Tamaño mínimo | 200 × 80 px (no aplica a SVG, que es vectorial) |
| Proporción | entre 1:1 (cuadrado) y 5:1 (horizontal), con 2 % de tolerancia |
| SVG | se rechazan scripts, eventos `on…`, `javascript:`, `foreignObject`, `DOCTYPE/ENTITY` y archivos externos |

Para cambiar los límites, edita `LOGO_RULES` en `functions/_shared/ally-logo.mjs` y también `file_size_limit` / `allowed_mime_types` del bucket en la migración si cambian el peso o los formatos.

## Seguridad

- Bucket `logos-aliados` **privado**. Lectura anónima solo de los archivos que figuran en `aliados_publicos` (publicados), igual que las fotos de emergencias.
- El público no escribe en el bucket: el logo del formulario pasa por la Edge Function `upload-ally-logo`, que valida la solicitud (tipo ALIADO, participante *Organización*, código correcto, creada hace menos de 1 hora, un solo logo por solicitud) y el archivo antes de usar la service role.
- Tabla `aliados_logos` con RLS: gestión completa solo para `es_admin_oli()`. Se registra quién y cuándo publicó cada logo.

## Qué aplicar y en qué orden

No se ha aplicado ni desplegado nada todavía.

1. **Migración** `migrations/20261019000100_logos_aliados.sql` (tabla, estados, vista pública, bucket y políticas). Con respaldo previo:
   ```bash
   supabase db push --dry-run
   supabase db push
   ```
2. **Edge Function** nueva (usa la misma configuración que `upload-evidence`; necesita `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`, que Supabase ya provee):
   ```bash
   supabase functions deploy upload-ally-logo
   ```
3. **Frontend:** publicar en Vercel.
4. **Probar** con una cuenta ADMIN y datos controlados:
   - Registrar un aliado *Organización* con un logo válido → aparece como Pendiente en `/oli/aliados` y **no** en el inicio.
   - Probar un logo inválido (por ejemplo 100 × 100 px o > 1 MB) → el formulario muestra el motivo y no lo envía.
   - Aprobar y publicar → aparece en el banner del inicio; ocultar → desaparece.
   - Subir uno manual, editar el enlace, reemplazar el archivo, reordenar y eliminar.
   - Con un perfil GESTOR o LECTURA, `/oli/aliados` no debe abrir y la tabla no debe devolver filas.

Si la migración todavía no está aplicada, el sitio público sigue funcionando: el banner simplemente no se muestra, y si una organización adjunta un logo, la solicitud se registra igual y solo se avisa que el logo no se pudo cargar.
