import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { getPublishedAllies } from '../services/allies.service'

const SPEED = 28 // píxeles por segundo del desplazamiento automático
const GAP = 24 // separación entre logos (gap-6), también entre la fila y su copia
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Logo en gris que toma color al pasar el mouse o al enfocarlo; todos con la misma altura visual.
function AllyLogo({ ally, hidden = false }) {
  const image = <img src={ally.logo_url} alt={hidden ? '' : ally.nombre} draggable="false" className="max-h-12 w-auto max-w-[9.5rem] object-contain opacity-60 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0 group-focus-visible:opacity-100 group-focus-visible:grayscale-0 motion-reduce:transition-none" />
  const box = 'group flex h-24 w-48 items-center justify-center rounded-xl px-4 outline-none focus-visible:ring-4 focus-visible:ring-orange-200'
  return <li className="shrink-0" aria-hidden={hidden || undefined}>{ally.sitio_web
    ? <a href={ally.sitio_web} target="_blank" rel="noopener noreferrer" title={ally.nombre} tabIndex={hidden ? -1 : undefined} className={box}>{image}</a>
    : <div title={ally.nombre} className={box}>{image}</div>}</li>
}

function Arrow({ direction, onClick }) {
  return <button type="button" onClick={onClick} aria-label={direction < 0 ? 'Ver logos anteriores' : 'Ver más logos'} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-[#073164] shadow-sm transition hover:border-[#e95300] hover:text-[#e95300] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d={direction < 0 ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} /></svg>
  </button>
}

// Carrusel continuo: si los logos no caben se duplica la fila y avanza solo (sin animación con prefers-reduced-motion).
function AlliesCarousel({ allies }) {
  const track = useRef(null), list = useRef(null), position = useRef(0), paused = useRef(false)
  const [overflow, setOverflow] = useState(false)
  useLayoutEffect(() => {
    const measure = () => setOverflow(list.current.scrollWidth > track.current.clientWidth + 1)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(track.current); observer.observe(list.current)
    return () => observer.disconnect()
  }, [allies])
  // La fila está duplicada: al pasar el ancho de una copia se vuelve al inicio sin que se note el salto.
  function wrap() {
    const width = list.current.scrollWidth + GAP, el = track.current
    if (el.scrollLeft >= width) el.scrollLeft -= width
    else if (el.scrollLeft <= 0) el.scrollLeft += width
    position.current = el.scrollLeft
  }
  useEffect(() => {
    if (!overflow) return
    track.current.scrollLeft = position.current = 1
    if (reducedMotion()) return
    let frame, last = performance.now()
    const step = now => {
      const el = track.current
      if (el && !paused.current && !document.hidden) {
        position.current += (now - last) / 1000 * SPEED
        el.scrollLeft = position.current
        if (position.current >= list.current.scrollWidth + GAP) wrap()
      }
      last = now
      frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [overflow])
  function move(direction) {
    const el = track.current
    el.scrollBy({ left: direction * el.clientWidth * 0.6, behavior: reducedMotion() ? 'auto' : 'smooth' })
  }
  function hold() { paused.current = true }
  function release() { paused.current = false; position.current = track.current.scrollLeft }
  return <div className="mt-10 flex items-center gap-3" onMouseEnter={hold} onMouseLeave={release} onFocus={hold} onBlur={release} onTouchStart={hold} onTouchEnd={release}>
    {overflow && <Arrow direction={-1} onClick={() => move(-1)} />}
    <div ref={track} onScroll={() => { if (overflow && paused.current) wrap() }} className={`flex min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${overflow ? '[mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]' : 'justify-center'}`}>
      <ul ref={list} className="flex shrink-0 gap-6">{allies.map(ally => <AllyLogo key={ally.id} ally={ally} />)}</ul>
      {overflow && <ul className="flex shrink-0 gap-6 pl-6" aria-hidden="true">{allies.map(ally => <AllyLogo key={ally.id} ally={ally} hidden />)}</ul>}
    </div>
    {overflow && <Arrow direction={1} onClick={() => move(1)} />}
  </div>
}

// Banner con los logos publicados por OLI; no se muestra si todavía no hay ninguno.
// items permite mostrar una lista ya cargada (por ejemplo en una vista previa) sin consultar Supabase.
export default function AlliesBanner({ title = 'Organizaciones que se suman', items }) {
  const [loaded, setLoaded] = useState([])
  const allies = items || loaded
  useEffect(() => {
    if (items) return
    let active = true
    getPublishedAllies().then(data => { if (active) setLoaded(data) }).catch(() => {})
    return () => { active = false }
  }, [items])
  if (!allies.length) return null
  /* Sección: banner de organizaciones aliadas publicadas. */
  return <section aria-labelledby="allies-title" className="bg-white px-5 py-20 sm:px-8 lg:px-10">
    <div className="mx-auto max-w-7xl text-center">
      <h2 id="allies-title" className="font-serif text-4xl font-bold text-[#073164] sm:text-5xl">{title}</h2>
      <svg viewBox="0 0 120 14" className="mx-auto mt-4 h-3.5 w-28" aria-hidden="true"><path d="M3 7c9-7 18 7 27 0s18 7 27 0 18 7 27 0 18 7 27 0" fill="none" stroke="#e95300" strokeWidth="3" strokeLinecap="round" /></svg>
      <AlliesCarousel allies={allies} />
    </div>
  </section>
}
