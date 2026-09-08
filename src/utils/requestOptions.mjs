export const classifications = ['ONG', 'Empresa', 'Corporativo', 'Iniciativa (grupo de personas organizadas)']
export const contributions = ['Aliado en territorio', 'Punto de acopio', 'Aliado logístico', 'Aliado donante', 'Aliado técnico', 'Voluntario', 'Otros']
export const options = {
  tipo_emergencia: ['Huayco', 'Inundación', 'Terremoto', 'Otros'],
  situacion_emergencia: ['Activa', 'Proyectada'],
  necesidades_urgentes: ['Alimentación', 'Agua', 'Herramientas (palas, baldes, etc.)', 'Útiles de aseo personal', 'Abrigo', 'Medicamentos', 'Refugio', 'Otros'],
  tipo_participante: ['Organización', 'Persona'],
  clasificacion: classifications,
  tipo_aliado: contributions,
  plazo_entrega: ['Inmediato', '1 semana', '15 días', 'Un mes', 'En el futuro'],
  tipo_recurso: ['Alimentos', 'Agua', 'Kits de emergencia', 'Equipamiento', 'Espacios de almacenamiento', 'Transporte', 'Servicios profesionales', 'Infraestructura', 'Difusión', 'Voluntariado', 'Recursos económicos', 'Otros'],
  unidad: ['Unidades', 'Kits', 'Cajas', 'Kilogramos', 'Toneladas', 'Litros', 'Metros cúbicos', 'Horas', 'Viajes', 'Soles', 'Otros'],
  disponibilidad: ['Mañanas', 'Tardes', 'Noches', 'Fines de semana', 'Tiempo completo', 'Según coordinación'],
  habilidades: ['Logística', 'Transporte', 'Salud', 'Primeros auxilios', 'Comunicaciones', 'Trabajo comunitario', 'Administración', 'Apoyo técnico', 'Preparación de kits', 'Otros'],
  tipo_kit: ['Kit familiar de emergencia', 'Kit de higiene', 'Kit de alimentos', 'Otros'],
  acopio_abierto_publico: ['Sí', 'No'],
}
export const multiFields = ['necesidades_urgentes', 'tipo_aliado', 'disponibilidad', 'habilidades']
export const extraFields = {
  EMERGENCIA: [
    ['situacion_emergencia', 'Situación de la emergencia', 'text', true],
    ['hora_emergencia', 'Hora en que ocurrió (hora de Perú)', 'time', true],
    ['familias_afectadas', 'Número de familias afectadas', 'number', true, { min: 1 }],
    ['organizacion_contacto', 'Organización de contacto en territorio (si corresponde)', 'text', false],
    ['persona_contacto', 'Persona de contacto en territorio', 'text', true],
    ['correo_contacto', 'Correo de contacto en territorio', 'email', true],
    ['telefono_contacto', 'Teléfono de contacto en territorio', 'tel', true],
    ['enlace_evidencia', 'Enlace a videos u otra información de respaldo', 'url', false],
  ],
  ALIADO: [['tipo_participante', '¿Te registras como organización o persona?', 'text', true], ['clasificacion', 'Clasificación de la organización', 'text', true], ['edad', 'Edad', 'number', true, { min: 1, max: 120 }], ['dni', 'DNI', 'text', true, { pattern: '[0-9]{8}', maxLength: 8, inputMode: 'numeric' }], ['disponibilidad', 'Disponibilidad presencial', 'text', true], ['emergencia_interes', '¿A qué emergencia te gustaría sumarte?', 'text', true], ['acopio_abierto_publico', '¿El establecimiento está abierto al público?', 'text', true], ['acopio_direccion', 'Dirección del punto de acopio', 'text', true], ['acopio_referencia', 'Referencia del punto de acopio', 'text', true], ['acopio_horarios', 'Horarios del punto de acopio', 'text', true]],
  OFERTA_RECURSO: [['tipo_participante', '¿Ofreces como organización o persona?', 'text', true], ['nombre_organizacion', 'Nombre de la organización', 'text', true], ['clasificacion', 'Clasificación de la organización', 'text', true], ['region_entrega', 'Región donde puedes entregar', 'text', true], ['plazo_entrega', '¿Cuándo podrías entregarlo?', 'text', true], ['emergencia_interes', '¿A qué emergencia te gustaría sumarte?', 'text', true]],
  VOLUNTARIO: [['edad', 'Edad', 'number', true, { min: 1, max: 120 }], ['dni', 'DNI', 'text', true, { pattern: '[0-9]{8}', maxLength: 8, inputMode: 'numeric' }], ['emergencia_interes', '¿A qué emergencia te gustaría sumarte?', 'text', true]],
}
export function visibleField(name, values) {
  if (['clasificacion', 'nombre_organizacion'].includes(name)) return values.tipo_participante !== 'Persona'
  if (['edad', 'dni', 'disponibilidad'].includes(name) && values.tipo_participante) return values.tipo_participante === 'Persona'
  if (name.startsWith('acopio_')) return String(values.tipo_aliado || '').split('; ').includes('Punto de acopio')
  return true
}
