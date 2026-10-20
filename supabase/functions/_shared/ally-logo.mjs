// Reglas y validación del logo de una organización aliada. Se usa igual en el navegador y en la función upload-ally-logo.
export const LOGO_RULES = Object.freeze({
  types: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
  maxBytes: 1024 * 1024,
  minWidth: 200,
  minHeight: 80,
  minRatio: 1,
  maxRatio: 5,
})
export const LOGO_ACCEPT = '.png,.jpg,.jpeg,.webp,.svg'
export const LOGO_HELP = 'PNG, JPG, WebP o SVG de hasta 1 MB. Mínimo 200 × 80 px, más ancho que alto (proporción entre 1:1 y 5:1). De preferencia con fondo transparente.'

const u16be = (b, i) => (b[i] << 8) | b[i + 1]
const u16le = (b, i) => b[i] | (b[i + 1] << 8)
const u24le = (b, i) => b[i] | (b[i + 1] << 8) | (b[i + 2] << 16)
const u32be = (b, i) => ((b[i] << 24) >>> 0) + ((b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3])
const ascii = (b, i, n) => String.fromCharCode(...b.slice(i, i + n))

// Tipo real según los primeros bytes del archivo (no se confía en la extensión ni en el tipo declarado).
export function sniffType(bytes) {
  if (bytes.length >= 8 && u32be(bytes, 0) === 0x89504e47 && u32be(bytes, 4) === 0x0d0a1a0a) return 'image/png'
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if (bytes.length >= 12 && ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') return 'image/webp'
  const head = new TextDecoder().decode(bytes.slice(0, 1024)).replace(/^﻿/, '').trimStart()
  if (/^(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*<svg[\s>]/i.test(head)) return 'image/svg+xml'
  return ''
}

function rasterSize(bytes, type) {
  if (type === 'image/png') return bytes.length >= 24 ? { width: u32be(bytes, 16), height: u32be(bytes, 20) } : null
  if (type === 'image/jpeg') {
    // Recorre los segmentos hasta el marcador SOF, que contiene alto y ancho.
    for (let i = 2; i + 9 < bytes.length;) {
      if (bytes[i] !== 0xff) { i++; continue }
      const marker = bytes[i + 1]
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0xff) { i += marker === 0xff ? 1 : 2; continue }
      const length = u16be(bytes, i + 2)
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { width: u16be(bytes, i + 7), height: u16be(bytes, i + 5) }
      i += 2 + length
    }
    return null
  }
  if (type === 'image/webp' && bytes.length >= 30) {
    const chunk = ascii(bytes, 12, 4)
    if (chunk === 'VP8 ') return { width: u16le(bytes, 26) & 0x3fff, height: u16le(bytes, 28) & 0x3fff }
    if (chunk === 'VP8L') { const b = bytes.slice(21, 25); return { width: 1 + (((b[1] & 0x3f) << 8) | b[0]), height: 1 + (((b[3] & 0xf) << 10) | (b[2] << 2) | ((b[1] & 0xc0) >> 6)) } }
    if (chunk === 'VP8X') return { width: 1 + u24le(bytes, 24), height: 1 + u24le(bytes, 27) }
  }
  return null
}

// Un SVG puede llevar código: se rechaza cualquier script, manejador de eventos o recurso externo.
export function svgProblem(text) {
  if (/<script[\s>]/i.test(text)) return 'El SVG contiene código (script) y no se puede usar.'
  if (/\son[a-z]+\s*=/i.test(text)) return 'El SVG contiene eventos (on...) y no se puede usar.'
  if (/javascript:/i.test(text)) return 'El SVG contiene enlaces javascript: y no se puede usar.'
  if (/<foreignObject[\s>]/i.test(text)) return 'El SVG contiene contenido HTML incrustado (foreignObject) y no se puede usar.'
  if (/<!ENTITY|<!DOCTYPE/i.test(text)) return 'El SVG contiene declaraciones DOCTYPE o ENTITY y no se puede usar.'
  if (/(?:xlink:)?href\s*=\s*["']\s*(?!#|data:image\/)/i.test(text)) return 'El SVG enlaza archivos externos; incrusta las imágenes o conviértelo a PNG.'
  return ''
}

function svgSize(text) {
  const tag = text.match(/<svg\b[^>]*>/i)?.[0] || ''
  const attr = name => tag.match(new RegExp(`\\s${name}\\s*=\\s*["']([^"']+)["']`, 'i'))?.[1]
  const px = value => { const m = String(value || '').trim().match(/^([\d.]+)(px)?$/); return m ? Number(m[1]) : NaN }
  let width = px(attr('width')), height = px(attr('height'))
  const box = (attr('viewBox') || '').trim().split(/[\s,]+/).map(Number)
  if ((!Number.isFinite(width) || !Number.isFinite(height)) && box.length === 4 && box.every(Number.isFinite)) [width, height] = [box[2], box[3]]
  return Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0 ? { width, height } : null
}

// Valida tipo, peso, dimensiones y proporción. Devuelve { type, width, height } o lanza un Error con el motivo exacto.
export function validateLogo({ bytes, size = bytes?.length, declaredType = '', rules = LOGO_RULES }) {
  if (!bytes?.length || !size) throw new Error('El archivo está vacío.')
  if (size > rules.maxBytes) throw new Error(`El logo pesa ${(size / 1024 / 1024).toFixed(2)} MB; el máximo es ${rules.maxBytes / 1024 / 1024} MB.`)
  const type = sniffType(bytes)
  if (!rules.types.includes(type)) throw new Error('Formato no permitido. Usa PNG, JPG, WebP o SVG.')
  if (declaredType && declaredType !== type && !(declaredType === 'image/jpg' && type === 'image/jpeg')) throw new Error('El contenido del archivo no coincide con su formato. Vuelve a exportarlo como PNG, JPG, WebP o SVG.')
  let dimensions
  if (type === 'image/svg+xml') {
    const text = new TextDecoder().decode(bytes)
    const problem = svgProblem(text)
    if (problem) throw new Error(problem)
    dimensions = svgSize(text)
    if (!dimensions) throw new Error('El SVG no indica su tamaño (width/height o viewBox).')
  } else {
    dimensions = rasterSize(bytes, type)
    if (!dimensions) throw new Error('No se pudo leer el tamaño de la imagen. Vuelve a exportarla.')
    // Los SVG son vectoriales: el mínimo en píxeles solo aplica a imágenes rasterizadas.
    if (dimensions.width < rules.minWidth || dimensions.height < rules.minHeight) throw new Error(`El logo mide ${dimensions.width} × ${dimensions.height} px; el mínimo es ${rules.minWidth} × ${rules.minHeight} px.`)
  }
  // Tolerancia del 2 % para logos casi cuadrados (por ejemplo 498 × 499 px) o exportados con redondeo.
  const ratio = dimensions.width / dimensions.height
  if (ratio < rules.minRatio * 0.98 || ratio > rules.maxRatio * 1.02) throw new Error(`La proporción del logo es ${ratio.toFixed(2)}:1; debe estar entre ${rules.minRatio}:1 (cuadrado) y ${rules.maxRatio}:1 (horizontal).`)
  return { type, width: Math.round(dimensions.width), height: Math.round(dimensions.height) }
}
