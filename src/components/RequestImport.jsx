import { useEffect, useRef, useState } from 'react'
import catalog from '../data/ubigeo.json'
import { createPublicRequest, getPublicEmergencies, REQUEST_TYPES } from '../services/request.service'
import { geocodeRows, MAP_TYPES, MAX_IMPORT_ROWS, parseImportRows, templateColumns, TEMPLATE_SUBJECT } from '../utils/requestImport.mjs'

const labels=Object.fromEntries(REQUEST_TYPES)
const mapLink=f=>`https://www.openstreetmap.org/?mlat=${f.latitude}&mlon=${f.longitude}#map=18/${f.latitude}/${f.longitude}`
const fileNames={EMERGENCIA:'emergencias',KIT:'kits',OFERTA_RECURSO:'ofertas-recursos',ALIADO:'aliados',VOLUNTARIO:'voluntarios',PUNTO_ACOPIO:'puntos-acopio'}

// Plantilla por tipo: hoja "Solicitudes" con los encabezados y hoja "Instrucciones" con el formato de cada columna.
async function downloadTemplate(type,emergencies){
 const XLSX=await import('xlsx'),columns=templateColumns(type,{emergencies}),book=XLSX.utils.book_new()
 const data=XLSX.utils.aoa_to_sheet([columns.map(c=>c.header)])
 data['!cols']=columns.map(c=>({wch:Math.min(45,Math.max(14,c.header.length+2))}))
 XLSX.utils.book_append_sheet(book,data,'Solicitudes')
 const help=XLSX.utils.aoa_to_sheet([
  ['Plantilla de carga',labels[type]],
  [],
  ['1. Completa una fila por solicitud en la hoja «Solicitudes», sin cambiar los encabezados.'],
  ['2. Las columnas con * son obligatorias. Las marcadas «(si aplica)» dependen de otras respuestas, por ejemplo si es persona u organización.'],
  ['3. Cada solicitante recibirá el correo de confirmación, igual que si llenara el formulario web.'],
  [`4. Máximo ${MAX_IMPORT_ROWS} filas por archivo. Carga el archivo desde el panel OLI con «Cargar desde Excel».`],
  ...(MAP_TYPES.includes(type)?[['5. Ubicación: en Google Maps haz clic derecho sobre el lugar exacto y clic en las coordenadas para copiarlas. El primer número va en Latitud y el segundo en Longitud, con punto decimal y 5 o más decimales (por ejemplo -12.08712 y -77.03645). La dirección, región, provincia y distrito se generan automáticamente a partir de las coordenadas y se muestran en la revisión antes de crear las solicitudes.']]:[]),
  [],
  ['Columna','Obligatoria','Formato o valores permitidos'],
  ...columns.map(c=>[c.label,c.required?(c.conditional?'Si aplica':'Sí'):'No',c.hint]),
 ])
 help['!cols']=[{wch:45},{wch:12},{wch:110}]
 XLSX.utils.book_append_sheet(book,help,'Instrucciones')
 book.Props={Title:`Plantilla de carga · ${labels[type]}`,Subject:`${TEMPLATE_SUBJECT}${type}`}
 XLSX.writeFile(book,`plantilla-${fileNames[type]||type.toLowerCase()}.xlsx`)
}

export default function RequestImport({onClose,onImported}){
 const [type,setType]=useState('EMERGENCIA'),[emergencies,setEmergencies]=useState([]),[file,setFile]=useState(null),[result,setResult]=useState(null)
 const [error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[progress,setProgress]=useState(null),[created,setCreated]=useState(null),[locating,setLocating]=useState(null)
 const readId=useRef(0)
 useEffect(()=>()=>{readId.current++},[])
 useEffect(()=>{let active=true;getPublicEmergencies().then(items=>{if(active)setEmergencies(items)}).catch(()=>{});return ()=>{active=false}},[])
 useEffect(()=>{const onKey=e=>{if(e.key==='Escape'&&!progress)onClose()};window.addEventListener('keydown',onKey);return ()=>window.removeEventListener('keydown',onKey)},[onClose,progress])
 const valid=result?.rows.filter(r=>!r.error&&!r.pending)||[],invalid=result?.rows.filter(r=>r.error)||[]
 async function template(){try{setBusy(true);await downloadTemplate(type,emergencies)}catch(e){setError(`No se pudo generar la plantilla: ${e.message}`)}finally{setBusy(false)}}
 async function read(selected,selectedType=type){
  const id=++readId.current
  setFile(selected);setResult(null);setCreated(null);setError('');setNotice('');setLocating(null)
  if(!selected)return
  try{
   setBusy(true)
   const XLSX=await import('xlsx'),book=XLSX.read(await selected.arrayBuffer())
   const fromFile=String(book.Props?.Subject||'').startsWith(TEMPLATE_SUBJECT)?book.Props.Subject.slice(TEMPLATE_SUBJECT.length):''
   let parseType=selectedType
   if(fromFile&&labels[fromFile]&&fromFile!==selectedType){parseType=fromFile;setType(fromFile);setNotice(`El archivo es la plantilla de «${labels[fromFile]}», así que se usó ese tipo.`)}
   const sheet=book.Sheets.Solicitudes||book.Sheets[book.SheetNames[0]]
   const rows=XLSX.utils.sheet_to_json(sheet,{defval:'',raw:true})
   if(!rows.length)throw new Error('El archivo no tiene filas con datos.')
   const parsed=parseImportRows(parseType,rows,{catalog,emergencies})
   setResult(parsed);setBusy(false)
   // Tipos con mapa: dirección, región, provincia y distrito se obtienen de las coordenadas, una consulta por segundo.
   const pending=parsed.rows.filter(r=>r.pending).length
   if(!pending)return
   setLocating({current:0,total:pending})
   const located=await geocodeRows(parsed.rows,{catalog,onProgress:(current,total)=>{if(readId.current===id)setLocating({current,total})},cancelled:()=>readId.current!==id})
   if(located&&readId.current===id){setResult({...parsed,rows:located});setLocating(null)}
  }catch(e){if(readId.current===id){setError(e.message);setLocating(null)}}finally{if(readId.current===id)setBusy(false)}
 }
 function changeType(next){setType(next);if(file)read(file,next)}
 async function createAll(){
  const done=[],failed=[]
  setProgress({current:0,total:valid.length})
  for(const [index,row] of valid.entries()){
   try{const saved=await createPublicRequest(row.form);done.push({line:row.line,codigo:saved?.codigo,name:row.form.name})}
   catch(e){failed.push({line:row.line,name:row.form.name,error:e.message})}
   setProgress({current:index+1,total:valid.length})
  }
  setProgress(null);setCreated({done,failed});setResult(null);setFile(null)
  if(done.length)onImported()
 }
 /* Sección: carga masiva de solicitudes desde Excel con plantillas por tipo. */
 return <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/50 p-4" onClick={()=>!progress&&onClose()}><div role="dialog" aria-modal="true" aria-labelledby="import-title" onClick={e=>e.stopPropagation()} className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
  <div className="flex items-start justify-between gap-3"><div><h2 id="import-title" className="text-lg font-bold">Cargar solicitudes desde Excel</h2><p className="mt-1 text-sm text-slate-600">Descarga la plantilla del tipo de solicitud, complétala y súbela. Revisaremos cada fila antes de crear las solicitudes.</p></div><button onClick={onClose} disabled={Boolean(progress)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40" aria-label="Cerrar">×</button></div>
  <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"><label className="grid gap-1 text-xs font-semibold text-slate-500">Tipo de solicitud<select value={type} onChange={e=>changeType(e.target.value)} disabled={Boolean(progress)} className="w-full rounded-lg border p-2.5 text-sm font-normal text-slate-900">{REQUEST_TYPES.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label><button onClick={template} disabled={busy||Boolean(progress)} className="rounded-lg border border-emerald-700 px-4 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 disabled:opacity-50">Descargar plantilla</button></div>
  <label className="mt-4 flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-slate-300 p-5 text-center text-sm transition hover:border-blue-400 hover:bg-blue-50/40"><span className="font-semibold text-blue-700">{file?file.name:'Seleccionar archivo Excel'}</span><span className="text-xs text-slate-500">.xlsx, .xls o .csv · máximo {MAX_IMPORT_ROWS} filas</span><input type="file" accept=".xlsx,.xls,.csv" className="sr-only" disabled={Boolean(progress)} onChange={e=>{read(e.target.files?.[0]||null);e.target.value=''}}/></label>
  {busy&&<p className="mt-3 text-sm text-slate-500">Leyendo archivo...</p>}
  {notice&&<p className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">{notice}</p>}
  {error&&<p className="mt-3 rounded-lg bg-red-100 p-3 text-sm text-red-800">{error}</p>}
  {result&&<div className="mt-4"><div className="flex flex-wrap gap-2 text-sm"><span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-800">{valid.length} listas para crear</span>{invalid.length>0&&<span className="rounded-full bg-red-100 px-3 py-1 font-semibold text-red-800">{invalid.length} con errores (no se crearán)</span>}</div>{locating&&<div className="mt-3"><p className="text-sm font-semibold text-slate-700">Ubicando en el mapa {locating.current} de {locating.total}... (aprox. 1 por segundo)</p><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-blue-600 transition-all" style={{width:`${locating.total?locating.current/locating.total*100:0}%`}}/></div></div>}{result.unknown.length>0&&<p className="mt-2 text-xs text-amber-800">Columnas ignoradas porque no son de la plantilla: {result.unknown.join(', ')}.</p>}
   <div className="mt-3 max-h-72 overflow-y-auto rounded-xl border"><table className="w-full text-left text-sm"><thead className="sticky top-0 bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-3 py-2">Fila</th><th className="px-3 py-2">Solicitante</th>{MAP_TYPES.includes(type)&&<th className="px-3 py-2">Ubicación</th>}<th className="px-3 py-2">Resultado</th></tr></thead><tbody className="divide-y">{result.rows.map(r=><tr key={r.line} className={r.error?'bg-red-50/50':''}><td className="px-3 py-2 font-mono text-xs">{r.line}</td><td className="px-3 py-2"><p className="font-semibold">{r.form.name||'—'}</p><p className="text-xs text-slate-500">{r.form.email}</p></td>{MAP_TYPES.includes(type)&&<td className="px-3 py-2 text-xs">{r.form.district&&<p className="font-semibold text-slate-800">{[r.form.district,r.form.province,r.form.region].join(' · ')}</p>}{r.form.address&&<p className="text-slate-500">{r.form.address}</p>}{r.pending&&<p className="text-slate-500">Ubicando...</p>}{r.form.latitude&&r.form.longitude&&<a href={mapLink(r.form)} target="_blank" rel="noreferrer" className="font-semibold text-blue-700 hover:underline">Ver en mapa</a>}</td>}<td className={`px-3 py-2 ${r.error?'text-red-700':r.pending?'text-slate-500':'text-emerald-700'}`}>{r.error||(r.pending?'Pendiente de ubicar':'Lista')}</td></tr>)}</tbody></table></div>
   <p className="mt-3 text-xs text-slate-500">Cada solicitante recibirá el correo de confirmación, igual que con el formulario web. Corrige las filas con errores en el archivo y vuelve a subirlo si quieres incluirlas.{MAP_TYPES.includes(type)&&' Revisa con «Ver en mapa» que cada punto esté en el lugar correcto.'}</p></div>}
  {progress&&<div className="mt-4"><p className="text-sm font-semibold">Creando solicitud {progress.current} de {progress.total}...</p><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-emerald-600 transition-all" style={{width:`${progress.total?progress.current/progress.total*100:0}%`}}/></div></div>}
  {created&&<div className="mt-4 space-y-2 text-sm">{created.done.length>0&&<p className="rounded-lg bg-emerald-50 p-3 text-emerald-800">Se crearon {created.done.length} {created.done.length===1?'solicitud':'solicitudes'}: {created.done.map(d=>d.codigo).filter(Boolean).join(', ')}.</p>}{created.failed.length>0&&<div className="rounded-lg bg-red-50 p-3 text-red-800"><p className="font-semibold">No se pudieron crear {created.failed.length}:</p><ul className="mt-1 list-disc pl-5">{created.failed.map(f=><li key={f.line}>Fila {f.line} ({f.name}): {f.error}</li>)}</ul></div>}</div>}
  <div className="mt-6 flex justify-end gap-2"><button onClick={onClose} disabled={Boolean(progress)} className="rounded-lg border px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">{created?'Cerrar':'Cancelar'}</button>{result&&<button onClick={createAll} disabled={!valid.length||Boolean(progress)||Boolean(locating)} className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50">Crear {valid.length} {valid.length===1?'solicitud':'solicitudes'}</button>}</div>
 </div></div>
}
