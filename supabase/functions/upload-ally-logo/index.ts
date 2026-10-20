import { createClient } from 'jsr:@supabase/supabase-js@2'
import { validateLogo } from '../_shared/ally-logo.mjs'

// Recibe el logo opcional de una organización que se acaba de registrar como aliada y lo deja PENDIENTE de revisión.
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const extensions: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/svg+xml': 'svg' }

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const client = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    )
    const form = await request.formData()
    const solicitudId = String(form.get('solicitudId') || '')
    const codigo = String(form.get('codigo') || '')
    const file = form.get('file')
    if (!(file instanceof File) || !solicitudId || !codigo) return json({ error: 'Solicitud o archivo inválido.' }, 400)

    // Misma validación que el navegador, pero sobre el contenido real del archivo.
    let logo
    try { logo = validateLogo({ bytes: new Uint8Array(await file.arrayBuffer()), size: file.size, declaredType: file.type }) }
    catch (error) { return json({ error: (error as Error).message }, 400) }

    const { data: solicitud } = await client.from('solicitudes').select('id,tipo,datos,created_at')
      .eq('id', solicitudId).eq('codigo', codigo).eq('tipo', 'ALIADO').single()
    if (!solicitud || Date.now() - new Date(solicitud.created_at).getTime() > 60 * 60 * 1000)
      return json({ error: 'La ventana para adjuntar el logo venció.' }, 403)
    const datos = solicitud.datos || {}
    if (datos.tipo_participante !== 'Organización') return json({ error: 'Solo las organizaciones pueden enviar un logo.' }, 403)
    const nombre = String(datos.nombre_organizacion || '').trim().slice(0, 120)
    if (nombre.length < 2) return json({ error: 'La solicitud no tiene el nombre de la organización.' }, 400)
    const sitio = String(datos.sitio_web || '').trim()

    const path = `${solicitudId}/${crypto.randomUUID()}.${extensions[logo.type]}`
    const uploaded = await client.storage.from('logos-aliados').upload(path, file, { contentType: logo.type, upsert: false })
    if (uploaded.error) throw uploaded.error
    const inserted = await client.from('aliados_logos').insert({
      solicitud_id: solicitudId, nombre, sitio_web: /^https?:\/\/\S+$/i.test(sitio) ? sitio : null,
      storage_path: path, mime_type: logo.type, ancho: logo.width, alto: logo.height,
    })
    if (inserted.error) {
      await client.storage.from('logos-aliados').remove([path])
      // Índice único por solicitud: solo se acepta un logo por registro.
      if (inserted.error.code === '23505') return json({ error: 'Esta solicitud ya tiene un logo.' }, 409)
      throw inserted.error
    }
    return json({ ok: true }, 201)
  } catch (error) {
    console.error(error)
    return json({ error: 'No se pudo guardar el logo.' }, 500)
  }
})

function json(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
}
