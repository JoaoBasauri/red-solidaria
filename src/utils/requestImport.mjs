import { extraFields, multiFields, options, visibleField } from './requestOptions.mjs'
import { fields, requestFields, validateRequest } from './requestValidation.mjs'

// Carga masiva de solicitudes desde Excel: columnas de cada plantilla y conversión de filas al formulario público.
export const MAX_IMPORT_ROWS = 500
export const TEMPLATE_SUBJECT = 'red-solidaria:plantilla:'
const MAP_TYPES = ['EMERGENCIA', 'PUNTO_ACOPIO']
const TRUTHFUL_TYPES = ['ALIADO', 'OFERTA_RECURSO', 'VOLUNTARIO']
const YES = ['si', 's', 'yes', 'x', 'true', '1', 'verdadero']
const NO = ['no', 'n', 'false', '0', 'falso']

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
    ['region', 'Región', true, 'Nombre de la región, por ejemplo LIMA.'],
    ['province', 'Provincia', true, 'Provincia de la región indicada.'],
    ['district', 'Distrito', true, 'Distrito de la provincia indicada.'],
    ['address', 'Dirección', type === 'PUNTO_ACOPIO', 'Dirección referencial.'],
    ...(MAP_TYPES.includes(type) ? [
      ['latitude', 'Latitud', true, 'Número decimal entre -90 y 90, por ejemplo -12.0464.'],
      ['longitude', 'Longitud', true, 'Número decimal entre -180 y 180, por ejemplo -77.0428.'],
    ] : []),
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
  const unknown = firstHeaders.filter(header => !byHeader.has(headerKey(header)) && !header.startsWith('__EMPTY'))
  const missing = columns.filter(column => column.required && !column.conditional && !firstHeaders.some(header => byHeader.get(headerKey(header)) === column))
  if (missing.length) throw new Error(`Faltan columnas de la plantilla: ${missing.map(column => column.label).join(', ')}. Descarga la plantilla de este tipo y vuelve a intentarlo.`)
  if (rows.length > MAX_IMPORT_ROWS) throw new Error(`El archivo tiene ${rows.length} filas. Carga como máximo ${MAX_IMPORT_ROWS} por archivo.`)
  const parsed = rows.map((row, index) => {
    const line = row.__rowNum__ != null ? row.__rowNum__ + 1 : index + 2
    const form = { type, name: '', email: '', phone: '', description: '', region: '', province: '', district: '', address: '', latitude: '', longitude: '', consent: false, details: {} }
    try {
      for (const [header, raw] of Object.entries(row)) {
        const column = byHeader.get(headerKey(header))
        if (!column || !known.has(column.key)) continue
        if (column.key === 'consent') form.consent = yesNo(raw, column.label)
        else if (column.key === 'confirmacion_veracidad') form.details.confirmacion_veracidad = yesNo(raw, column.label)
        else if (column.general) form[column.key] = String(raw ?? '').trim()
        else form.details[column.key] = convertDetail(column, raw, context)
      }
      if (form.region || form.province || form.district) Object.assign(form, resolveLocation(form, context.catalog))
      // Igual que el formulario web: descartar campos que no aplican según las respuestas de la fila.
      const visible = new Set(requestFields(type, form.details).map(([name]) => name))
      for (const key of Object.keys(form.details)) if ((!visible.has(key) && key !== 'confirmacion_veracidad') || form.details[key] === '') delete form.details[key]
      if (form.details.emergencia_interes) form.details.emergencia_interes_nombre = form.details.emergencia_interes === 'Indistinto' ? 'Indistinto' : emergencyLabel((context.emergencies || []).find(item => item.id === form.details.emergencia_interes))
      if (!form.consent) throw new Error('La persona debe autorizar el tratamiento de sus datos (Sí).')
      validateRequest(form)
      return { line, form, error: '' }
    } catch (error) {
      return { line, form, error: error.message }
    }
  })
  return { rows: parsed, unknown }
}

export function emergencyLabel(item) {
  return item ? [item.codigo || 'Emergencia', item.asunto || item.distrito || 'Sin título'].join(' · ') : 'Indistinto'
}
