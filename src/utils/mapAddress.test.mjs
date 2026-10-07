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
// Estructuras reales devueltas por Nominatim (octubre 2026).
test('Lima Metropolitana sin provincia en OSM se resuelve como provincia de Lima', () => {
  const lince = mapAddress({ address: { suburb:'Lince', city:'Lince', region:'Lima', state_district:'Lima Metropolitana', state:'Lima', country_code:'pe' } }, catalog);
  assert.deepEqual([lince.region, lince.province, lince.district], ['LIMA', 'LIMA', 'LINCE']);
  const chosica = mapAddress({ address: { town:'Chosica', city:'Lurigancho', region:'Lima', state_district:'Lima Metropolitana', state:'Lima', country_code:'pe' } }, catalog);
  assert.deepEqual([chosica.province, chosica.district], ['LIMA', 'LURIGANCHO']);
});
test('deduce la provincia desde el distrito y reconoce Cuzco como Cusco', () => {
  const cusco = mapAddress({ address: { neighbourhood:'San Cristóbal', city:'Cuzco', region:'Cusco', state:'Cusco', country_code:'pe' } }, catalog);
  assert.deepEqual([cusco.region, cusco.province, cusco.district], ['CUSCO', 'CUSCO', 'CUSCO']);
  const callao = mapAddress({ address: { city:'Callao', county:'Callao', state_district:'Lima Metropolitana', state:'Callao', country_code:'pe' } }, catalog);
  assert.deepEqual([callao.region, callao.province, callao.district], ['CALLAO', 'CALLAO', 'CALLAO']);
});
