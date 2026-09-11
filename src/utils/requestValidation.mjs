import { extraFields, multiFields, options, visibleField } from './requestOptions.mjs'

export const fields = {
  EMERGENCIA: [
    ['tipo_emergencia','Tipo de emergencia','text',true],
    ['fecha_emergencia','Fecha de la emergencia','date',true],
    ['poblacion_afectada','Personas afectadas','number',true,{min:1}],
    ['necesidades_urgentes','Principales necesidades identificadas','text',true],
  ],
  KIT: [
    ['cantidad_solicitada','Cantidad de kits','number',true,{min:1}],
    ['poblacion_beneficiaria','Personas beneficiarias','number',true,{min:1}],
    ['fecha_necesidad','Fecha en que se necesitan','date',true],
    ['condiciones_especiales','Condiciones especiales','text',false],
  ],
  OFERTA_RECURSO: [
    ['tipo_recurso','Tipo de recurso','text',true],
    ['descripcion_recurso','Descripción del recurso','text',true],
    ['cantidad','Cantidad','number',false,{min:0.01,step:0.01}],
    ['unidad','Unidad de medida','text',false],
    ['disponibilidad_desde','Disponible desde','date',false],
    ['disponibilidad_hasta','Disponible hasta','date',false],
  ],
  ALIADO: [
    ['tipo_aliado','Tipo de aliado','text',true],
    ['nombre_organizacion','Nombre de la organización','text',true],
    ['cobertura','Zona o cobertura','text',true],
    ['capacidades','Capacidades que ofrece','text',true],
    ['sitio_web','Sitio web','url',false],
  ],
  VOLUNTARIO: [
    ['disponibilidad','Disponibilidad','text',true],
    ['habilidades','Habilidades','text',true],
    ['zona_preferida','Zona donde puede apoyar','text',true],
    ['fecha_nacimiento','Fecha de nacimiento','date',false],
  ],
  PUNTO_ACOPIO: [
    ['nombre_propuesto','Nombre propuesto del punto','text',true],
    ['responsable_nombre','Responsable del punto','text',true],
    ['responsable_telefono','Teléfono del responsable','tel',true],
    ['horario_propuesto','Horario propuesto','text',true],
    ['fecha_inicio','Fecha de inicio','date',false],
    ['fecha_fin','Fecha de cierre','date',false],
    ['capacidad_descripcion','Capacidad y condiciones del local','text',false],
  ],
}

export function requestFields(type, values = {}) {
  return [...(fields[type] || []), ...(extraFields[type] || [])].filter(([name]) => visibleField(name, values))
}

export function normalizeRequestUrl(value) {
  const text = String(value ?? '').trim();
  if (!text) return '';
  if (/[\s\\]/.test(text)) throw new Error('Enlace inválido');
  const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(text) ? text : `https://${text}`);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
      !/^(?:[a-z\d](?:[a-z\d-]*[a-z\d])?\.)+[a-z\d](?:[a-z\d-]*[a-z\d])?$/i.test(url.hostname)) {
    throw new Error('Enlace inválido');
  }
  return url.href;
}

export function normalizeRequestLinks(form) {
  const details = { ...form.details };
  for (const [name,,type] of requestFields(form.type, details)) {
    if (type === 'url' && details[name] != null) details[name] = normalizeRequestUrl(details[name]);
  }
  return { ...form, details };
}

export function validateRequest(form) {
  if (!fields[form.type]) throw new Error('Tipo de solicitud inválido.');
  if ((form.name || '').trim().length < 2) throw new Error('El nombre debe tener al menos 2 caracteres.');
  if ((form.description || '').trim().length < 5) throw new Error('La descripción debe tener al menos 5 caracteres.');
  if (!form.consent) throw new Error('Debes autorizar el tratamiento de tus datos.');
  if (!(form.phone || '').trim()) throw new Error('Ingresa un teléfono de contacto.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email || '')) throw new Error('Ingresa un correo válido.');
  const d = form.details || {};
  for (const [name, label, type, required] of requestFields(form.type, d)) {
    const value = d[name];
    if (value == null || String(value).trim() === '') { if (required) throw new Error(`Completa: ${label}.`); continue; }
    if (type === 'number' && (!Number.isFinite(Number(value)) || Number(value) <= 0 || (name !== 'cantidad' && !Number.isInteger(Number(value))))) throw new Error(`${label}: ingresa un número positivo${name !== 'cantidad' ? ' entero' : ''}.`);
    if (name === 'cantidad' && Number(value) < 0.01) throw new Error('La cantidad mínima es 0.01.');
    if (options[name]) {
      const selected = multiFields.includes(name) ? String(value).split('; ') : [value];
      if (selected.some(item => !options[name].includes(item))) throw new Error(`${label}: selecciona una opción válida.`);
    }
    if (name === 'dni' && !/^\d{8}$/.test(value)) throw new Error('El DNI debe tener 8 dígitos.');
    if (name === 'edad' && Number(value) > 120) throw new Error('Ingresa una edad válida.');
    if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new Error(`${label}: correo inválido.`);
    if (type === 'time' && !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new Error('Ingresa una hora válida.');
    if (type === 'url') { try { normalizeRequestUrl(value); } catch { throw new Error(`${label}: ingresa un enlace válido, por ejemplo dominio.com.`); } }
    if (type === 'date' && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString().slice(0,10) !== value)) throw new Error(`${label}: fecha inválida.`);
  }
  if (!form.region || !form.province || !form.district) throw new Error('Selecciona región, provincia y distrito.');
  if (['ALIADO', 'OFERTA_RECURSO', 'VOLUNTARIO'].includes(form.type) && !d.confirmacion_veracidad) throw new Error('Confirma que la información es verdadera.');
  for (const [start,end] of [['disponibilidad_desde','disponibilidad_hasta'],['fecha_inicio','fecha_fin']]) {
    if (d[start] && d[end] && d[end] < d[start]) throw new Error('La fecha final no puede ser anterior a la fecha inicial.');
  }
  if (['EMERGENCIA','PUNTO_ACOPIO'].includes(form.type)) {
    if (form.latitude == null || form.longitude == null || form.latitude === '' || form.longitude === '' || !Number.isFinite(Number(form.latitude)) || !Number.isFinite(Number(form.longitude)) || Math.abs(Number(form.latitude)) > 90 || Math.abs(Number(form.longitude)) > 180) throw new Error('Selecciona una ubicación válida en el mapa.');
  }
  if (form.type === 'PUNTO_ACOPIO' && !(form.address || '').trim()) throw new Error('Ingresa la dirección del punto de acopio.');
}
