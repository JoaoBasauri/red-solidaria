import { useEffect, useRef, useState } from 'react'

let leafletPromise
function loadLeaflet(){
  if(window.L)return Promise.resolve(window.L)
  if(leafletPromise)return leafletPromise
  leafletPromise=new Promise((resolve,reject)=>{
    const css=document.createElement('link');css.rel='stylesheet';css.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';document.head.appendChild(css)
    const script=document.createElement('script');script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';script.integrity='sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';script.crossOrigin='';script.onload=()=>resolve(window.L);script.onerror=()=>reject(new Error('No se pudo cargar el mapa.'));document.head.appendChild(script)
  })
  return leafletPromise
}

export default function OpenStreetMapPoints({points,label='Mapa de puntos de acopio publicados',className='h-[28rem]',selectedId=null,compact=false}){
  const container=useRef(null),[error,setError]=useState('')
  useEffect(()=>{
    let active=true,map
    if(!points.length)return undefined
    loadLeaflet().then(L=>{
      if(!active||!container.current)return
      map=L.map(container.current,{scrollWheelZoom:false,zoomControl:!compact,dragging:!compact,touchZoom:!compact,doubleClickZoom:!compact,boxZoom:!compact,keyboard:!compact}).setView([-12.0464,-77.0428],11)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map)
      const bounds=[]
      let selectedMarker
      points.forEach(point=>{
        if(point.latitud==null||point.longitud==null)return
        const coordinates=[Number(point.latitud),Number(point.longitud)]
        if(!coordinates.every(Number.isFinite)||Math.abs(coordinates[0])>90||Math.abs(coordinates[1])>180)return
        bounds.push(coordinates)
        const marker=point.emergencia?L.circleMarker(coordinates,{radius:11,color:'#c2410c',fillColor:'#fb923c',fillOpacity:0.85}):L.marker(coordinates,{title:point.nombre_publico,alt:point.nombre_publico})
        marker.addTo(map).bindPopup(`<strong>${escapeHtml(point.nombre_publico)}</strong><br>${escapeHtml(point.direccion_publica)}`)
        if(point.id===selectedId)selectedMarker=marker
      })
      if(bounds.length>1)map.fitBounds(bounds,{padding:[45,45]})
      else if(bounds.length===1)map.setView(bounds[0],13)
      if(selectedMarker){map.setView(selectedMarker.getLatLng(),15);selectedMarker.openPopup()}
    }).catch(cause=>active&&setError(cause.message))
    return()=>{active=false;if(map)map.remove()}
  },[points,selectedId,compact])
  return <div><div ref={container} className={`relative z-0 w-full rounded-3xl border border-slate-200 bg-slate-200 shadow-inner ${className}`} aria-label={label}/>{error&&<p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}</div>
}
function escapeHtml(value=''){return String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]))}
