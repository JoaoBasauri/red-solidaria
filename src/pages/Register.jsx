import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { createPublicRequest, isEvidenceUploadEnabled, REQUEST_TYPES, uploadEvidence } from '../services/request.service'
import OpenStreetMapLocationPicker from '../components/OpenStreetMapLocationPicker'
import RequestTypeFields from '../components/RequestTypeFields'
import EvidencePicker from '../components/EvidencePicker'
import PublicLayout, { PageHero } from '../components/PublicLayout'

const empty = { type:'EMERGENCIA',name:'',email:'',phone:'',subject:'',description:'',region:'',province:'',district:'',address:'',latitude:'',longitude:'',consent:false,details:{} }

function Register() {
  const [searchParams] = useSearchParams()
  const requestedType=searchParams.get('tipo')
  const initialType=REQUEST_TYPES.some(([value])=>value===requestedType)?requestedType:empty.type
  const [form,setForm] = useState({...empty,type:initialType})
  const [message,setMessage] = useState('')
  const [loading,setLoading] = useState(false)
  const [files,setFiles] = useState([])
  const [evidenceEnabled,setEvidenceEnabled] = useState(false)
  const point = form.type === 'PUNTO_ACOPIO'
  const update = ({ target }) => setForm((v) => ({...v,[target.name]:target.type==='checkbox'?target.checked:target.value,...(target.name==='type'?{details:{}}:{})}))
  const updateDetails = ({ target }) => setForm((v) => ({...v,details:{...v.details,[target.name]:target.value}}))
  useEffect(()=>{isEvidenceUploadEnabled().then(setEvidenceEnabled)},[])

  async function submit(e) {
    e.preventDefault(); setLoading(true); setMessage('')
    try {
      const result=await createPublicRequest(form)
      const results=await Promise.allSettled(files.map((file)=>uploadEvidence(result,file)))
      const failed=results.filter((item)=>item.status==='rejected').length
      setMessage(failed ? `Solicitud ${result.codigo} recibida, pero ${failed} evidencia(s) no pudieron cargarse.` : `Solicitud recibida. Código: ${result.codigo}`)
      setForm(empty); setFiles([])
    }
    catch (error) { setMessage(error.message || 'No se pudo registrar la solicitud.') }
    finally { setLoading(false) }
  }

  return <PublicLayout><PageHero eyebrow="Participa" title="Envía una solicitud" description="Reporta una emergencia, solicita apoyo o cuéntanos cómo quieres sumarte. No necesitas crear una cuenta." tone="orange" logo="/assets/red-solidaria/personas-paisaje.png"/>{/* Sección: formulario público para registrar una nueva solicitud. */}<section className="bg-[#fff8f3] px-4 py-16"><form onSubmit={submit} className="mx-auto max-w-3xl rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm sm:p-10">
    <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-black uppercase tracking-widest text-[#ef5b16]">Red Solidaria</p><h1 className="mt-2 text-3xl font-black text-[#0a2f5f]">Datos de la solicitud</h1><p className="mt-2 text-slate-600">Te informaremos sobre el avance mediante el correo registrado.</p></div><Link to="/" className="hidden text-sm font-bold text-[#0a2f5f] hover:underline sm:block">Volver al inicio</Link></div>
    <label className="mt-8 block font-bold text-[#0a2f5f]">Tipo de solicitud<select name="type" value={form.type} onChange={update} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3.5 font-normal outline-none focus:border-[#ef5b16] focus:ring-4 focus:ring-orange-100">{REQUEST_TYPES.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <Field label="Nombre completo" name="name" value={form.name} onChange={update} required/><Field label="Correo" name="email" type="email" value={form.email} onChange={update} required/>
      <Field label="Teléfono" name="phone" value={form.phone} onChange={update}/><Field label="Asunto" name="subject" value={form.subject} onChange={update}/>
      <Field label="Región" name="region" value={form.region} onChange={update}/><Field label="Provincia" name="province" value={form.province} onChange={update}/>
      <Field label="Distrito" name="district" value={form.district} onChange={update}/><Field label="Dirección" name="address" value={form.address} onChange={update} required={point}/>
    </div>
    <RequestTypeFields type={form.type} values={form.details} onChange={updateDetails}/>
    {evidenceEnabled && ['EMERGENCIA','KIT'].includes(form.type) && <EvidencePicker files={files} onChange={setFiles}/>} 
    {/* Sección: selector de ubicación para las solicitudes de punto de acopio. */}{point && <section className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4"><h2 className="font-semibold">Selecciona la ubicación exacta en el mapa</h2><p className="mb-3 mt-1 text-sm text-slate-600">Haz clic en el mapa o arrastra el marcador. La dirección se completará automáticamente.</p><OpenStreetMapLocationPicker value={form} onChange={({latitude,longitude,address})=>setForm((v)=>({...v,latitude,longitude,address:address||v.address}))}/></section>} 
    <label className="mt-5 block font-bold text-[#0a2f5f]">Descripción<textarea name="description" value={form.description} onChange={update} rows="5" required className="mt-2 w-full rounded-xl border border-slate-300 p-3.5 font-normal outline-none focus:border-[#ef5b16] focus:ring-4 focus:ring-orange-100"/></label>
    <label className="mt-5 flex gap-3 rounded-xl bg-slate-50 p-4 text-sm leading-6"><input name="consent" type="checkbox" checked={form.consent} onChange={update} required className="mt-1 h-4 w-4 accent-[#ef5b16]"/>Autorizo el tratamiento de mis datos y el envío de comunicaciones sobre esta solicitud.</label>
    <button disabled={loading} className="mt-6 w-full rounded-2xl bg-[#ef5b16] p-4 font-bold text-white transition hover:bg-[#d94f0b] disabled:opacity-50">{loading?'Enviando...':'Enviar solicitud'}</button>{message&&<p className="mt-4 rounded-xl bg-orange-50 p-4 text-[#0a2f5f]">{message}</p>}
  </form></section></PublicLayout>
}
function Field({label,...props}) { return <label className="block font-bold text-[#0a2f5f]">{label}<input {...props} className="mt-2 w-full rounded-xl border border-slate-300 p-3.5 font-normal outline-none focus:border-[#ef5b16] focus:ring-4 focus:ring-orange-100"/></label> }
export default Register
