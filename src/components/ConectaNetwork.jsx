import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPublishedCollectionPoints, getPublicEmergencies } from '../services/request.service'
import OpenStreetMapPoints from './OpenStreetMapPoints'

export default function ConectaNetwork({ emergenciesOnly=false, mapOnly=false }) {
  const [points,setPoints]=useState([])
  const [emergencies,setEmergencies]=useState([])
  const [loading,setLoading]=useState(true)
  const [errors,setErrors]=useState([])
  useEffect(()=>{
    let active=true
    Promise.allSettled([emergenciesOnly?Promise.resolve([]):getPublishedCollectionPoints(),getPublicEmergencies()]).then(results=>{
      if(!active)return
      setPoints(results[0].status==='fulfilled'?results[0].value:[])
      setEmergencies(results[1].status==='fulfilled'?results[1].value:[])
      setErrors(results.flatMap((result,index)=>result.status==='rejected'?[index===0?'No se pudieron cargar los puntos de acopio. Intenta recargar la página.':'No se pudieron cargar las emergencias. Intenta recargar la página.']:[]))
      setLoading(false)
    })
    return()=>{active=false}
  },[emergenciesOnly])
  const markers=useMemo(()=>[...points,...emergencies.map(item=>({
    ...item,emergencia:true,nombre_publico:`${item.es_demo?'[Demo] ':''}${item.titulo}`,
    direccion_publica:`${item.distrito||item.region||''} · Ubicación aproximada`,
  }))].filter(item=>item.latitud!=null&&item.longitud!=null),[points,emergencies])
  // Sección: mapa público de OLI Conecta con leyenda y estados de carga, error o ausencia de ubicaciones.
  if(mapOnly)return <section className="bg-white px-5 pb-12 text-[#073164] sm:px-8 lg:px-10" aria-labelledby="conecta-map-title">
    <div className="mx-auto max-w-7xl">
      <h2 id="conecta-map-title" className="mb-5 text-center text-3xl font-bold text-[#ef5700]">Encuentra dónde ayudar</h2>
      {errors.map(error=><p key={error} role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-red-800">{error}</p>)}
      {loading?<p role="status" className="rounded-2xl bg-orange-50 p-8 text-center">Cargando la red solidaria...</p>:markers.length>0?<>
        <OpenStreetMapPoints points={markers} label="Mapa de puntos de acopio y emergencias aprobadas" className="h-80 sm:h-[32.5rem]" />
        <p className="mt-3 text-center text-base leading-6 sm:text-lg">Marcadores azules: puntos de acopio. Círculos naranjas: emergencias. Selecciona una ubicación para ver su información.</p>
        <p className="mt-2 text-center text-sm text-slate-500">Las emergencias muestran una ubicación aproximada para proteger a los solicitantes.</p>
      </>:!errors.length&&<p className="rounded-2xl bg-orange-50 p-8 text-center">Aún no hay ubicaciones públicas disponibles en el mapa.</p>}
    </div>
  </section>
  // Sección: mapa y directorio público de emergencias y puntos de acopio activos.
  return <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="red-activa-title">
    <p className="text-sm font-black uppercase tracking-widest text-[#ef5b16]">Red activa</p>
    <h2 id="red-activa-title" className="mt-3 text-3xl font-black text-[#0a2f5f]">{emergenciesOnly?'Emergencias que necesitan apoyo':'Encuentra dónde ayudar'}</h2>
    <p className="mt-3 text-slate-600">Información pública de OLI. Las emergencias muestran una ubicación aproximada para proteger a los solicitantes.</p>
    {errors.map(error=><p key={error} role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-red-800">{error}</p>)}
    {loading?<p role="status" className="mt-6 rounded-2xl bg-slate-100 p-8">Cargando la red solidaria...</p>:<>
      <div className="my-6 flex flex-wrap gap-3 text-sm font-bold">
        {!emergenciesOnly&&<span className="rounded-full bg-blue-100 px-4 py-2 text-blue-800">Puntos de acopio: {points.length}</span>}
        <span className="rounded-full bg-orange-100 px-4 py-2 text-orange-800">Emergencias aprobadas: {emergencies.length}</span>
      </div>
      {markers.length>0&&<><OpenStreetMapPoints points={markers} label="Mapa de puntos de acopio y emergencias aprobadas"/><p className="mt-3 text-sm text-slate-600">Marcadores azules: puntos de acopio. Círculos naranjas: emergencias. Selecciona una ubicación para ver su información.</p></>}
      {!emergenciesOnly&&<div className="mt-10"><h3 className="text-2xl font-black">Puntos de acopio</h3>
        {!points.length&&!errors.length&&<p className="mt-4 text-slate-600">Aún no hay puntos publicados.</p>}
        <div className="mt-5 grid gap-5 md:grid-cols-2">{points.map(point=><article key={point.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">Publicado</span>
          <h4 className="mt-4 text-xl font-black">{point.nombre_publico}</h4><p className="mt-2 text-slate-600">{point.descripcion_publica}</p>
          <p className="mt-4 font-semibold">{point.direccion_publica}</p><p className="mt-2 text-sm text-slate-600">{point.horario}</p>
          {point.contacto_publico&&<p className="mt-2 text-sm text-slate-600">Contacto: {point.contacto_publico}</p>}
          <a href={`https://www.openstreetmap.org/?mlat=${point.latitud}&mlon=${point.longitud}#map=17/${point.latitud}/${point.longitud}`} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-2xl bg-[#ef5b16] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#d94f0b]">Abrir ubicación</a>
        </article>)}</div>
      </div>}
      <div className="mt-10"><h3 className="text-2xl font-black">Emergencias aprobadas</h3>
        {!emergencies.length&&!errors.length&&<p className="mt-4 text-slate-600">No hay emergencias aprobadas pendientes de atención.</p>}
        <div className="mt-5 grid gap-5 md:grid-cols-2">{emergencies.map(item=><article key={item.id} className="rounded-3xl border border-orange-200 bg-orange-50 p-6">
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-800">{item.es_demo?'Demo · Aprobada':'Aprobada'}</span>
          <h4 className="mt-4 text-xl font-black">{item.titulo}</h4><p className="mt-2 text-slate-700">{item.tipo_emergencia}</p>
          <p className="mt-3 text-sm text-slate-600">{[item.distrito,item.provincia,item.region].filter(Boolean).join(' · ')}</p>
          {item.poblacion_afectada!=null&&<p className="mt-3 font-semibold">{item.poblacion_afectada} personas afectadas</p>}
          <Link to="/solicitud?tipo=OFERTA_RECURSO" className="mt-5 inline-flex rounded-full bg-orange-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-800">Ofrecer ayuda</Link>
        </article>)}</div>
      </div>
    </>}
  </section>
}
