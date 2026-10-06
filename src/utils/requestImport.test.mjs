import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fields } from './requestValidation.mjs';
import { options } from './requestOptions.mjs';
import { MAX_IMPORT_ROWS, parseImportRows, templateColumns } from './requestImport.mjs';
const catalog = JSON.parse(readFileSync(new URL('../data/ubigeo.json', import.meta.url)));
const emergencies = [{ id: '11111111-1111-1111-1111-111111111111', codigo: 'RS-2026-0001', asunto: 'Huayco en Chosica' }];
const context = { catalog, emergencies };
const general = { 'Nombre del solicitante *': 'Persona de prueba', 'Correo *': 'test@example.invalid', 'Teléfono *': 999000000, 'Descripción *': 'Descripción válida', 'Región *': 'lima', 'Provincia *': 'Lima', 'Distrito *': 'lince', 'Autoriza tratamiento de datos *': 'Sí' };
// Fila completa generada desde la plantilla: cada columna obligatoria recibe un valor válido.
function row(type, overrides = {}) {
  const values = { ...general };
  for (const column of templateColumns(type, context)) {
    if (column.general && !(column.header in values)) values[column.header] = { 'Dirección': 'Av. Prueba 123', 'Latitud': -12.05, 'Longitud': -77.03, 'Confirma veracidad de la información': 'si' }[column.label] ?? '';
    if (!column.general && column.required) values[column.header] = column.key === 'emergencia_interes' ? 'Indistinto' : ['cobertura', 'region_entrega'].includes(column.key) ? 'Lima' : column.key === 'zona_preferida' ? 'Lince · Lima · Lima' : options[column.key]?.[0] ?? { number: 3, date: 46272, time: 0.5, email: 'contacto@example.invalid' }[column.inputType] ?? (column.key === 'dni' ? 1234567 : 'Prueba');
  }
  return { ...values, ...overrides };
}
for (const type of Object.keys(fields)) test(`${type}: la plantilla genera filas válidas`, () => {
  const headers = templateColumns(type, context).map(column => column.header);
  assert.equal(new Set(headers).size, headers.length);
  const { rows } = parseImportRows(type, [row(type)], context);
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
