import { createClient } from 'jsr:@supabase/supabase-js@2'
import { passwordRedirect } from '../_shared/app-url.mjs'

const cors={
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
}
const roles=new Set(['ADMIN','GESTOR','LECTURA'])

Deno.serve(async request=>{
  if(request.method==='OPTIONS')return new Response('ok',{headers:cors})
  try{
    const url=Deno.env.get('SUPABASE_URL')!
    const anon=Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRole=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const authorization=request.headers.get('Authorization')||''
    const sessionClient=createClient(url,anon,{global:{headers:{Authorization:authorization}},auth:{persistSession:false}})
    const {data:{user},error:userError}=await sessionClient.auth.getUser()
    if(userError||!user)return json({error:'Sesión inválida.'},401)

    const {data:actor,error:actorError}=await sessionClient.from('profiles').select('rol,activo').eq('id',user.id).single()
    if(actorError)return json({error:'No se pudo validar el perfil del usuario.'},403)
    if(!actor?.activo||actor.rol!=='ADMIN')return json({error:'Solo un administrador puede gestionar perfiles.'},403)

    const admin=createClient(url,serviceRole,{auth:{persistSession:false}})

    const body=await request.json()
    if(body.action==='list'){
      const [{data:authData,error:authError},{data:profiles,error:profilesError}]=await Promise.all([
        admin.auth.admin.listUsers({page:1,perPage:1000}),
        admin.from('profiles').select('id,nombre_completo,rol,activo,created_at,updated_at').order('nombre_completo'),
      ])
      if(authError)throw authError
      if(profilesError)throw profilesError
      const emailById=new Map(authData.users.map(item=>[item.id,item.email||'']))
      return json({profiles:profiles.map(item=>({...item,email:emailById.get(item.id)||''}))})
    }

    if(body.action==='create'){
      const email=String(body.email||'').trim().toLowerCase()
      const name=String(body.nombre_completo||'').trim()
      const role=String(body.rol||'GESTOR')
      if(!email.includes('@')||name.length<2||!roles.has(role))return json({error:'Datos del perfil inválidos.'},400)
      const {data:created,error:createError}=await admin.auth.admin.inviteUserByEmail(email,{
        data:{full_name:name},redirectTo:passwordRedirect(Deno.env.get('APP_BASE_URL')),
      })
      if(createError)throw createError
      const {data:profile,error:profileError}=await admin.from('profiles').upsert({id:created.user.id,nombre_completo:name,rol:role,activo:true}).select().single()
      if(profileError)throw profileError
      return json({profile:{...profile,email}},201)
    }

    const targetId=String(body.id||'')
    if(!targetId)return json({error:'Perfil no especificado.'},400)
    if(targetId===user.id&&(body.action==='delete'||body.activo===false||body.rol&&body.rol!=='ADMIN'))return json({error:'No puedes quitar tu propio acceso administrativo.'},400)
    const {data:target}=await admin.from('profiles').select('rol,activo').eq('id',targetId).single()
    if(!target)return json({error:'Perfil no encontrado.'},404)
    if(target.rol==='ADMIN'&&target.activo){
      const {count}=await admin.from('profiles').select('*',{count:'exact',head:true}).eq('rol','ADMIN').eq('activo',true)
      if((count||0)<=1&&(body.action==='delete'||body.activo===false||body.rol!=='ADMIN'))return json({error:'Debe permanecer al menos un administrador activo.'},400)
    }

    if(body.action==='update'){
      const name=String(body.nombre_completo||'').trim(),role=String(body.rol||'')
      if(name.length<2||!roles.has(role))return json({error:'Datos del perfil inválidos.'},400)
      const {data:profile,error}=await admin.from('profiles').update({nombre_completo:name,rol:role,activo:Boolean(body.activo)}).eq('id',targetId).select().single()
      if(error)throw error
      return json({profile:{...profile,email:String(body.email||'')}})
    }
    if(body.action==='delete'){
      const {error}=await admin.auth.admin.deleteUser(targetId)
      if(error)throw error
      return json({deleted:true})
    }
    return json({error:'Acción no válida.'},400)
  }catch(error){
    console.error(error)
    const message=error instanceof Error?error.message:'No se pudo gestionar el perfil.'
    return json({error:message},500)
  }
})

function json(body:Record<string,unknown>,status=200){return new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json'}})}
