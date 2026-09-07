import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mapAddress } from './mapAddress.mjs';
const catalog = JSON.parse(readFileSync(new URL('../data/ubigeo.json', import.meta.url)));
test('completa región, provincia y distrito de Lima', () => {
  const result = mapAddress({ address: { country_code:'pe', state:'Lima', county:'Provincia de Lima', suburb:'Miraflores' }, display_name:'Dirección elegida' }, catalog);
  assert.deepEqual(result, { region:'LIMA', province:'LIMA', district:'MIRAFLORES', address:'Dirección elegida' });
});
test('reconoce tildes y prefijos administrativos', () => {
  const result = mapAddress({ address: { state:'Región de Áncash', county:'Provincia de Huaraz', district:'Distrito de Independencia' } }, catalog);
  assert.equal(result.region, 'ANCASH'); assert.equal(result.province, 'HUARAZ'); assert.equal(result.district, 'INDEPENDENCIA');
});
test('no conserva ni inventa datos cuando faltan', () => {
  assert.deepEqual(mapAddress({}, catalog), { region:'', province:'', district:'', address:'' });
  assert.equal(mapAddress({ address:{ state:'Lima', county:'Desconocida', suburb:'Miraflores' } }, catalog).district, '');
});
test('no asigna un ubigeo peruano a otro país', () => {
  assert.equal(mapAddress({ address:{ country_code:'us', state:'Lima' } }, catalog).region, '');
});
