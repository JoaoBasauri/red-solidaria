import { createClient } from 'jsr:@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const allowed = new Set(['image/jpeg','image/png','image/webp','application/pdf','video/mp4','video/webm'])

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const client = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    )
    const { data: feature } = await client.from('configuracion_funcionalidades')
      .select('habilitada').eq('clave','CARGA_EVIDENCIAS').single()
    if (!feature?.habilitada) return json({ error: 'La carga de evidencias está deshabilitada.' }, 403)

    const form = await request.formData()
    const solicitudId = String(form.get('solicitudId') || '')
    const codigo = String(form.get('codigo') || '')
    const file = form.get('file')
    if (!(file instanceof File) || !solicitudId || !codigo) return json({ error: 'Solicitud o archivo inválido.' }, 400)
    if (!allowed.has(file.type)) return json({ error: 'Tipo de archivo no permitido.' }, 400)
    const limit = file.type === 'application/pdf' || file.type.startsWith('video/') ? 10 * 1024 * 1024 : 5 * 1024 * 1024
    if (file.size <= 0 || file.size > limit) return json({ error: 'El archivo supera el tamaño permitido.' }, 400)

    const { data: solicitud } = await client.from('solicitudes').select('id,tipo,created_at')
      .eq('id',solicitudId).eq('codigo',codigo).in('tipo',['EMERGENCIA','KIT']).single()
    if (!solicitud || Date.now() - new Date(solicitud.created_at).getTime() > 60 * 60 * 1000)
      return json({ error: 'La ventana para adjuntar evidencias venció.' }, 403)

    const { count } = await client.from('evidencias').select('*',{ count:'exact', head:true }).eq('solicitud_id',solicitudId)
    if ((count || 0) >= 5) return json({ error: 'Se alcanzó el máximo de 5 evidencias.' }, 400)

    const extension = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase().replace(/[^a-z0-9]/g,'') : 'bin'
    const path = `${solicitudId}/${crypto.randomUUID()}.${extension}`
    const uploaded = await client.storage.from('evidencias').upload(path,file,{ contentType:file.type,upsert:false })
    if (uploaded.error) throw uploaded.error
    const inserted = await client.from('evidencias').insert({ solicitud_id:solicitudId,storage_path:path,nombre_original:file.name.slice(0,255),mime_type:file.type,tamano_bytes:file.size })
    if (inserted.error) { await client.storage.from('evidencias').remove([path]); throw inserted.error }
    return json({ ok:true }, 201)
  } catch (error) {
    console.error(error)
    return json({ error:'No se pudo guardar la evidencia.' }, 500)
  }
})

function json(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), { status, headers:{ ...cors,'Content-Type':'application/json' } })
}
