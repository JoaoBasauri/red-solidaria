import { useEffect, useId, useRef, useState } from 'react'

// Selector accesible: búsqueda, teclado y ocho filas como máximo antes del scroll.
export default function StyledSelect({ label, value = '', options, onChange, multiple = false, required = false, disabled = false, placeholder = 'Selecciona una opción' }) {
  const id = useId(), root = useRef(null), trigger = useRef(null), search = useRef(null), list = useRef(null)
  const [open, setOpen] = useState(false), [query, setQuery] = useState(''), [active, setActive] = useState(0)
  const items = options.map(option => typeof option === 'string' ? { value: option, label: option } : option)
  const selected = multiple ? (Array.isArray(value) ? value : value ? value.split('; ') : []) : [value]
  const normalize = text => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const filtered = items.filter(item => normalize(item.label).includes(normalize(query)))
  const display = items.filter(item => selected.includes(item.value)).map(item => item.label).join(', ')
  function close() { setOpen(false); trigger.current?.focus() }
  function choose(item) {
    onChange(multiple ? (selected.includes(item.value) ? selected.filter(v => v !== item.value) : [...selected, item.value]) : item.value)
    if (!multiple) close()
  }
  useEffect(() => {
    if (!open) return
    search.current?.focus()
    const outside = event => { if (!root.current?.contains(event.target)) setOpen(false) }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [open])
  useEffect(() => { list.current?.children[active]?.scrollIntoView({ block: 'nearest' }) }, [active])
  return <div ref={root} className="relative min-w-0" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false) }}>
    <span id={`${id}-label`} className="mb-2 block text-sm font-bold text-[#073164]">{label}{required ? ' *' : ''}</span>
    <button ref={trigger} type="button" disabled={disabled} aria-labelledby={`${id}-label ${id}-value`} aria-haspopup="listbox" aria-expanded={open} aria-controls={`${id}-list`} onClick={() => { setQuery(''); setActive(0); setOpen(v => !v) }} onKeyDown={event => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setQuery(''); setActive(0); setOpen(true) } }} className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-left text-base font-normal text-[#073164] shadow-sm transition hover:border-orange-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400">
      <span id={`${id}-value`} className="line-clamp-2">{display || placeholder}</span><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`h-5 w-5 shrink-0 text-orange-600 ${open ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" /></svg>
    </button>
    {open && !disabled && <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
      <input ref={search} role="combobox" aria-label={`Buscar: ${label}`} aria-expanded="true" aria-controls={`${id}-list`} aria-autocomplete="list" aria-activedescendant={filtered[active] ? `${id}-option-${active}` : undefined} value={query} onChange={event => { setQuery(event.target.value); setActive(0) }} onKeyDown={event => {
        if (event.key === 'Escape') { event.preventDefault(); close() }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setActive(i => Math.max(0, Math.min(filtered.length - 1, i + (event.key === 'ArrowDown' ? 1 : -1)))) }
        if (event.key === 'Enter') { event.preventDefault(); if (filtered[active]) choose(filtered[active]) }
      }} placeholder="Buscar opciones…" className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal outline-none focus:border-orange-500" />
      <ul ref={list} id={`${id}-list`} role="listbox" aria-labelledby={`${id}-label`} aria-multiselectable={multiple || undefined} className="max-h-[352px] overflow-y-auto overscroll-contain">
        {filtered.map((item, index) => <li key={item.value} id={`${id}-option-${index}`} role="option" aria-selected={selected.includes(item.value)} onPointerDown={event => event.preventDefault()} onClick={() => choose(item)} className={`flex h-11 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-normal ${index === active ? 'bg-orange-50' : ''} ${selected.includes(item.value) ? 'font-bold text-orange-700' : 'text-[#073164]'} hover:bg-orange-100`}><span aria-hidden="true" className="w-4 shrink-0">{selected.includes(item.value) ? '✓' : ''}</span><span className="truncate" title={item.label}>{item.label}</span></li>)}
      </ul>
      {!filtered.length && <p role="status" className="p-3 text-sm text-slate-500">Sin coincidencias</p>}
      {multiple && <button type="button" onClick={close} className="mt-2 w-full rounded-lg bg-[#073164] p-2 text-sm font-bold text-white">Listo ({selected.length})</button>}
    </div>}
  </div>
}
