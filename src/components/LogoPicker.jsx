import { useEffect, useMemo, useState } from 'react'
import FileUploadButton from './FileUploadButton'
import { LOGO_ACCEPT, LOGO_HELP } from '../../supabase/functions/_shared/ally-logo.mjs'
import { checkLogoFile } from '../services/allies.service'

// Selector de logo con validación inmediata (formato, peso, tamaño y proporción) y vista previa.
export default function LogoPicker({ file, onChange, title = 'Logo de la organización (opcional)', description = 'Si OLI lo aprueba, aparecerá en el banner «Nuestros aliados» de la página de inicio.' }) {
  const [error, setError] = useState(''), [info, setInfo] = useState(null)
  const preview = useMemo(() => file ? URL.createObjectURL(file) : '', [file])
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])
  async function select([selected]) {
    setError(''); setInfo(null)
    try { setInfo(await checkLogoFile(selected)); onChange(selected) }
    catch (cause) { setError(`«${selected.name}» no se puede usar: ${cause.message}`); onChange(null) }
  }
  /* Sección: carga opcional del logo de una organización aliada. */
  return <section className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4">
    <h2 className="font-semibold">{title}</h2>
    {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
    <p className="mt-1 text-sm text-slate-600">{LOGO_HELP}</p>
    <div className="mt-3 flex flex-wrap items-center gap-3"><FileUploadButton accept={LOGO_ACCEPT} onSelect={select} label={file ? 'Cambiar logo' : 'Seleccionar logo'} />{file && <button type="button" onClick={() => { onChange(null); setInfo(null) }} className="text-sm font-semibold text-slate-600 underline">Quitar logo</button>}</div>
    {error && <p role="alert" className="mt-3 rounded-lg bg-red-100 p-3 text-sm text-red-800">{error}</p>}
    {file && preview && <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <figure className="grid place-items-center rounded-lg border bg-white p-4"><img src={preview} alt="Vista previa del logo" className="h-16 w-auto max-w-full object-contain" /><figcaption className="mt-2 text-xs text-slate-500">{file.name}{info && ` · ${info.width} × ${info.height}${info.type === 'image/svg+xml' ? '' : ' px'}`}</figcaption></figure>
      <figure className="grid place-items-center rounded-lg border bg-white p-4"><img src={preview} alt="" className="h-12 w-auto max-w-full object-contain" /><figcaption className="mt-2 text-xs text-slate-500">Así se verá en el banner</figcaption></figure>
    </div>}
  </section>
}
