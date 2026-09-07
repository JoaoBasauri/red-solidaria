const types = { EMERGENCIA: 'Reporte de emergencia', KIT: 'Solicitud de kits', OFERTA_RECURSO: 'Oferta de recursos', ALIADO: 'Inscripción de aliado', VOLUNTARIO: 'Inscripción de voluntario', PUNTO_ACOPIO: 'Propuesta de punto de acopio' };
const states = { RECIBIDA: 'Recibida', EN_REVISION: 'En revisión', OBSERVADA: 'Requiere información', APROBADA: 'Aprobada', RECHAZADA: 'Rechazada', ATENDIDA: 'Atendida', CERRADA: 'Cerrada', CANCELADA: 'Cancelada' };
const fields = {
  tipo_emergencia: 'Tipo de emergencia', fecha_emergencia: 'Fecha de la emergencia', poblacion_afectada: 'Personas afectadas', necesidades_urgentes: 'Necesidades urgentes',
  tipo_kit: 'Tipo de kit', cantidad_solicitada: 'Cantidad solicitada', poblacion_beneficiaria: 'Personas beneficiarias', fecha_necesidad: 'Fecha en que se necesita', condiciones_especiales: 'Condiciones especiales',
  tipo_recurso: 'Tipo de recurso', descripcion_recurso: 'Descripción del recurso', cantidad: 'Cantidad', unidad: 'Unidad', disponibilidad_desde: 'Disponible desde', disponibilidad_hasta: 'Disponible hasta',
  tipo_aliado: 'Tipo de aliado', nombre_organizacion: 'Organización', cobertura: 'Cobertura', capacidades: 'Capacidades', sitio_web: 'Sitio web',
  disponibilidad: 'Disponibilidad', habilidades: 'Habilidades', zona_preferida: 'Zona preferida', fecha_nacimiento: 'Fecha de nacimiento',
  nombre_propuesto: 'Nombre del punto de acopio', responsable_nombre: 'Responsable', responsable_telefono: 'Teléfono del responsable', horario_propuesto: 'Horario propuesto', fecha_inicio: 'Fecha de inicio', fecha_fin: 'Fecha de fin', capacidad_descripcion: 'Capacidad del espacio',
};
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);

export function renderEmail(template, data = {}) {
  if (!['solicitud_recibida', 'cambio_estado'].includes(template)) throw new Error('Plantilla de correo no reconocida');
  const received = template === 'solicitud_recibida';
  const title = received ? 'Recibimos tu solicitud' : 'Actualización de tu solicitud';
  const rows = [
    ['Código de seguimiento', data.codigo], ['Tipo de solicitud', types[data.tipo] || 'Solicitud'],
    ['Estado', states[data.estado] || 'Recibida'], ['Asunto', data.asunto], ['Descripción', data.descripcion],
    ['Región', data.region], ['Provincia', data.provincia], ['Distrito', data.distrito], ['Dirección', data.direccion],
    ...Object.entries(fields).map(([key, label]) => [label, data.detalle?.[key]]),
    ...(!received ? [['Observación', data.observacion]] : []),
  ].filter(([, value]) => value !== null && value !== undefined && value !== '');
  const greeting = `Hola${data.nombre ? `, ${data.nombre}` : ''}.`;
  const intro = received ? 'Registramos tu solicitud en Red Solidaria. Este es el detalle que nos compartiste:' : 'El estado de tu solicitud ha cambiado. Estos son sus datos:';
  const footer = 'Conserva tu código de seguimiento. La recepción de la solicitud no implica su aprobación ni garantiza la entrega de ayuda.\nEquipo Red Solidaria · Fundación OLI';
  return {
    subject: `${title} · ${String(data.codigo || 'Red Solidaria').replace(/[\r\n]/g, '')}`,
    text: [title, greeting, intro, ...rows.map(([key, value]) => `${key}: ${value}`), footer].join('\n\n'),
    html: `<html lang="es"><body style="font-family:Arial,sans-serif;color:#073164;line-height:1.6"><main style="max-width:640px;margin:auto;padding:24px"><h1 style="color:#ef5700">${title}</h1><p>${escape(greeting)}</p><p>${intro}</p><table style="width:100%;border-collapse:collapse">${rows.map(([key,value]) => `<tr><th style="padding:10px;text-align:left;vertical-align:top;border-bottom:1px solid #ddd">${key}</th><td style="padding:10px;white-space:pre-wrap;overflow-wrap:anywhere;border-bottom:1px solid #ddd">${escape(value)}</td></tr>`).join('')}</table><p>${escape(footer).replaceAll('\n','<br>')}</p></main></body></html>`,
  };
}
