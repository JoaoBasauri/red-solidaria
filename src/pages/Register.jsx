import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { createPublicRequest, isEvidenceUploadEnabled, REQUEST_TYPES, uploadEvidence } from '../services/request.service'
import OpenStreetMapLocationPicker from '../components/OpenStreetMapLocationPicker'
import RequestTypeFields from '../components/RequestTypeFields'
import EvidencePicker from '../components/EvidencePicker'
import LocationDropdowns from '../components/LocationDropdowns'
import PublicLayout from '../components/PublicLayout'
import StyledSelect from '../components/StyledSelect'
import { requestFields } from '../utils/requestValidation.mjs'

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
  const needsMap = point || form.type === 'EMERGENCIA'
  const update = ({ target }) => { if (target.name === 'type') setFiles([]); setForm((v) => ({...v,[target.name]:target.type==='checkbox'?target.checked:target.value,...(target.name==='type'?{details:{},region:'',province:'',district:'',address:'',latitude:'',longitude:''}:{})})); }
  const updateDetails = ({ target }) => setForm((v) => {
    const details = {...v.details,[target.name]:target.value}
    if (['tipo_participante', 'tipo_aliado'].includes(target.name)) {
      const visible = new Set(requestFields(v.type, details).map(([name]) => name))
      for (const key of Object.keys(details)) if (!visible.has(key) && !['confirmacion_veracidad', 'emergencia_interes_nombre'].includes(key)) delete details[key]
    }
    return {...v,details}
  })
  useEffect(()=>{isEvidenceUploadEnabled().then(setEvidenceEnabled)},[])

  async function submit(e) {
    e.preventDefault(); setLoading(true); setMessage('')
    try {
      if (needsMap && (form.latitude === '' || form.longitude === '')) throw new Error('Selecciona la ubicación en el mapa antes de enviar.')
      const result=await createPublicRequest({...form, ...(!needsMap ? {latitude:'',longitude:''} : {})})
      const results=await Promise.allSettled((evidenceEnabled && ['EMERGENCIA','KIT'].includes(form.type) ? files : []).map((file)=>uploadEvidence(result,file)))
      const failed=results.filter((item)=>item.status==='rejected').length
      setMessage(failed ? `Solicitud ${result.codigo} recibida, pero ${failed} evidencia(s) no pudieron cargarse.` : `Solicitud recibida. Código: ${result.codigo}`)
      setForm(empty); setFiles([])
    }
    catch (error) { setMessage(error.message || 'No se pudo registrar la solicitud.') }
    finally { setLoading(false) }
  }

  return <PublicLayout>
    {/* Sección: encabezado de la pantalla de solicitudes. */}
    <section className="mx-auto max-w-7xl px-5 pb-10 pt-16 text-[#073164] sm:px-8"><h1 className="text-4xl font-bold sm:text-5xl">Enviar una solicitud</h1><p className="mt-3 text-lg">No necesitas crear una cuenta. Te informaremos por correo.</p></section>
    {/* Sección: formulario público para registrar una solicitud. */}
    <section className="bg-white px-5 pb-20 sm:px-8"><form onSubmit={submit} className="mx-auto max-w-7xl rounded-[1.5rem] bg-white p-6 shadow-[0_3px_10px_#0002] sm:p-12 lg:p-20">
    <StyledSelect label="Tipo de solicitud" value={form.type} options={REQUEST_TYPES.map(([value,label])=>({value,label}))} onChange={value=>update({target:{name:'type',value}})} />
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <Field label="Nombre completo de la persona de contacto" name="name" minLength={2} value={form.name} onChange={update} required/><Field label="Correo de contacto" name="email" type="email" value={form.email} onChange={update} required/>
      <Field label="Teléfono de contacto" name="phone" type="tel" value={form.phone} onChange={update} required/><Field label="Asunto" name="subject" value={form.subject} onChange={update}/>
      <LocationDropdowns value={form} onChange={changes=>setForm(v=>({...v,...changes}))}/><Field label="Dirección" name="address" value={form.address} onChange={update} required={point}/>
    </div>
    <RequestTypeFields type={form.type} values={form.details} onChange={updateDetails}/>
    {evidenceEnabled && ['EMERGENCIA','KIT'].includes(form.type) && <EvidencePicker files={files} onChange={setFiles}/>} 
    {/* Sección: selector de ubicación para emergencias y puntos de acopio. */}{needsMap && <section className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4"><h2 className="font-semibold">Selecciona la ubicación exacta en el mapa</h2><p className="mb-3 mt-1 text-sm text-slate-600">Haz clic en el mapa o arrastra el marcador. La dirección, región, provincia y distrito se completarán automáticamente. Revisa los datos antes de enviar.</p><OpenStreetMapLocationPicker key={form.type} value={form} onChange={(location)=>setForm((v)=>({...v,...location}))}/></section>} 
    <label className="mt-5 block font-bold text-[#0a2f5f]">Descripción<textarea name="description" value={form.description} onChange={update} rows="5" minLength={5} required className="mt-2 w-full rounded-xl border border-slate-300 p-3.5 font-normal outline-none focus:border-[#ef5b16] focus:ring-4 focus:ring-orange-100"/></label>
    <label className="mt-5 flex gap-3 rounded-xl bg-slate-50 p-4 text-sm leading-6"><input name="consent" type="checkbox" checked={form.consent} onChange={update} required className="mt-1 h-4 w-4 accent-[#ef5b16]"/>Autorizo el tratamiento de mis datos y el envío de comunicaciones sobre esta solicitud.</label>
    <button disabled={loading} className="mt-6 w-full rounded-2xl bg-[#ef5b16] p-4 font-bold text-white transition hover:bg-[#d94f0b] disabled:opacity-50">{loading?'Enviando...':'Enviar solicitud'}</button>{message&&<p className="mt-4 rounded-xl bg-orange-50 p-4 text-[#0a2f5f]">{message}</p>}
  </form></section></PublicLayout>
}
function Field({label,...props}) { return <label className="block font-bold text-[#0a2f5f]">{label}<input {...props} className="mt-2 w-full rounded-xl border border-slate-300 p-3.5 font-normal outline-none focus:border-[#ef5b16] focus:ring-4 focus:ring-orange-100"/></label> }
export default Register
