import test from 'node:test';
import assert from 'node:assert/strict';
import { renderEmail } from './email-templates.mjs';
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
