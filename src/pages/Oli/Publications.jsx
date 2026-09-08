import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getOliPublications, withdrawPublication } from '../../services/publications.service'

export default function Publications({ type }) {
  const { profile } = useAuth()
  const emergency = type === 'EMERGENCIA'
  const title = emergency ? 'Emergencias' : 'Puntos de acopio'
  const canManage = profile?.activo && ['ADMIN', 'GESTOR'].includes(profile?.rol)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [refresh, setRefresh] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    let active = true
    getOliPublications(type).then(data => { if (active) { setItems(data); setNow(Date.now()) } })
      .catch(e => { if (active) setError(e.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [type, refresh])
  const name = item => emergency ? `${item.codigo} · Emergencia en ${item.distrito || item.region || 'zona por confirmar'}` : item.nombre_publico
  const withdrawn = item => emergency ? Boolean(item.publicacion_retirada_at) : item.estado === 'SUSPENDIDO'
  const status = item => {
    if (withdrawn(item)) return 'Retirada'
    if (emergency) return 'Publicada'
    if (item.estado !== 'PUBLICADO') return item.estado === 'BORRADOR' ? 'Borrador' : 'Finalizado'
    if (item.publicado_desde && Date.parse(item.publicado_desde) > now) return 'Programada'
    if (item.publicado_hasta && Date.parse(item.publicado_hasta) <= now) return 'Vencida'
    return 'Publicada'
  }
  async function submit(event) {
    event.preventDefault()
    if (!selected || busy || !canManage) return
    setBusy(true); setError(''); setMessage('')
    try {
      await withdrawPublication(type, selected.id, reason)
      setItems(current => current.map(item => item.id !== selected.id ? item : emergency
        ? { ...item, publicacion_retirada_at: new Date().toISOString(), motivo_retiro_publicacion: reason.trim() }
        : { ...item, estado: 'SUSPENDIDO', motivo_retiro: reason.trim() }))
      setMessage('Publicación retirada del portal. Se conservan sus datos e historial.')
      setSelected(null); setReason('')
    } catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  const filtered = items.filter(item => [name(item), item.region, item.provincia, item.distrito].join(' ').toLowerCase().includes(query.toLowerCase()))
  return <main className="min-h-screen bg-slate-100 px-4 py-8 text-[#073164] sm:px-8">
    <div className="mx-auto max-w-7xl">
      <Link to="/oli" className="font-bold underline">Volver al panel OLI</Link>
      <h1 className="mt-5 text-3xl font-bold">{title}</h1>
      <p className="mt-2">Retira publicaciones del portal sin borrar sus datos ni cambiar el estado de la solicitud.</p>
      <nav aria-label="Publicaciones OLI" className="my-5 flex gap-5"><Link to="/oli/emergencias" className="underline">Emergencias</Link><Link to="/oli/puntos-acopio" className="underline">Puntos de acopio</Link></nav>
      {!canManage && <p className="mb-4">Solo ADMIN y GESTOR pueden retirar publicaciones.</p>}
      <label className="block font-bold">Buscar por nombre, código o ubicación<input value={query} onChange={e => setQuery(e.target.value)} className="mt-2 w-full rounded-xl border bg-white p-3 font-normal" /></label>
      <button disabled={loading || busy} onClick={() => { setLoading(true); setError(''); setRefresh(v => v + 1) }} className="my-4 rounded-xl border bg-white px-4 py-2 disabled:opacity-50">Actualizar lista</button>
      {error && <p role="alert" className="my-4 rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}
      {message && <p role="status" className="my-4 rounded-xl bg-green-50 p-4">{message}</p>}
      {selected && <form onSubmit={submit} className="mb-6 rounded-2xl border border-orange-300 bg-white p-6">
        <h2 className="text-xl font-bold">Retirar: {name(selected)}</h2>
        <p className="my-3">Dejará de aparecer en el mapa y las listas públicas al volver a cargarlas. Esta acción no elimina la solicitud ni significa que fue atendida.</p>
        <label className="block font-bold">Motivo del retiro<textarea autoFocus required minLength={5} maxLength={500} value={reason} disabled={busy} onChange={e => setReason(e.target.value)} className="mt-2 block w-full rounded-xl border p-3 font-normal" /></label>
        <div className="mt-4 flex flex-wrap gap-3"><button disabled={busy || reason.trim().length < 5} className="rounded-xl bg-red-700 px-5 py-3 font-bold text-white disabled:opacity-50">{busy ? 'Retirando…' : 'Confirmar retiro'}</button><button type="button" disabled={busy} onClick={() => { setSelected(null); setReason('') }} className="rounded-xl border px-5 py-3">Cancelar</button></div>
      </form>}
      {/* Sección: publicaciones y registro de retiros del portal público. */}
      <section aria-label={title} className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        {loading ? <p role="status" className="p-6">Cargando publicaciones…</p> : <table className="w-full text-left text-sm"><thead><tr>{['Publicación', 'Ubicación', 'Estado de publicación', 'Motivo del retiro', 'Acción'].map(label => <th key={label} className="p-4">{label}</th>)}</tr></thead><tbody>
          {filtered.map(item => <tr key={item.id} className="border-t"><td className="p-4 font-bold">{name(item)}</td><td className="p-4">{[item.region, item.provincia, item.distrito].filter(Boolean).join(' / ')}</td><td className="p-4">{status(item)}</td><td className="p-4">{item.motivo_retiro_publicacion || item.motivo_retiro || '—'}</td><td className="p-4">{canManage && !withdrawn(item) && (emergency || item.estado === 'PUBLICADO') ? <button disabled={busy} onClick={() => { setSelected(item); setReason(''); setError(''); setMessage('') }} className="rounded-lg border border-red-300 px-3 py-2 font-bold text-red-700 disabled:opacity-50">Retirar del portal</button> : '—'}</td></tr>)}
          {!filtered.length && <tr><td colSpan={5} className="p-8 text-center">{error ? 'No se pudo cargar la lista.' : 'No hay publicaciones para mostrar.'}</td></tr>}
        </tbody></table>}
      </section>
    </div>
  </main>
}
