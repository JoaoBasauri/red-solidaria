export const defaultSiteUrl = 'https://red-solidaria-eta.vercel.app'

export const pages = {
  '/': ['Red Solidaria · Fundación OLI | Ayuda ante emergencias en Perú', 'Conectamos necesidades con personas y organizaciones que pueden ayudar. Conoce emergencias, puntos de acopio y formas de sumarte a Red Solidaria.'],
  '/nosotros': ['Nosotros | Red Solidaria · Fundación OLI', 'Conoce Red Solidaria de Fundación OLI y nuestra labor para conectar y organizar la ayuda a comunidades ante emergencias en Perú.'],
  '/responde': ['OLI Responde | Respuesta ante emergencias', 'Conoce cómo OLI Responde identifica necesidades y coordina la entrega de ayuda a las comunidades afectadas por emergencias.'],
  '/articula': ['OLI Articula | Súmate a la red solidaria', 'Aporta tiempo, conocimientos, transporte o recursos. Descubre cómo participar como aliado, organización o voluntario en Red Solidaria.'],
  '/conecta': ['OLI Conecta | Encuentra dónde ayudar', 'Encuentra emergencias y puntos de acopio. Conecta tus recursos y capacidades con oportunidades de ayuda en la red de Fundación OLI.'],
  '/emergencias': ['Emergencias activas | Red Solidaria · Fundación OLI', 'Consulta las emergencias publicadas por Fundación OLI, su ubicación y los recursos necesarios para apoyar a las comunidades afectadas.'],
  '/puntos-acopio': ['Puntos de acopio | Dónde entregar donaciones', 'Encuentra puntos de acopio publicados por Fundación OLI. Consulta ubicaciones, horarios y contactos para coordinar la entrega de donaciones.'],
  '/reporta': ['OLI Reporta | Impacto y transparencia', 'Conoce el seguimiento de la respuesta de Fundación OLI: recursos movilizados, ayuda entregada e impacto de las acciones de Red Solidaria.'],
  '/faq': ['Preguntas frecuentes | Red Solidaria · Fundación OLI', 'Resuelve tus dudas sobre Red Solidaria, cómo participar, reportar una emergencia, ofrecer recursos y apoyar como voluntario o aliado.'],
}

export const privatePages = {
  '/login': 'Iniciar sesión',
  '/actualizar-contrasena': 'Actualizar contraseña',
  '/solicitud': 'Enviar una solicitud',
  '/oli': 'Panel OLI',
  '/oli/perfiles': 'Perfiles OLI',
  '/oli/voluntarios': 'Voluntarios',
}

export function siteOrigin(value = defaultSiteUrl) {
  const url = new URL(value)
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash || /^(localhost|127\.|\[::1\])/.test(url.hostname)) {
    throw new Error('VITE_SEO_SITE_URL debe ser un origen público HTTPS, sin ruta ni credenciales.')
  }
  return url.origin
}

export function metadata(pathname, origin = defaultSiteUrl) {
  const path = pathname.replace(/\/+$/, '') || '/'
  const page = pages[path]
  const title = page?.[0] || `${privatePages[path] || 'Página no encontrada'} | Red Solidaria · Fundación OLI`
  const description = page?.[1] || 'Red Solidaria de Fundación OLI.'
  const url = `${siteOrigin(origin)}${path}`
  return { title, description, url, index: Boolean(page), image: `${siteOrigin(origin)}/membrete-correo.png` }
}

const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])

export function headMarkup(pathname, origin) {
  const meta = metadata(pathname, origin)
  const tags = [
    ['name', 'description', meta.description],
    ['name', 'robots', meta.index ? 'index, follow, max-image-preview:large' : 'noindex, follow'],
    ['property', 'og:type', 'website'],
    ['property', 'og:locale', 'es_PE'],
    ['property', 'og:site_name', 'Red Solidaria · Fundación OLI'],
    ['property', 'og:title', meta.title],
    ['property', 'og:description', meta.description],
    ['property', 'og:url', meta.url],
    ['property', 'og:image', meta.image],
    ['property', 'og:image:alt', 'Red Solidaria, la plataforma de emergencia de Fundación OLI'],
    ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:title', meta.title],
    ['name', 'twitter:description', meta.description],
    ['name', 'twitter:image', meta.image],
  ]
  return `<title data-seo>${escape(meta.title)}</title>\n` +
    tags.map(([attribute, name, content]) => `<meta data-seo ${attribute}="${name}" content="${escape(content)}" />`).join('\n') +
    (meta.index ? `\n<link data-seo rel="canonical" href="${escape(meta.url)}" />` : '') +
    (pathname === '/' ? `\n<script data-seo type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'Red Solidaria', url: meta.url, inLanguage: 'es-PE', publisher: { '@type': 'Organization', name: 'Fundación OLI', url: 'https://olifoundation.org' } }).replace(/</g, '\\u003c')}</script>` : '')
}

export function sitemap(origin) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.keys(pages).map((path) => `<url><loc>${escape(metadata(path, origin).url)}</loc></url>`).join('')}</urlset>\n`
}
