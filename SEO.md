# SEO de Red Solidaria

Los metadatos de las nueve páginas públicas se mantienen en `src/utils/seo.mjs`.
`Seo.jsx` actualiza el encabezado al navegar dentro de React. `seo-plugin.mjs`
genera el encabezado HTML de cada ruta durante el build, además de robots.txt
y sitemap.xml. Las reglas de Vercel entregan ese HTML sin depender de JavaScript
para los títulos, las descripciones y las vistas previas sociales.

El contenido del cuerpo sigue renderizándose con React; esto no es SSR completo.
Los datos dinámicos de emergencias no se copian a archivos públicos durante el build.
Los datos estructurados describen el sitio y Fundación OLI, sin inventar cifras,
reseñas ni resultados de impacto. La imagen social utiliza el membrete existente.

## Dominio

Por defecto se usa https://red-solidaria-eta.vercel.app. El subdominio aún no
está confirmado. Cuando esté operativo, configurar en Vercel, para Production:

```
VITE_SEO_SITE_URL=https://SUBDOMINIO.olifoundation.org
```

Usar el nombre real, no ese marcador. Redesplegar para regenerar todos los
canónicos, el sitemap y las imágenes sociales. Esta variable es pública, no es
una credencial. Es independiente de APP_BASE_URL/VITE_APP_BASE_URL para no
alterar los enlaces de autenticación ni el desarrollo local en localhost.
No se modificó el .env local.

## Publicación y validación

1. Publicar estos cambios en Vercel.
2. Abrir /emergencias y revisar el código fuente: título, descripción y canonical.
3. Abrir /sitemap.xml y /robots.txt; verificar el dominio definitivo.
4. Verificar la propiedad del dominio en Google Search Console y enviar sitemap.xml.
5. Inspeccionar URLs públicas en Search Console; la indexación no es inmediata ni garantizada.
6. Si cambia el dominio, configurar la redirección permanente del anterior en Vercel.

Login, contraseña, solicitud y panel OLI llevan noindex y no aparecen en el sitemap.
robots.txt permite su rastreo para que el buscador pueda leer noindex; esta
directiva no sustituye autenticación ni las políticas de acceso de Supabase.

Pruebas: ejecutar `npm run build` y luego `node --test src/utils/seo.test.mjs`.
El test de artefactos requiere compilar previamente.

Referencia: [Google: SEO para JavaScript](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).
