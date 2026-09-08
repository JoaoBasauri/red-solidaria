import { supabase } from '../lib/supabase'

export async function getOliPublications(type) {
  const items = []
  for (let offset = 0; ; offset += 500) {
    let query
    if (type === 'EMERGENCIA') {
      query = supabase.from('solicitudes')
        .select('id,codigo,region,provincia,distrito,estado,publicacion_retirada_at,motivo_retiro_publicacion,created_at')
        .eq('tipo', 'EMERGENCIA').or('estado.eq.APROBADA,publicacion_retirada_at.not.is.null')
    } else if (type === 'PUNTO_ACOPIO') {
      query = supabase.from('puntos_acopio')
        .select('id,nombre_publico,region,provincia,distrito,estado,retirado_at,motivo_retiro,publicado_desde,publicado_hasta,created_at')
    } else throw new Error('Tipo de publicación inválido')
    const { data, error } = await query.order('created_at', { ascending: false }).order('id').range(offset, offset + 499)
    if (error) throw error
    items.push(...data)
    if (data.length < 500) return items
  }
}

export async function withdrawPublication(type, id, reason) {
  const { error } = await supabase.rpc('retirar_publicacion', { p_tipo: type, p_id: id, p_motivo: reason.trim() })
  if (error) throw error
}
