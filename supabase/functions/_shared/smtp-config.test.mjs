import test from 'node:test';
import assert from 'node:assert/strict';
import { smtpConfig } from './smtp-config.mjs';
const valid = { MAIL_ENABLED:'true', SMTP_HOST:'smtp.example.org', SMTP_USER:'test', SMTP_PASSWORD:'test-only', MAIL_FROM_EMAIL:'notifications@example.org' };
test('no envía por defecto', () => assert.equal(smtpConfig(() => undefined), null));
test('exige credenciales al activar', () => assert.throws(() => smtpConfig(key => ({ MAIL_ENABLED:'true' })[key])));
test('587 exige STARTTLS y certificado válido', () => {
  const c = smtpConfig(key => valid[key]);
  assert.equal(c.transport.requireTLS, true); assert.equal(c.transport.secure, false);
  assert.equal(c.transport.tls.rejectUnauthorized, true);
});
test('465 utiliza TLS desde la conexión', () => assert.equal(smtpConfig(key => ({ ...valid, SMTP_PORT:'465' })[key]).transport.secure, true));
test('rechaza remitente con inyección y puerto inseguro', () => {
  assert.throws(() => smtpConfig(key => ({ ...valid, MAIL_FROM_EMAIL:'a@b.org\r\nBcc: x@y.org' })[key]));
  assert.throws(() => smtpConfig(key => ({ ...valid, SMTP_PORT:'25' })[key]));
});
