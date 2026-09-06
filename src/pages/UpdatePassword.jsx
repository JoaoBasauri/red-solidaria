import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function UpdatePassword(){
  const navigate=useNavigate()
  const [password,setPassword]=useState(''),[confirmation,setConfirmation]=useState('')
  const [checking,setChecking]=useState(true),[hasSession,setHasSession]=useState(false)
  const [loading,setLoading]=useState(false),[message,setMessage]=useState('')

  useEffect(()=>{supabase.auth.getSession().then(({data})=>{setHasSession(Boolean(data.session));setChecking(false)})},[])

  async function submit(event){
    event.preventDefault();setMessage('')
    if(password.length<8){setMessage('La contraseña debe tener al menos 8 caracteres.');return}
    if(password!==confirmation){setMessage('Las contraseñas no coinciden.');return}
    setLoading(true)
    const {error}=await supabase.auth.updateUser({password})
    setLoading(false)
    if(error){setMessage(error.message);return}
    setMessage('Contraseña guardada correctamente. Redirigiendo al panel...')
    setTimeout(()=>navigate('/oli',{replace:true}),900)
  }

  return <main className="grid min-h-screen place-items-center bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-700 px-4 py-10">{/* Sección: validación del enlace y creación de una nueva contraseña. */}<section className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl sm:p-9"><Link to="/" className="text-sm font-bold text-emerald-700">← Red Solidaria</Link><p className="mt-8 text-sm font-black uppercase tracking-widest text-emerald-700">Acceso OLI</p><h1 className="mt-2 text-3xl font-black">Crea tu contraseña</h1><p className="mt-3 leading-6 text-slate-600">Utiliza al menos ocho caracteres y guarda la contraseña en un lugar seguro.</p>{checking?<p className="mt-7 rounded-xl bg-slate-100 p-4 text-sm">Verificando el enlace...</p>:hasSession?<form onSubmit={submit} className="mt-7"><label className="block text-sm font-bold">Nueva contraseña<input type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength="8" autoComplete="new-password" required className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"/></label><label className="mt-5 block text-sm font-bold">Confirmar contraseña<input type="password" value={confirmation} onChange={e=>setConfirmation(e.target.value)} minLength="8" autoComplete="new-password" required className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"/></label><button disabled={loading} className="mt-7 w-full rounded-xl bg-emerald-700 px-5 py-3.5 font-bold text-white transition hover:bg-emerald-800 disabled:opacity-50">{loading?'Guardando...':'Guardar contraseña'}</button></form>:<div className="mt-7 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">El enlace no está activo o ya expiró. Solicita uno nuevo desde la pantalla de inicio de sesión.</div>}{message&&<p className={`mt-5 rounded-xl p-4 text-sm ${message.startsWith('Contraseña guardada')?'bg-emerald-50 text-emerald-800':'bg-red-50 text-red-700'}`}>{message}</p>}</section></main> 
}
