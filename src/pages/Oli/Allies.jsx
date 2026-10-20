import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import LogoPicker from '../../components/LogoPicker'
import { createAllyLogo, deleteAllyLogo, getAllyLogos, LOGO_STATES, replaceAllyLogoFile, saveAllyOrder, updateAllyLogo } from '../../services/allies.service'
import { normalizeRequestUrl } from '../../utils/requestValidation.mjs'

const stateStyle = { PENDIENTE: 'bg-amber-100 text-amber-800', PUBLICADO: 'bg-emerald-100 text-emerald-800', OCULTO: 'bg-slate-200 text-slate-700' }
const field = 'w-full rounded-lg border p-2.5 text-sm font-normal text-slate-900'

// Valida nombre y enlace opcional como en el formulario público; devuelve los datos listos para guardar.
function cleanData({ nombre, sitio_web }) {
  const name = String(nombre || '').trim()
  if (name.length < 2 || name.length > 120) throw new Error('El nombre debe tener entre 2 y 120 caracteres.')
  let url = String(sitio_web || '').trim()
  if (url) { try { url = normalizeRequestUrl(url) } catch { throw new Error('Ingresa un enlace válido, por ejemplo organizacion.org.') } }
  return { nombre: name, sitio_web: url || null }
}

function LogoForm({ item, onCancel, onSaved }) {
  const [values, setValues] = useState({ nombre: item?.nombre || '', sitio_web: item?.sitio_web || '', estado: 'PUBLICADO' })
  const [file, setFile] = useState(null), [error, setError] = useState(''), [saving, setSaving] = useState(false)
  const set = name => e => setValues(v => ({ ...v, [name]: e.target.value }))
  async function save(e) {
    e.preventDefault(); setError('')
    try {
      const data = cleanData(values)
      if (!item && !file) throw new Error('Selecciona el logo.')
      setSaving(true)
      if (item) { await updateAllyLogo(item.id, data); if (file) await replaceAllyLogoFile(item, file) }
      else await createAllyLogo({ ...data, estado: values.estado, orden: 9999 }, file)
      onSaved()
    } catch (cause) { setError(cause.message || 'No se pudo guardar.') } finally { setSaving(false) }
  }
  /* Sección: formulario para subir o editar un logo de aliado. */
  return <form onSubmit={save} className="rounded-2xl border bg-white p-5 shadow-sm">
    <h2 className="text-lg font-bold">{item ? `Editar «${item.nombre}»` : 'Subir logo manualmente'}</h2>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <label className="grid gap-1 text-xs font-semibold text-slate-500">Nombre de la organización<input value={values.nombre} onChange={set('nombre')} required maxLength={120} className={field} /></label>
      <label className="grid gap-1 text-xs font-semibold text-slate-500">Sitio web (opcional)<input value={values.sitio_web} onChange={set('sitio_web')} placeholder="organizacion.org" className={field} /></label>
      {!item && <label className="grid gap-1 text-xs font-semibold text-slate-500">Estado al guardar<select value={values.estado} onChange={set('estado')} className={field}><option value="PUBLICADO">Publicado (aparece en el banner)</option><option value="PENDIENTE">Pendiente</option><option value="OCULTO">Oculto</option></select></label>}
    </div>
    <LogoPicker file={file} onChange={setFile} title={item ? 'Reemplazar logo (opcional)' : 'Logo'} description="" />
    {error && <p role="alert" className="mt-3 rounded-lg bg-red-100 p-3 text-sm text-red-800">{error}</p>}
    <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onCancel} className="rounded-lg border px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50">Cancelar</button><button disabled={saving} className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar'}</button></div>
  </form>
}

function ConfirmDelete({ item, onCancel, onConfirm, busy }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onCancel}><div role="alertdialog" aria-modal="true" aria-labelledby="delete-title" onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
    <h2 id="delete-title" className="text-lg font-bold">¿Eliminar el logo de «{item.nombre}»?</h2>
    <p className="mt-2 text-sm text-slate-600">Se quitará del banner y se borrará el archivo. Esta acción no se puede deshacer. Si solo quieres dejar de mostrarlo, usa «Ocultar».</p>
    <div className="mt-6 flex justify-end gap-2"><button onClick={onCancel} className="rounded-lg border px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50">Cancelar</button><button onClick={onConfirm} disabled={busy} className="rounded-lg bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-800 disabled:opacity-50">Eliminar</button></div>
  </div></div>
}

export default function Allies() {
  const [items, setItems] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState(''), [notice, setNotice] = useState('')
  const [filter, setFilter] = useState(''), [editing, setEditing] = useState(null), [deleting, setDeleting] = useState(null), [busy, setBusy] = useState(false)
  const [version, setVersion] = useState(0)
  const load = () => setVersion(value => value + 1)
  useEffect(() => {
    let active = true
    getAllyLogos().then(data => { if (active) { setItems(data); setError('') } })
      .catch(cause => { if (active) setError(cause.message || 'No se pudieron cargar los logos.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [version])
  async function run(action, message) {
    setBusy(true); setError(''); setNotice('')
    try { await action(); setNotice(message); load() } catch (cause) { setError(cause.message || 'No se pudo completar la acción.') } finally { setBusy(false) }
  }
  function move(index, direction) {
    const next = [...items], target = index + direction
    ;[next[index], next[target]] = [next[target], next[index]]
    setItems(next)
    run(() => saveAllyOrder(next), 'Orden actualizado.')
  }
  const counts = Object.fromEntries(Object.keys(LOGO_STATES).map(state => [state, items.filter(item => item.estado === state).length]))
  const visible = filter ? items.filter(item => item.estado === filter) : items
  /* Sección: gestión de logos del banner de organizaciones aliadas. */
  return <main className="min-h-screen bg-slate-100">
    <header className="border-b bg-white"><div className="mx-auto max-w-7xl px-4 py-5 sm:px-8"><Link to="/oli" className="text-sm font-bold text-blue-700 hover:underline">Volver al panel OLI</Link><h1 className="mt-2 text-2xl font-black text-[#073164]">Logos de aliados</h1><p className="mt-1 text-sm text-slate-500">Revisa los logos que envían las organizaciones y decide cuáles aparecen en el banner «Organizaciones que se suman» de la página de inicio.</p></div></header>
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 pb-12 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">{[['', 'Todos', items.length], ...Object.entries(LOGO_STATES).map(([state, label]) => [state, label, counts[state]])].map(([state, label, count]) => <button key={state || 'all'} onClick={() => setFilter(state)} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${filter === state ? 'bg-[#073164] text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}>{label} ({count})</button>)}</div>
        {editing !== 'new' && <button onClick={() => setEditing('new')} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">Subir logo manualmente</button>}
      </div>
      {notice && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
      {error && <p role="alert" className="rounded-lg bg-red-100 p-3 text-sm text-red-800">{error}</p>}
      {editing === 'new' && <LogoForm onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); setNotice('Logo guardado.'); load() }} />}
      {loading ? <p className="text-sm text-slate-500">Cargando logos...</p> : !visible.length ? <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500">{filter ? 'No hay logos en este estado.' : 'Todavía no hay logos. Llegan desde el formulario «Sumarse como aliado» (organizaciones) o puedes subirlos manualmente.'}</p> :
      <ul className="space-y-3">{visible.map(item => { const index = items.indexOf(item); return editing === item.id
        ? <li key={item.id}><LogoForm item={item} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); setNotice('Cambios guardados.'); load() }} /></li>
        : <li key={item.id} className="grid gap-4 rounded-2xl border bg-white p-4 shadow-sm md:grid-cols-[auto_9rem_1fr_auto] md:items-center">
          <div className="flex gap-1 md:flex-col" aria-label="Orden">{[[-1, '↑', 'Subir'], [1, '↓', 'Bajar']].map(([direction, symbol, label]) => <button key={direction} onClick={() => move(index, direction)} disabled={busy || filter !== '' || !items[index + direction]} aria-label={`${label} «${item.nombre}»`} title={filter ? 'Muestra «Todos» para reordenar' : label} className="grid h-8 w-8 place-items-center rounded-lg border text-slate-600 hover:bg-slate-50 disabled:opacity-30">{symbol}</button>)}</div>
          <div className="grid h-20 place-items-center rounded-lg border bg-white p-2">{item.logo_url ? <img src={item.logo_url} alt={`Logo de ${item.nombre}`} className="max-h-14 w-auto max-w-full object-contain" /> : <span className="text-xs text-slate-400">Sin vista previa</span>}</div>
          <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{item.nombre}</p><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${stateStyle[item.estado]}`}>{LOGO_STATES[item.estado]}</span><span className="text-xs text-slate-500">Posición {index + 1}</span></div>
            {item.sitio_web ? <a href={item.sitio_web} target="_blank" rel="noopener noreferrer" className="block truncate text-sm text-blue-700 hover:underline">{item.sitio_web}</a> : <p className="text-sm text-slate-400">Sin enlace</p>}
            <p className="mt-1 text-xs text-slate-500">{item.solicitud_id ? 'Enviado desde el formulario de aliado' : 'Subido desde el panel'} · {new Date(item.created_at).toLocaleDateString('es-PE')}{item.ancho ? ` · ${item.ancho} × ${item.alto}` : ''}</p></div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            {item.estado !== 'PUBLICADO' && <button onClick={() => run(() => updateAllyLogo(item.id, { estado: 'PUBLICADO' }), `«${item.nombre}» publicado en el banner.`)} disabled={busy} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">{item.estado === 'PENDIENTE' ? 'Aprobar y publicar' : 'Publicar'}</button>}
            {item.estado !== 'OCULTO' && <button onClick={() => run(() => updateAllyLogo(item.id, { estado: 'OCULTO' }), `«${item.nombre}» oculto.`)} disabled={busy} className="rounded-lg border px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Ocultar</button>}
            <button onClick={() => setEditing(item.id)} disabled={busy} className="rounded-lg border px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Editar</button>
            <button onClick={() => setDeleting(item)} disabled={busy} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">Eliminar</button>
          </div>
        </li> })}</ul>}
    </div>
    {deleting && <ConfirmDelete item={deleting} busy={busy} onCancel={() => setDeleting(null)} onConfirm={() => run(() => deleteAllyLogo(deleting), `Logo de «${deleting.nombre}» eliminado.`).then(() => setDeleting(null))} />}
  </main>
}
