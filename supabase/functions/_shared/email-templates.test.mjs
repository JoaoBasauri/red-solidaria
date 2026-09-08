import test from 'node:test';
import assert from 'node:assert/strict';
import { renderEmail } from './email-templates.mjs';
import { readFileSync } from 'node:fs';

test('membrete público en confirmaciones y cambios de estado', () => {
  for (const type of ['solicitud_recibida', 'cambio_estado']) {
    const { html } = renderEmail(type, { codigo: 'RS-PRUEBA' });
    assert.match(html, /https:\/\/red-solidaria-eta\.vercel\.app\/membrete-correo\.png/);
    assert.ok(html.indexOf('<img ') < html.indexOf('<h1 '));
    assert.match(html, /height:auto/);
  }
});

test('plantillas de acceso conservan tokens y muestran el membrete', () => {
  for (const name of ['confirmation', 'email-change', 'invite', 'magic-link', 'reauthentication', 'recovery']) {
    const html = readFileSync(new URL('../../templates/' + name + '.html', import.meta.url), 'utf8');
    assert.match(html, /membrete-correo\.png/);
    assert.ok(html.includes(name === 'reauthentication' ? '{{ .Token }}' : '{{ .ConfirmationURL }}'));
  }
});
test('confirmación incluye descripción y detalle y escapa HTML', () => {
  const mail = renderEmail('solicitud_recibida', { codigo:'RS-1', tipo:'EMERGENCIA', descripcion:'<script>alert(1)</script>', detalle:{ poblacion_afectada:85, necesidades_urgentes:'Agua', secreto_interno:'NO PUBLICAR' } });
  assert.match(mail.text, /Personas afectadas: 85/);
  assert.match(mail.text, /Necesidades urgentes: Agua/);
  assert.match(mail.html, /&lt;script&gt;/);
  assert.ok(!mail.html.includes('<script>'));
  assert.ok(!mail.text.includes('NO PUBLICAR'));
});
test('estados e introducción en español', () => {
  const mail = renderEmail('cambio_estado', { codigo:'RS-2', estado:'EN_REVISION', observacion:'En proceso de validación' });
  assert.match(mail.text, /Estado: En revisión/);
  assert.match(mail.subject, /Actualización/);
  assert.match(mail.text, /En proceso de validación/);
});
test('rechaza plantillas desconocidas', () => assert.throws(() => renderEmail('unknown')));

test('incluye información ampliada sin divulgar DNI ni edad', () => {
  const mail = renderEmail('solicitud_recibida', {detalle:{familias_afectadas:12,situacion_emergencia:'Activa',plazo_entrega:'1 semana',dni:'87654321',edad:36}});
  assert.match(mail.text, /Familias afectadas: 12/);
  assert.match(mail.text, /Plazo de entrega: 1 semana/);
  assert.ok(!mail.html.includes('87654321'));
  assert.ok(!mail.text.includes('Edad:'));
});
