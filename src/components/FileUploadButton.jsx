import { useId, useRef } from 'react'

export default function FileUploadButton({ accept, multiple = false, disabled = false, onSelect, label = 'Seleccionar archivos', description }) {
  const input = useRef(null)
  const descriptionId = useId()

  function select(event) {
    const files = Array.from(event.target.files || [])
    if (files.length) onSelect(files)
    // Permitir volver a seleccionar el mismo archivo después de retirarlo.
    event.target.value = ''
  }

  return <div>
    <input ref={input} type="file" accept={accept} multiple={multiple} disabled={disabled} onChange={select} hidden />
    <button type="button" disabled={disabled} onClick={() => input.current?.click()} aria-describedby={description ? descriptionId : undefined} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#ef5700] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#cf4b00] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 16V3m-5 5 5-5 5 5M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" /></svg>
      {label}
    </button>
    {description && <p id={descriptionId} className="mt-2 text-sm font-normal text-slate-600">{description}</p>}
  </div>
}
