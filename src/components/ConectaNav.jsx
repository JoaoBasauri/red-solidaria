import { useId, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const links=[['/puntos-acopio','Puntos de acopio'],['/emergencias','Emergencias']]

export default function ConectaNav({ mobile=false,onNavigate }) {
  const {pathname}=useLocation()
  const [open,setOpen]=useState(false)
  const button=useRef(null)
  const menuId=useId()
  const active=pathname==='/conecta'||links.some(([path])=>path===pathname)
  function navigate(){setOpen(false);onNavigate?.()}
  return <div className="relative" onBlur={event=>{
    if(!event.currentTarget.contains(event.relatedTarget))setOpen(false)
  }} onKeyDown={event=>{
    if(event.key==='Escape'){
      setOpen(false)
      button.current?.focus()
    }
  }}>
    <div className={`flex items-center rounded-full text-sm font-semibold ${active?'bg-emerald-100 text-emerald-800':'text-slate-600'}`}>
      <NavLink to="/conecta" end onClick={navigate} className="flex-1 rounded-full py-2 pl-3 pr-2 transition hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-emerald-700">OLI Conecta</NavLink>
      <button ref={button} type="button" aria-label="Desplegar secciones de OLI Conecta" aria-expanded={open} aria-controls={menuId} onClick={()=>setOpen(value=>!value)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full transition hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-emerald-700">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={`h-4 w-4 transition ${open?'rotate-180':''}`} aria-hidden="true"><path d="m5 7 5 5 5-5"/></svg>
      </button>
    </div>
    {open&&<nav id={menuId} aria-label="Secciones de OLI Conecta" className={mobile?'mt-2 grid gap-1 border-l-2 border-emerald-100 pl-3':'absolute left-0 top-full z-50 mt-2 grid w-56 gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg'}>
      {links.map(([to,label])=><NavLink key={to} to={to} end onClick={navigate} className={({isActive})=>`rounded-xl px-4 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-emerald-700 ${isActive?'bg-emerald-100 text-emerald-800':'text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'}`}>{label}</NavLink>)}
    </nav>}
  </div>
}
