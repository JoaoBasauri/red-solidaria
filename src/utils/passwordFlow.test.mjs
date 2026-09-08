import test from 'node:test'
import assert from 'node:assert/strict'
import { isPasswordFlow } from './passwordFlow.mjs'

test('invitaciones y recuperación llevan al formulario de contraseña', () => {
  assert.equal(isPasswordFlow('#access_token=example&type=invite'), true)
  assert.equal(isPasswordFlow('#type=recovery&access_token=example'), true)
})

test('no redirige sesiones normales ni coincidencias parciales', () => {
  for (const hash of ['', '#type=signup', '#type=magiclink', '#other=type=invite', '#type=invited']) {
    assert.equal(isPasswordFlow(hash), false)
  }
})
