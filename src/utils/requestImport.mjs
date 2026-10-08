import { extraFields, multiFields, options, visibleField } from './requestOptions.mjs'
import { fields, requestFields, validateRequest } from './requestValidation.mjs'
import { mapAddress, reverseGeocode, searchAddress } from './mapAddress.mjs'

// Carga masiva de solicitudes desde Excel: columnas de cada plantilla y conversión de filas al formulario público.
export const MAX_IMPORT_ROWS = 500
export const TEMPLATE_SUBJECT = 'red-solidaria:plantilla:'
export const MAP_TYPES = ['EMERGENCIA', 'PUNTO_ACOPIO']
const TRUTHFUL_TYPES = ['ALIADO', 'OFERTA_RECURSO', 'VOLUNTARIO']
const YES = ['si', 's', 'yes', 'x', 'true', '1', 'verdadero']
const NO = ['no', 'n', 'false', '0', 'falso']
// Rectángulo que contiene a Perú: detecta latitud y longitud invertidas o sin signo negativo.
const PERU = { latitude: [-18.5, 0.1], longitude: [-81.5, -68.5] }
// Columnas que en los tipos con mapa se toman del punto confirmado en el mapa; si vienen en el archivo se ignoran.
const DERIVED_HEADERS = ['region', 'provincia', 'distrito']

export function normalizeText(value) {
  return String(value ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()
}
const headerKey = value => normalizeText(value).replace(/\(si aplica\)|\*/g, '').replace(/[^a-z0-9]+/g, '')

function generalColumns(type) {
  return [
    ['name', 'Nombre del solicitante', true, 'Mínimo 2 caracteres.'],
    ['email', 'Correo', true, 'Correo válido. Recibirá la confirmación de su solicitud.'],
    ['phone', 'Teléfono', true, 'Teléfono de contacto.'],
    ['description', 'Descripción', true, 'Mínimo 5 caracteres.'],
    // En los tipos con mapa cada ubicación se confirma en el mapa al cargar el archivo; región, provincia y distrito salen del punto confirmado.
    ...(MAP_TYPES.includes(type) ? [
      ['address', 'Dirección', false, 'Obligatoria si la fila no trae latitud y longitud. Escribe calle, número, distrito y ciudad, por ejemplo: Jr. Joaquín Bernal 409, Lince, Lima. Con ella se propone el punto en el mapa.'],
      ['latitude', 'Latitud', false, 'Opcional, para ubicar el punto con precisión. Primer número de las coordenadas de Google Maps (clic derecho sobre el lugar exacto y clic en las coordenadas para copiarlas), con punto decimal, por ejemplo -12.08712. En Perú siempre es negativa, entre 0 y -18.'],
      ['longitude', 'Longitud', false, 'Opcional. Segundo número de las coordenadas de Google Maps, por ejemplo -77.03645. En Perú siempre es negativa, entre -68 y -81.'],
    ] : [
      ['region', 'Región', true, 'Nombre de la región, por ejemplo LIMA.'],
      ['province', 'Provincia', true, 'Provincia de la región indicada.'],
      ['district', 'Distrito', true, 'Distrito de la provincia indicada.'],
      ['address', 'Dirección', false, 'Dirección referencial.'],
    ]),
    ['consent', 'Autoriza tratamiento de datos', true, 'Sí o No. Solo se crean filas con Sí.'],
    ...(TRUTHFUL_TYPES.includes(type) ? [['confirmacion_veracidad', 'Confirma veracidad de la información', true, 'Sí o No. Solo se crean filas con Sí.']] : []),
  ].map(([key, label, required, hint]) => ({ key, label, required, conditional: false, hint, general: true }))
}

function fieldHint(name, inputType, { emergencies = [] } = {}) {
  if (name === 'emergencia_interes') return `Indistinto o el código de una emergencia publicada${emergencies.length ? `: ${emergencies.map(item => item.codigo).filter(Boolean).join(', ')}` : ''}.`
  if (name === 'zona_preferida') return 'Distrito · Provincia · Región, por ejemplo LINCE · LIMA · LIMA.'
  if (['cobertura', 'region_entrega'].includes(name)) return 'Nombre de una región, por ejemplo LIMA.'
  if (options[name]) return `${multiFields.includes(name) ? 'Una o varias opciones separadas por punto y coma (;)' : 'Una opción'}: ${options[name].join(' | ')}.`
  if (name === 'dni') return '8 dígitos.'
  return { number: 'Número positivo.', date: 'Fecha DD/MM/AAAA.', time: 'Hora HH:MM (24 horas, hora de Perú).', email: 'Correo válido.', url: 'Enlace, por ejemplo dominio.com.' }[inputType] || 'Texto.'
}

// Columnas de la plantilla de un tipo: datos generales y todos los campos específicos, incluidos los condicionales.
export function templateColumns(type, context = {}) {
  if (!fields[type]) throw new Error('Tipo de solicitud inválido.')
  const specific = [...new Map([...fields[type], ...(extraFields[type] || [])].map(field => [field[0], field])).values()]
  // Escenarios para detectar campos que solo se piden según otra respuesta del mismo tipo (persona/organización, punto de acopio).
  const keys = specific.map(([key]) => key), scenarios = [{}, ...(keys.includes('tipo_participante') ? [{ tipo_participante: 'Persona' }, { tipo_participante: 'Organización' }] : []), ...(keys.includes('tipo_aliado') ? [{ tipo_aliado: 'Punto de acopio' }] : [])]
  return [...generalColumns(type), ...specific.map(([key, label, inputType, required]) => {
    const conditional = new Set(scenarios.map(values => visibleField(key, values))).size > 1
    return { key, label, required, conditional, inputType, hint: fieldHint(key, inputType, context) + (conditional ? ' Solo si aplica según las respuestas anteriores.' : '') }
  })].map(column => ({ ...column, header: `${column.label}${column.required ? (column.conditional ? ' (si aplica)' : ' *') : ''}` }))
}

function excelDate(value) {
  if (typeof value === 'number' && value > 0) return new Date(Math.round((value - 25569) * 86400000)).toISOString().slice(0, 10)
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10)
  const text = String(value ?? '').trim()
  const local = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
  return local ? `${local[3]}-${local[2].padStart(2, '0')}-${local[1].padStart(2, '0')}` : text
}
function excelTime(value) {
  if (typeof value === 'number' && value >= 0) { const minutes = Math.round((value % 1) * 1440) % 1440; return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}` }
  const text = String(value ?? '').trim(), match = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/)
  return match ? `${match[1].padStart(2, '0')}:${match[2]}` : text
}
function yesNo(value, label) {
  const text = normalizeText(value)
  if (YES.includes(text)) return true
  if (!text || NO.includes(text)) return false
  throw new Error(`${label}: escribe Sí o No.`)
}
function matchOption(value, choices, label) {
  const found = choices.find(choice => normalizeText(choice) === normalizeText(value))
  if (!found) throw new Error(`${label}: "${value}" no es una opción válida.`)
  return found
}

function coordinate(value, label) {
  if (typeof value === 'number') return value
  const text = String(value ?? '').trim()
  if (!text) throw new Error(`Falta la ${label.toLowerCase()}.`)
  const number = Number(/^-?\d+,\d+$/.test(text) ? text.replace(',', '.') : text)
  if (!Number.isFinite(number)) throw new Error(`${label}: escribe un número decimal, por ejemplo ${label === 'Latitud' ? '-12.08712' : '-77.03645'}.`)
  return number
}
const inRange = (value, [min, max]) => value >= min && value <= max

// Lee latitud y longitud de la fila y comprueba que caigan en Perú, explicando el error más probable.
function readCoordinates(form) {
  // Si se pegaron las dos coordenadas de Google Maps en la celda de latitud, se separan.
  const pair = String(form.latitude).match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/)
  if (pair && !String(form.longitude).trim()) [form.latitude, form.longitude] = [pair[1], pair[2]]
  if (!String(form.latitude).trim() && !String(form.longitude).trim()) return { latitude: '', longitude: '' }
  const latitude = coordinate(form.latitude, 'Latitud'), longitude = coordinate(form.longitude, 'Longitud')
  if (!inRange(latitude, PERU.latitude) || !inRange(longitude, PERU.longitude)) {
    if (inRange(latitude, PERU.longitude) && inRange(longitude, PERU.latitude)) throw new Error('Latitud y longitud están invertidas: la latitud es el primer número de Google Maps (en Perú entre 0 y -18).')
    if (inRange(-Math.abs(latitude), PERU.latitude) && inRange(-Math.abs(longitude), PERU.longitude)) throw new Error('Falta el signo negativo: en Perú la latitud y la longitud siempre son negativas.')
    throw new Error(`Las coordenadas ${latitude}, ${longitude} están fuera de Perú. Cópialas de nuevo desde Google Maps.`)
  }
  return { latitude: String(latitude), longitude: String(longitude) }
}

function resolveLocation(form, catalog) {
  const find = (items, key, value) => items.find(item => normalizeText(item[key]) === normalizeText(value))
  const department = find(catalog.departments, 'departamento', form.region)
  if (!department) throw new Error(`Región "${form.region}" no encontrada.`)
  const province = find(catalog.provinces.filter(item => item.departamento_id === department.id), 'provincia', form.province)
  if (!province) throw new Error(`Provincia "${form.province}" no pertenece a ${department.departamento}.`)
  const district = find(catalog.districts.filter(item => item.provincia_id === province.id), 'distrito', form.district)
  if (!district) throw new Error(`Distrito "${form.district}" no pertenece a ${province.provincia}.`)
  return { region: department.departamento, province: province.provincia, district: district.distrito }
}

function convertDetail(column, raw, { catalog, emergencies = [] }) {
  const { key, label, inputType } = column
  if (raw === '' || raw == null) return ''
  if (key === 'emergencia_interes') {
    if (normalizeText(raw) === 'indistinto') return 'Indistinto'
    const found = emergencies.find(item => [item.codigo, item.id].some(value => normalizeText(value) === normalizeText(raw)))
    if (!found) throw new Error(`${label}: "${raw}" no es una emergencia publicada. Usa Indistinto o un código válido.`)
    return found.id
  }
  if (['cobertura', 'region_entrega'].includes(key)) return matchOption(raw, catalog.departments.map(item => item.departamento), label)
  if (key === 'zona_preferida') {
    const [district, province, region] = String(raw).split(/[·|,]/).map(part => part.trim())
    if (!district || !province || !region) throw new Error(`${label}: usa el formato Distrito · Provincia · Región.`)
    const place = resolveLocation({ region, province, district }, catalog)
    return [place.district, place.province, place.region].join(' · ')
  }
  if (options[key]) {
    const selected = multiFields.includes(key) ? String(raw).split(/[;\n]/).map(item => item.trim()).filter(Boolean) : [raw]
    return [...new Set(selected.map(item => matchOption(item, options[key], label)))].join('; ')
  }
  if (key === 'dni' && typeof raw === 'number') return String(raw).padStart(8, '0')
  if (inputType === 'date') return excelDate(raw)
  if (inputType === 'time') return excelTime(raw)
  return String(raw).trim()
}

// Convierte las filas leídas del Excel (objetos por encabezado) en formularios listos para crear la solicitud.
export function parseImportRows(type, rows, context) {
  const columns = templateColumns(type, context)
  const byHeader = new Map(columns.flatMap(column => [[headerKey(column.label), column], [headerKey(column.key), column]]))
  const known = new Set(columns.map(column => column.key))
  const firstHeaders = Object.keys(rows[0] || {})
  const mapType = MAP_TYPES.includes(type), derived = header => mapType && DERIVED_HEADERS.includes(headerKey(header))
  const unknown = firstHeaders.filter(header => !byHeader.has(headerKey(header)) && !header.startsWith('__EMPTY') && !derived(header))
  const missing = columns.filter(column => column.required && !column.conditional && !firstHeaders.some(header => byHeader.get(headerKey(header)) === column))
  if (missing.length) throw new Error(`Faltan columnas de la plantilla: ${missing.map(column => column.label).join(', ')}. Descarga la plantilla de este tipo y vuelve a intentarlo.`)
  if (rows.length > MAX_IMPORT_ROWS) throw new Error(`El archivo tiene ${rows.length} filas. Carga como máximo ${MAX_IMPORT_ROWS} por archivo.`)
  const parsed = rows.map((row, index) => {
    const line = row.__rowNum__ != null ? row.__rowNum__ + 1 : index + 2
    const form = { type, name: '', email: '', phone: '', description: '', region: '', province: '', district: '', address: '', latitude: '', longitude: '', consent: false, details: {} }
    try {
      for (const [header, raw] of Object.entries(row)) {
        const column = byHeader.get(headerKey(header))
        if (!column || !known.has(column.key) || derived(header)) continue
        if (column.key === 'consent') form.consent = yesNo(raw, column.label)
        else if (column.key === 'confirmacion_veracidad') form.details.confirmacion_veracidad = yesNo(raw, column.label)
        else if (column.general) form[column.key] = String(raw ?? '').trim()
        else form.details[column.key] = convertDetail(column, raw, context)
      }
      if (mapType) {
        Object.assign(form, readCoordinates(form))
        if (!form.latitude && !form.address) throw new Error('Escribe la dirección o la latitud y longitud del lugar.')
      }
      else if (form.region || form.province || form.district) Object.assign(form, resolveLocation(form, context.catalog))
      // Igual que el formulario web: descartar campos que no aplican según las respuestas de la fila.
      const visible = new Set(requestFields(type, form.details).map(([name]) => name))
      for (const key of Object.keys(form.details)) if ((!visible.has(key) && key !== 'confirmacion_veracidad') || form.details[key] === '') delete form.details[key]
      if (form.details.emergencia_interes) form.details.emergencia_interes_nombre = form.details.emergencia_interes === 'Indistinto' ? 'Indistinto' : emergencyLabel((context.emergencies || []).find(item => item.id === form.details.emergencia_interes))
      if (!form.consent) throw new Error('La persona debe autorizar el tratamiento de sus datos (Sí).')
      // En los tipos con mapa la ubicación se propone con geocodeRows y se confirma en el mapa; aquí se valida el resto de la fila.
      validateRequest(mapType ? { ...form, region: '-', province: '-', district: '-', address: '-', latitude: '0', longitude: '0' } : form)
      return { line, form, error: '', pending: mapType }
    } catch (error) {
      return { line, form, error: error.message, pending: false }
    }
  })
  return { rows: parsed, unknown }
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

// Propone la ubicación de cada fila con mapa: usa sus coordenadas o, si no tiene, busca la dirección en OpenStreetMap.
// Consulta una fila a la vez (máximo 1 por segundo) y reutiliza resultados repetidos. Ninguna fila queda lista sin confirmarse en el mapa.
export async function geocodeRows(rows, { catalog, reverse = reverseGeocode, search = searchAddress, interval = 1100, onProgress = () => {}, cancelled = () => false }) {
  const total = rows.filter(row => row.pending).length, cache = new Map(), result = []
  let done = 0, last = 0
  for (const row of rows) {
    if (!row.pending) { result.push(row); continue }
    if (cancelled()) return null
    const hasPoint = row.form.latitude !== '' && row.form.longitude !== ''
    const key = hasPoint ? `p:${row.form.latitude},${row.form.longitude}` : `q:${normalizeText(row.form.address)}`
    let found = cache.get(key), note = ''
    if (!found) {
      if (last) await sleep(Math.max(0, interval - (Date.now() - last)))
      if (cancelled()) return null
      last = Date.now()
      try {
        const answer = hasPoint ? await reverse(row.form.latitude, row.form.longitude) : await search(row.form.address)
        found = answer ? { place: mapAddress(answer, catalog), latitude: hasPoint ? row.form.latitude : Number(answer.lat).toFixed(6), longitude: hasPoint ? row.form.longitude : Number(answer.lon).toFixed(6) } : { missing: true }
        cache.set(key, found)
      } catch {
        found = { failed: true }
      }
    }
    const place = found.place || {}
    if (found.failed) note = 'No se pudo consultar el mapa. Ubica el punto manualmente.'
    else if (found.missing) note = 'No se encontró la dirección en el mapa. Ubica el punto manualmente.'
    else if (!place.district) note = 'El mapa no identificó el distrito. Revisa el punto al confirmar.'
    const form = { ...row.form, latitude: found.latitude || '', longitude: found.longitude || '', region: place.region || '', province: place.province || '', district: place.district || '', address: row.form.address || place.address || '' }
    result.push({ ...row, form, pending: false, needsConfirm: true, confirmed: false, addressFromFile: Boolean(row.form.address), note })
    onProgress(++done, total)
  }
  return result
}

// Aplica el punto confirmado (o corregido) en el mapa a una fila y la valida completa.
export function confirmLocation(row, location, address) {
  const form = { ...row.form, latitude: String(location.latitude ?? ''), longitude: String(location.longitude ?? ''), region: location.region || '', province: location.province || '', district: location.district || '', address: String(address ?? '').trim() }
  if (!form.latitude || !form.longitude) throw new Error('Ubica el punto en el mapa.')
  Object.assign(form, readCoordinates(form))
  if (!form.region || !form.province || !form.district) throw new Error('Completa la región, provincia y distrito del punto.')
  validateRequest(form)
  return { ...row, form, confirmed: true, note: '' }
}

export function emergencyLabel(item) {
  return item ? [item.codigo || 'Emergencia', item.asunto || item.distrito || 'Sin título'].join(' · ') : 'Indistinto'
}
