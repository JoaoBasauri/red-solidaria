import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fields } from './requestValidation.mjs';
import { options } from './requestOptions.mjs';
import { geocodeRows, MAP_TYPES, MAX_IMPORT_ROWS, parseImportRows, templateColumns } from './requestImport.mjs';
const catalog = JSON.parse(readFileSync(new URL('../data/ubigeo.json', import.meta.url)));
const emergencies = [{ id: '11111111-1111-1111-1111-111111111111', codigo: 'RS-2026-0001', asunto: 'Huayco en Chosica' }];
const context = { catalog, emergencies };
// Respuesta simulada del servicio de mapas (sin llamar a OpenStreetMap en las pruebas).
const lince = { display_name: 'Av. Prueba 123, Lince, Lima, Perú', address: { country_code: 'pe', state: 'Lima', county: 'Provincia de Lima', suburb: 'Lince' } };
const geo = { catalog, reverse: async () => lince, interval: 0 };
const general = { 'Nombre del solicitante *': 'Persona de prueba', 'Correo *': 'test@example.invalid', 'Teléfono *': 999000000, 'Descripción *': 'Descripción válida', 'Región *': 'lima', 'Provincia *': 'Lima', 'Distrito *': 'lince', 'Autoriza tratamiento de datos *': 'Sí' };
// Fila completa generada desde la plantilla: cada columna obligatoria recibe un valor válido.
function row(type, overrides = {}) {
  const columns = templateColumns(type, context);
  const values = Object.fromEntries(Object.entries(general).filter(([header]) => columns.some(column => column.header === header)));
  for (const column of columns) {
    if (column.general && !(column.header in values)) values[column.header] = { 'Dirección': 'Av. Prueba 123', 'Latitud': -12.05, 'Longitud': -77.03, 'Confirma veracidad de la información': 'si' }[column.label] ?? '';
    if (!column.general && column.required) values[column.header] = column.key === 'emergencia_interes' ? 'Indistinto' : ['cobertura', 'region_entrega'].includes(column.key) ? 'Lima' : column.key === 'zona_preferida' ? 'Lince · Lima · Lima' : options[column.key]?.[0] ?? { number: 3, date: 46272, time: 0.5, email: 'contacto@example.invalid' }[column.inputType] ?? (column.key === 'dni' ? 1234567 : 'Prueba');
  }
  return { ...values, ...overrides };
}
for (const type of Object.keys(fields)) test(`${type}: la plantilla genera filas válidas`, async () => {
  const headers = templateColumns(type, context).map(column => column.header);
  assert.equal(new Set(headers).size, headers.length);
  const parsed = parseImportRows(type, [row(type)], context);
  const rows = MAP_TYPES.includes(type) ? await geocodeRows(parsed.rows, geo) : parsed.rows;
  assert.equal(rows[0].error, '');
  assert.equal(rows[0].form.region, 'LIMA');
  assert.equal(rows[0].form.district, 'LINCE');
});
test('convierte fechas, horas, DNI y opciones sin distinguir tildes ni mayúsculas', () => {
  const emergency = parseImportRows('EMERGENCIA', [row('EMERGENCIA', { 'Fecha de la emergencia *': '05/09/2026', 'Hora en que ocurrió (hora de Perú) *': 0.75, 'Principales necesidades identificadas *': 'agua; ALIMENTACION;Agua', 'Tipo de emergencia *': 'inundacion' })], context).rows[0];
  assert.equal(emergency.error, '');
  assert.deepEqual([emergency.form.details.fecha_emergencia, emergency.form.details.hora_emergencia, emergency.form.details.necesidades_urgentes, emergency.form.details.tipo_emergencia], ['2026-09-05', '18:00', 'Agua; Alimentación', 'Inundación']);
  const volunteer = parseImportRows('VOLUNTARIO', [row('VOLUNTARIO', { 'Emergencia de interés': 'x', '¿A qué emergencia te gustaría sumarte? *': 'rs-2026-0001' })], context);
  assert.equal(volunteer.rows[0].form.details.dni, '01234567');
  assert.equal(volunteer.rows[0].form.details.emergencia_interes, emergencies[0].id);
  assert.equal(volunteer.rows[0].form.details.emergencia_interes_nombre, 'RS-2026-0001 · Huayco en Chosica');
  assert.deepEqual(volunteer.unknown, ['Emergencia de interés']);
});
test('aplica campos condicionales de persona y organización', () => {
  const person = parseImportRows('ALIADO', [row('ALIADO', { '¿Te registras como organización o persona? *': 'Persona', 'Clasificación de la organización (si aplica)': 'ONG', 'Edad (si aplica)': '' })], context).rows[0];
  assert.match(person.error, /Edad/);
  const complete = parseImportRows('ALIADO', [row('ALIADO', { '¿Te registras como organización o persona? *': 'Persona', 'Clasificación de la organización (si aplica)': 'ONG', 'Edad (si aplica)': 30, 'DNI (si aplica)': '12345678', 'Disponibilidad presencial (si aplica)': 'Tardes' })], context).rows[0];
  assert.equal(complete.error, '');
  assert.equal(complete.form.details.clasificacion, undefined);
});
test('informa errores por fila sin detener las demás', () => {
  const { rows } = parseImportRows('KIT', [row('KIT'), row('KIT', { 'Distrito *': 'Miraflores', 'Provincia *': 'Callao' }), row('KIT', { 'Autoriza tratamiento de datos *': 'No' }), row('KIT', { 'Cantidad de kits *': 'diez' })], context);
  assert.equal(rows[0].error, '');
  assert.match(rows[1].error, /Provincia/);
  assert.match(rows[2].error, /autorizar/);
  assert.match(rows[3].error, /número/);
});
test('rechaza archivos sin las columnas de la plantilla o con demasiadas filas', () => {
  assert.throws(() => parseImportRows('KIT', [{ Nombre: 'Prueba' }], context), /Faltan columnas/);
  assert.throws(() => parseImportRows('KIT', Array.from({ length: MAX_IMPORT_ROWS + 1 }, () => row('KIT')), context), /máximo/);
});
test('en los tipos con mapa la ubicación sale de las coordenadas e ignora columnas antiguas', async () => {
  const headers = templateColumns('PUNTO_ACOPIO', context).map(column => column.label);
  assert.ok(headers.includes('Latitud') && headers.includes('Longitud'));
  assert.ok(!['Región', 'Provincia', 'Distrito', 'Dirección'].some(label => headers.includes(label)));
  assert.ok(templateColumns('KIT', context).some(column => column.label === 'Región'));
  const legacy = row('PUNTO_ACOPIO', { 'Región *': 'Cusco', 'Provincia *': 'X', 'Distrito *': 'Y', 'Dirección *': 'Otra dirección' });
  const parsed = parseImportRows('PUNTO_ACOPIO', [legacy], context);
  assert.deepEqual(parsed.unknown, []);
  assert.equal(parsed.rows[0].pending, true);
  const calls = [];
  const [point] = await geocodeRows(parsed.rows, { ...geo, reverse: async (lat, lng) => { calls.push([lat, lng]); return lince; } });
  assert.deepEqual(calls, [['-12.05', '-77.03']]);
  assert.deepEqual([point.error, point.form.region, point.form.province, point.form.district, point.form.address], ['', 'LIMA', 'LIMA', 'LINCE', lince.display_name]);
});
test('acepta coma decimal y las dos coordenadas pegadas en la celda de latitud', () => {
  const comma = parseImportRows('EMERGENCIA', [row('EMERGENCIA', { 'Latitud *': '-12,08712', 'Longitud *': '-77,03645' })], context).rows[0];
  assert.deepEqual([comma.error, comma.form.latitude, comma.form.longitude], ['', '-12.08712', '-77.03645']);
  const pair = parseImportRows('EMERGENCIA', [row('EMERGENCIA', { 'Latitud *': '-12.08712, -77.03645', 'Longitud *': '' })], context).rows[0];
  assert.deepEqual([pair.error, pair.form.latitude, pair.form.longitude], ['', '-12.08712', '-77.03645']);
});
test('rechaza coordenadas fuera de Perú explicando el error probable', () => {
  const error = (lat, lng) => parseImportRows('PUNTO_ACOPIO', [row('PUNTO_ACOPIO', { 'Latitud *': lat, 'Longitud *': lng })], context).rows[0].error;
  assert.match(error(-77.03, -12.05), /invertidas/);
  assert.match(error(12.05, -77.03), /signo negativo/);
  assert.match(error(-12.05, 77.03), /signo negativo/);
  assert.match(error(40.4, -3.7), /fuera de Perú/);
  assert.match(error('', -77.03), /Falta la latitud/);
  assert.match(error('abc', -77.03), /número decimal/);
});
test('geocodificación: errores por fila, caché de coordenadas repetidas y progreso', async () => {
  const rows = parseImportRows('EMERGENCIA', [row('EMERGENCIA'), row('EMERGENCIA'), row('EMERGENCIA', { 'Latitud *': -13.5, 'Longitud *': -71.9 }), row('EMERGENCIA', { 'Latitud *': -9.1, 'Longitud *': -78.5 }), row('EMERGENCIA', { 'Personas afectadas *': 'muchas' })], context).rows;
  const calls = [], progress = [];
  const reverse = async (lat) => { calls.push(lat); if (lat === '-13.5') return { address: { country_code: 'pe', state: 'Cusco' } }; if (lat === '-9.1') throw new Error('red'); return lince; };
  const result = await geocodeRows(rows, { catalog, reverse, interval: 0, onProgress: (done, total) => progress.push(`${done}/${total}`) });
  assert.deepEqual(calls, ['-12.05', '-13.5', '-9.1']);
  assert.deepEqual(progress, ['1/4', '2/4', '3/4', '4/4']);
  assert.deepEqual(result.map(item => item.error === ''), [true, true, false, false, false]);
  assert.match(result[2].error, /CUSCO, pero no identificó la provincia/);
  assert.match(result[3].error, /No se pudo consultar el mapa/);
  assert.match(result[4].error, /número/);
  assert.equal(await geocodeRows(rows, { catalog, reverse, interval: 0, cancelled: () => true }), null);
});
