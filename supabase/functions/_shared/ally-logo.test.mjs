import test from 'node:test';
import assert from 'node:assert/strict';
import { LOGO_RULES, sniffType, svgProblem, validateLogo } from './ally-logo.mjs';

// Cabeceras mínimas de cada formato con el tamaño indicado (suficientes para leer dimensiones).
const be32 = n => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
const png = (w, h) => new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52, ...be32(w), ...be32(h), 8, 6, 0, 0, 0]);
const jpeg = (w, h) => new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 16, 0x4a, 0x46, 0x49, 0x46, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0xff, 0xc0, 0, 17, 8, h >> 8, h & 255, w >> 8, w & 255, 3, 0, 0, 0, 0, 0, 0]);
const webp = (w, h) => { const c = n => [(n - 1) & 255, ((n - 1) >> 8) & 255, ((n - 1) >> 16) & 255]; return new Uint8Array([...Buffer.from('RIFF'), 30, 0, 0, 0, ...Buffer.from('WEBPVP8X'), 10, 0, 0, 0, 0, 0, 0, 0, ...c(w), ...c(h)]); };
const svg = text => new TextEncoder().encode(text);

test('acepta PNG, JPG, WebP y SVG dentro de las reglas y devuelve sus dimensiones', () => {
  assert.deepEqual(validateLogo({ bytes: png(600, 200), declaredType: 'image/png' }), { type: 'image/png', width: 600, height: 200 });
  assert.deepEqual(validateLogo({ bytes: jpeg(400, 400), declaredType: 'image/jpeg' }), { type: 'image/jpeg', width: 400, height: 400 });
  assert.deepEqual(validateLogo({ bytes: webp(1000, 250), declaredType: 'image/webp' }), { type: 'image/webp', width: 1000, height: 250 });
  assert.deepEqual(validateLogo({ bytes: svg('<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40"><rect width="120" height="40"/></svg>'), declaredType: 'image/svg+xml' }), { type: 'image/svg+xml', width: 120, height: 40 });
});
test('explica el motivo exacto cuando el logo no cumple', () => {
  assert.throws(() => validateLogo({ bytes: png(600, 200), size: LOGO_RULES.maxBytes + 1 }), /pesa 1\.00 MB; el máximo es 1 MB/);
  assert.throws(() => validateLogo({ bytes: png(150, 100) }), /mide 150 × 100 px; el mínimo es 200 × 80 px/);
  assert.throws(() => validateLogo({ bytes: png(200, 400) }), /proporción del logo es 0\.50:1/);
  assert.equal(validateLogo({ bytes: png(498, 499) }).width, 498);
  assert.throws(() => validateLogo({ bytes: png(1200, 100) }), /proporción del logo es 12\.00:1/);
  assert.throws(() => validateLogo({ bytes: new TextEncoder().encode('GIF89a......') }), /Formato no permitido/);
  assert.throws(() => validateLogo({ bytes: png(600, 200), declaredType: 'image/webp' }), /no coincide/);
  assert.throws(() => validateLogo({ bytes: new Uint8Array() }), /vacío/);
  assert.throws(() => validateLogo({ bytes: svg('<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>') }), /no indica su tamaño/);
});
test('rechaza SVG con código o recursos externos', () => {
  assert.match(svgProblem('<svg><script>alert(1)</script></svg>'), /script/);
  assert.match(svgProblem('<svg onload="x()"></svg>'), /eventos/);
  assert.match(svgProblem('<svg><a href="javascript:x()"/></svg>'), /javascript/);
  assert.match(svgProblem('<svg><foreignObject></foreignObject></svg>'), /foreignObject/);
  assert.match(svgProblem('<svg><image href="https://otro.sitio/logo.png"/></svg>'), /externos/);
  assert.equal(svgProblem('<svg xmlns:xlink="http://www.w3.org/1999/xlink"><use xlink:href="#a"/><image href="data:image/png;base64,AAAA"/></svg>'), '');
  assert.equal(sniffType(svg('﻿<!-- logo --><svg width="10" height="5"></svg>')), 'image/svg+xml');
});
