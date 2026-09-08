import test from 'node:test';
import assert from 'node:assert/strict';
import { renderEmail } from './email-templates.mjs';
import { readFileSync } from 'node:fs';
import { requestMessages } from './request-messages.mjs';

test('recepción usa el mensaje general para cada tipo sin anunciar aprobación', () => {
  for (const tipo of Object.keys(requestMessages.approved)) {
    const mail = renderEmail('solicitud_recibida', { tipo, codigo: 'RS-TEST' });
    assert.match(mail.text, /próximas 48 horas/);
    assert.match(mail.text, /no respondas a este mensaje/);
    assert.ok(!mail.text.includes('ha sido activada'));
    assert.ok(!mail.text.includes('podremos atender tu solicitud'));
  }
});

test('aprobaciones conservan el texto proporcionado, firma y membrete al final', () => {
  for (const [tipo, message] of Object.entries(requestMessages.approved)) {
    const mail = renderEmail('cambio_estado', { tipo, estado: 'APROBADA', codigo: 'RS-TEST', direccion: 'Dirección de prueba' });
    for (const line of message.split('\n').map(value => value.trim()).filter(Boolean)) {
      if (line !== '[INFO LLENADA EN EL FORM]') assert.ok(mail.text.includes(line), `${tipo}: ${line}`);
    }
    assert.ok(!mail.text.includes('[INFO LLENADA EN EL FORM]'));
    assert.ok(mail.html.lastIndexOf('membrete-correo.png') > mail.html.indexOf('Articulamos esfuerzos para llegar más lejos.'));
    assert.match(mail.text, /Estado: Aprobada/);
  }
});

test('rechazos específicos y otros estados no anuncian activación', () => {
  for (const [tipo, message] of Object.entries(requestMessages.rejected)) {
    const mail = renderEmail('cambio_estado', { tipo, estado: 'RECHAZADA', observacion: 'Motivo registrado' });
    assert.ok(mail.text.includes(message.split('\n')[1]));
    assert.match(mail.text, /Motivo registrado/);
  }
  for (const estado of ['EN_REVISION', 'OBSERVADA', 'CANCELADA', 'CERRADA', 'ATENDIDA']) {
    const mail = renderEmail('cambio_estado', { tipo: 'EMERGENCIA', estado });
    assert.ok(!mail.text.includes('ha sido activada'));
  }
});

test('material visual y media kit son enlaces; cuentas y CCI se conservan', () => {
  const point = renderEmail('cambio_estado', { tipo: 'PUNTO_ACOPIO', estado: 'APROBADA', direccion: 'Dirección de prueba' });
  assert.match(point.html, /href="https:\/\/drive.google.com\/drive\/folders\/1xgxm5PD9lErgJI4ot78IhOTAEFfUMBDw"/);
  assert.ok(point.text.indexOf('Dirección de prueba') < point.text.indexOf('Para apoyar la difusión'));
  const offer = renderEmail('cambio_estado', { tipo: 'OFERTA_RECURSO', estado: 'APROBADA' });
  assert.match(offer.text, /193-2029045-0-03/);
  assert.match(offer.text, /00219300202904500318/);
});

test('membrete público en confirmaciones y cambios de estado', () => {
  for (const type of ['solicitud_recibida', 'cambio_estado']) {
    const { html } = renderEmail(type, { codigo: 'RS-PRUEBA' });
    assert.match(html, /https:\/\/redsolidaria\.olifoundation\.org\/membrete-correo\.png/);
    assert.ok(html.indexOf('<img ') > html.lastIndexOf('</p>'));
    assert.equal((html.match(/membrete-correo\.png/g) || []).length, 1);
    assert.match(html, /height:auto/);
  }
});

test('plantillas de acceso conservan tokens y muestran el membrete', () => {
  for (const name of ['confirmation', 'email-change', 'invite', 'magic-link', 'reauthentication', 'recovery']) {
    const html = readFileSync(new URL('../../templates/' + name + '.html', import.meta.url), 'utf8');
    assert.match(html, /membrete-correo\.png/);
    assert.ok(html.indexOf('<img') > html.lastIndexOf('</p>'));
    assert.equal((html.match(/membrete-correo\.png/g) || []).length, 1);
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
