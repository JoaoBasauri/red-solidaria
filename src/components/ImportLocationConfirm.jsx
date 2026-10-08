import { useEffect, useRef, useState } from 'react'
import LocationDropdowns from './LocationDropdowns'
import OpenStreetMapLocationPicker from './OpenStreetMapLocationPicker'
import { confirmLocation } from '../utils/requestImport.mjs'

// Confirmación de la ubicación de una fila del Excel: el punto propuesto se puede mover en el mapa y la dirección editar.
export default function ImportLocationConfirm({row,index,total,onConfirm,onSkip,onClose}){
 const {latitude,longitude,region,province,district}=row.form
 const [location,setLocation]=useState({latitude,longitude,region,province,district}),[address,setAddress]=useState(row.form.address),[error,setError]=useState('')
 // La dirección escrita en el Excel (o editada aquí) se conserva; si venía vacía se usa la generada por el mapa.
 const keepAddress=useRef(Boolean(row.addressFromFile))
 useEffect(()=>{const onKey=e=>{if(e.key==='Escape'){e.stopPropagation();onClose()}};window.addEventListener('keydown',onKey,true);return ()=>window.removeEventListener('keydown',onKey,true)},[onClose])
 function move(next){
  setError('')
  setLocation({latitude:next.latitude,longitude:next.longitude,region:next.region,province:next.province,district:next.district})
  if(!keepAddress.current&&next.address)setAddress(next.address)
 }
 function confirm(){try{onConfirm(confirmLocation(row,location,address))}catch(e){setError(e.message)}}
 /* Sección: mapa editable para confirmar la ubicación de una solicitud importada. */
 return <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-black/50 p-4" onClick={onClose}><div role="dialog" aria-modal="true" aria-labelledby="location-title" onClick={e=>e.stopPropagation()} className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
  <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase text-slate-500">Ubicación {index} de {total} · Fila {row.line}</p><h2 id="location-title" className="text-lg font-bold">Confirma la ubicación de «{row.form.name}»</h2><p className="mt-1 text-sm text-slate-600">Revisa que el marcador esté en el lugar correcto. Si no, haz clic en el mapa o arrástralo.</p></div><button onClick={onClose} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Cerrar">×</button></div>
  {row.note&&<p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{row.note}</p>}
  <label className="mt-4 grid gap-1 text-xs font-semibold text-slate-500">Dirección<input value={address} onChange={e=>{keepAddress.current=true;setAddress(e.target.value)}} className="w-full rounded-lg border p-2.5 text-sm font-normal text-slate-900"/></label>
  <div className="mt-4"><OpenStreetMapLocationPicker key={row.line} value={location} onChange={move}/></div>
  {location.latitude&&(location.district?<p className="mt-3 text-sm"><span className="font-semibold">Distrito:</span> {[location.district,location.province,location.region].join(' · ')}</p>:<div className="mt-3 grid gap-3 sm:grid-cols-3"><LocationDropdowns value={location} onChange={changes=>setLocation(v=>({...v,...changes}))}/></div>)}
  {error&&<p className="mt-3 rounded-lg bg-red-100 p-3 text-sm text-red-800">{error}</p>}
  <div className="mt-6 flex flex-wrap justify-end gap-2">{onSkip&&<button onClick={onSkip} className="rounded-lg px-4 py-2 font-semibold text-slate-600 transition hover:bg-slate-100">Omitir por ahora</button>}<button onClick={onClose} className="rounded-lg border px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50">Cancelar</button><button onClick={confirm} disabled={!location.latitude} className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50">Confirmar ubicación</button></div>
 </div></div>
}
