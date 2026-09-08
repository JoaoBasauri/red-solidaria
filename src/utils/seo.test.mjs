import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { pages, privatePages, headMarkup, metadata, sitemap, siteOrigin, defaultSiteUrl } from './seo.mjs'

test('public pages have unique Spanish titles, descriptions and canonical URLs', () => {
  assert.equal(new Set(Object.values(pages).map(([title]) => title)).size, 9)
  for (const path of Object.keys(pages)) {
    const meta = metadata(path)
    assert.ok(meta.index)
    assert.ok(meta.description.length > 60)
    assert.equal(meta.url, defaultSiteUrl + path)
    assert.match(headMarkup(path), /rel="canonical"/)
  }
})

test('private and unknown routes are noindex and excluded from sitemap', () => {
  for (const path of [...Object.keys(privatePages), '/no-existe']) {
    assert.equal(metadata(path).index, false)
    assert.match(headMarkup(path), /noindex, follow/)
    assert.doesNotMatch(headMarkup(path), /rel="canonical"/)
    assert.ok(!sitemap(defaultSiteUrl).includes(`${defaultSiteUrl}${path}<`))
  }
})

test('canonical domain is configurable independently from localhost auth settings', () => {
  assert.equal(siteOrigin('https://red.example.org/'), 'https://red.example.org')
  assert.match(sitemap('https://red.example.org'), /https:\/\/red.example.org\/emergencias/)
  for (const bad of ['http://localhost:5173', 'https://localhost', 'https://site.org/path', 'https://user:password@site.org', 'https://site.org?token=secret']) {
    assert.throws(() => siteOrigin(bad))
  }
})

test('built pages serve route heads before JavaScript and Vercel maps every route', () => {
  const config = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url)))
  for (const path of [...Object.keys(pages), ...Object.keys(privatePages)]) {
    const filename = path === '/' ? 'index.html' : `_seo${path}.html`
    const html = readFileSync(new URL(`../../dist/${filename}`, import.meta.url), 'utf8')
    assert.equal((html.match(/<title/g) || []).length, 1)
    assert.ok(html.includes(metadata(path).title))
    assert.match(html, /assets\/index-.*\.js/)
    assert.ok(html.includes(metadata(path).index ? 'index, follow, max-image-preview:large' : 'noindex, follow'))
    if (path !== '/') assert.ok(config.rewrites.some((rule) => rule.source === path && rule.destination === `/${filename}`))
  }
  const xml = readFileSync(new URL('../../dist/sitemap.xml', import.meta.url), 'utf8')
  assert.equal((xml.match(/<loc>/g) || []).length, 9)
  const robots = readFileSync(new URL('../../dist/robots.txt', import.meta.url), 'utf8')
  assert.match(robots, /Sitemap: https:\/\//)
})
