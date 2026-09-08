import { defaultSiteUrl, headMarkup, pages, privatePages, siteOrigin, sitemap } from './src/utils/seo.mjs'

// Generate route-specific heads for crawlers that do not execute JavaScript.
// The page body remains the React application, not server-rendered content.
export default function seoPlugin() {
  let origin = defaultSiteUrl
  return {
    name: 'red-solidaria-seo',
    enforce: 'post',
    configResolved(config) {
      origin = siteOrigin(config.env.VITE_SEO_SITE_URL || defaultSiteUrl)
    },
    transformIndexHtml(html) {
      return html.replace('<title>Red Solidaria</title>', `<!-- seo:start -->${headMarkup('/', origin)}<!-- seo:end -->`)
    },
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        const html = bundle['index.html']?.source
        if (typeof html !== 'string' || !html.includes('<!-- seo:start -->')) throw new Error('No se pudo generar el HTML SEO')
        for (const path of [...Object.keys(pages), ...Object.keys(privatePages)].filter((path) => path !== '/')) {
          this.emitFile({ type: 'asset', fileName: `_seo${path}.html`, source: html.replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/, `<!-- seo:start -->${headMarkup(path, origin)}<!-- seo:end -->`) })
        }
        this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap(origin) })
        // Allow crawling noindex pages so robots can read the exclusion directive.
        this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n` })
      },
    },
  }
}
