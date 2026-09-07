import { useState } from 'react'
import { passwordRedirect } from '../../supabase/functions/_shared/app-url.mjs'
import { supabase } from '../lib/supabase'
import { Link, useNavigate } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [recoverySent, setRecoverySent] = useState(false)

  const navigate = useNavigate()

  async function recoverPassword() {
    setRecoverySent(false)
    if (!email) { setMessage('Ingresa tu correo para enviarte el enlace de recuperación.'); return }
    setLoading(true); setMessage('')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: passwordRedirect(import.meta.env.VITE_APP_BASE_URL),
      })
      if (error) throw error
      setRecoverySent(true)
      setMessage('Te enviamos un enlace de recuperación. Revisa también la carpeta de spam.')
    } catch (error) { setMessage(error.message) }
    finally { setLoading(false) }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setRecoverySent(false)

    setLoading(true)
    setMessage('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error(error)
      setMessage('Correo o contraseña incorrectos')
      setLoading(false)
      return
    }

    const user = data.user

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('rol, activo')
      .eq('id', user.id)
      .single()

    if (profileError) {
  console.error('Error profile:', profileError)
  setMessage(profileError.message)
  setLoading(false)
  return
}

    if (profile.activo && ['ADMIN', 'GESTOR', 'LECTURA'].includes(profile.rol)) {
      navigate('/oli')
    } else {
      await supabase.auth.signOut()
      setMessage('Esta cuenta no tiene acceso al panel OLI')
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#fbfcf8] text-slate-900">
      <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-6 sm:px-8">
        <Link to="/" className="flex items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-emerald-700" aria-label="Red Solidaria, inicio">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-700 text-lg font-black text-white">OLI</span>
          <span><strong className="block leading-tight">Red Solidaria</strong><span className="text-xs text-slate-500">Fundación OLI</span></span>
        </Link>
        <Link to="/" className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-emerald-200 hover:text-emerald-800 focus-visible:outline-2 focus-visible:outline-emerald-700">← Volver al sitio</Link>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-5 pb-10 pt-4 sm:px-8 lg:min-h-[calc(100vh-10rem)] lg:grid-cols-2 lg:items-stretch lg:gap-0 lg:py-8">
        {/* Sección: presentación visual y beneficios del espacio de coordinación OLI. */}
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-700 p-8 text-white sm:p-12 lg:rounded-r-none">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10"/>
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -left-20 h-96 w-96 rounded-full border border-white/10"/>
          <div className="relative flex h-full flex-col justify-between gap-10">
            <div>
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-emerald-100">Equipo OLI</span>
              <h1 className="mt-8 max-w-sm text-4xl font-black leading-tight tracking-tight sm:text-5xl">La solidaridad empieza con una buena coordinación.</h1>
              <p className="mt-5 max-w-sm text-base leading-7 text-emerald-100/80">Un espacio para gestionar solicitudes, conectar recursos y acompañar a quienes necesitan apoyo.</p>
            </div>
            <div className="hidden space-y-4 border-t border-white/15 pt-7 sm:block">
              {['Revisa y da seguimiento a las solicitudes','Coordina la respuesta con tu equipo','Conecta la ayuda con cada comunidad'].map(text=><p key={text} className="flex items-center gap-3 text-sm text-emerald-50"><span aria-hidden="true" className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-emerald-200">✓</span>{text}</p>)}
            </div>
          </div>
        </section>

        {/* Sección: formulario de inicio de sesión y recuperación de contraseña. */}
        <section aria-labelledby="login-title" className="flex items-center rounded-[2rem] border border-slate-200 bg-white px-6 py-10 shadow-sm sm:px-12 lg:rounded-l-none lg:border-l-0">
          <div className="w-full">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-700">Acceso al equipo</p>
            <h2 id="login-title" className="mt-3 text-3xl font-black tracking-tight">Bienvenido de nuevo</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">Ingresa con tu cuenta de trabajador OLI para continuar al panel de gestión.</p>
            <form onSubmit={handleSubmit} className="mt-8">
              <label htmlFor="login-email" className="block text-sm font-bold text-slate-700">Correo electrónico</label>
              <input id="login-email" name="email" type="email" autoComplete="username" placeholder="nombre@organizacion.org" value={email} onChange={e=>setEmail(e.target.value)} required className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"/>

              <label htmlFor="login-password" className="mt-5 block text-sm font-bold text-slate-700">Contraseña</label>
              <div className="relative mt-2">
                <input id="login-password" name="password" type={showPassword?'text':'password'} autoComplete="current-password" placeholder="Ingresa tu contraseña" value={password} onChange={e=>setPassword(e.target.value)} required className="min-h-12 w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-4 pr-24 text-base outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"/>
                <button type="button" onClick={()=>setShowPassword(value=>!value)} aria-label={showPassword?'Ocultar contraseña':'Mostrar contraseña'} aria-pressed={showPassword} className="absolute inset-y-1 right-1 rounded-lg px-3 text-xs font-bold text-emerald-800 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-emerald-700">{showPassword?'Ocultar':'Mostrar'}</button>
              </div>
              <div className="mt-3 text-right"><button type="button" onClick={recoverPassword} disabled={loading} className="rounded-lg py-2 text-sm font-bold text-emerald-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-emerald-700 disabled:opacity-50">Olvidé mi contraseña</button></div>

              {message&&<p role={recoverySent?'status':'alert'} className={`mt-4 rounded-xl border p-4 text-sm leading-6 ${recoverySent?'border-emerald-200 bg-emerald-50 text-emerald-800':'border-red-200 bg-red-50 text-red-800'}`}>{message}</p>}
              <button type="submit" disabled={loading} className="mt-5 flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-emerald-700 px-6 py-3 font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-wait disabled:opacity-60">
                {loading&&<span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"/>}{loading?'Procesando...':'Ingresar al panel'}{!loading&&<span aria-hidden="true">→</span>}
              </button>
            </form>
            <div className="mt-8 border-t border-slate-100 pt-6 text-center">
              <p className="text-xs leading-5 text-slate-500">Acceso exclusivo para trabajadores de Fundación OLI.<br/>Para solicitar ayuda no necesitas una cuenta.</p>
              <Link to="/solicitud" className="mt-3 inline-flex rounded-lg px-2 py-1 text-sm font-bold text-emerald-700 hover:underline focus-visible:outline-2 focus-visible:outline-emerald-700">Crear una solicitud pública</Link>
            </div>
          </div>
        </section>
      </div>
      <footer className="px-5 pb-6 text-center text-xs text-slate-500">Fundación OLI · Red Solidaria</footer>
    </main>
  )
}

export default Login
