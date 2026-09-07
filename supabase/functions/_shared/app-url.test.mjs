import test from 'node:test';
import assert from 'node:assert/strict';
import { passwordRedirect } from './app-url.mjs';
test('usa la base configurada y normaliza barra final',()=>{
  assert.equal(passwordRedirect('https://example.org/'), 'https://example.org/actualizar-contrasena');
  assert.equal(passwordRedirect('https://example.org/red/'), 'https://example.org/red/actualizar-contrasena');
});
test('no envía enlaces sin configuración o hacia localhost',()=>{
  for (const url of ['',undefined,'http://localhost:5173','https://localhost','https://127.0.0.1','https://[::1]','https://user:password@example.org','https://example.org/?next=bad']) assert.throws(()=>passwordRedirect(url));
});
