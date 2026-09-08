import { useEffect, useState } from 'react'
import { requestFields } from '../utils/requestValidation.mjs'
import { multiFields, options } from '../utils/requestOptions.mjs'
import { getPublicEmergencies } from '../services/request.service'
import catalog from '../data/ubigeo.json'
import StyledSelect from './StyledSelect'

const districts = catalog.districts.map(item => [item.distrito, catalog.provinces.find(p => p.id === item.provincia_id)?.provincia, catalog.departments.find(d => d.id === item.departamento_id)?.departamento].join(' · '))
const regions = catalog.departments.map(item => item.departamento)

function RequestTypeFields({ type, values, onChange }) {
  const [emergencies, setEmergencies] = useState([]), [error, setError] = useState(false)
  useEffect(() => {
    let active = true
    getPublicEmergencies().then(items => { if (active) setEmergencies(items) }).catch(() => { if (active) setError(true) })
    return () => { active = false }
  }, [])
  const change = (name, value) => onChange({ target: { name, value } })
  const emergencyOptions = [{value:'Indistinto', label:'Indistinto'}, ...emergencies.map(item => ({ value: item.id, label: [item.codigo || 'Emergencia', item.asunto || item.distrito || 'Sin título'].join(' · ') }))]
  // Sección: información específica de la solicitud y opciones estandarizadas.
  return <section className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
    <h2 className="font-semibold text-blue-950">Información específica</h2>
    <div className="mt-3 grid gap-4 sm:grid-cols-2">
      {requestFields(type, values).map(([name, label, inputType, required, extra]) => {
        const choices = name === 'emergencia_interes' ? emergencyOptions : name === 'zona_preferida' ? districts : ['cobertura', 'region_entrega'].includes(name) ? regions : options[name]
        if (choices) return <StyledSelect key={name} label={name === 'tipo_aliado' ? '¿Cómo deseas sumarte? (puedes elegir varias)' : name === 'zona_preferida' ? 'Distrito donde puedes apoyar' : label} required={required} options={choices} multiple={multiFields.includes(name)} value={values[name] || ''} onChange={value => { change(name, Array.isArray(value) ? value.join('; ') : value); if (name === 'emergencia_interes') change('emergencia_interes_nombre', emergencyOptions.find(item => item.value === value)?.label || 'Indistinto') }} />
        return <label key={name} className="block text-sm font-bold text-[#073164]">{label}{required ? ' *' : ''}<input name={name} type={inputType} required={required} value={values[name] || ''} onChange={onChange} {...extra} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white p-3 font-normal outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100" /></label>
      })}
    </div>
    {['ALIADO', 'OFERTA_RECURSO', 'VOLUNTARIO'].includes(type) && <>
      {error && <p role="status" className="mt-3 text-sm text-amber-800">No se pudo cargar la lista de emergencias. Puedes elegir Indistinto o recargar la página.</p>}
      <label className="mt-5 flex gap-3 text-sm"><input type="checkbox" required checked={Boolean(values.confirmacion_veracidad)} onChange={event => change('confirmacion_veracidad', event.target.checked)} />Confirmo que la información es verdadera y corresponde a un acuerdo o compromiso.</label>
    </>}
    {type === 'EMERGENCIA' && <p className="mt-3 text-sm text-slate-600">Adjunta fotos, PDF o videos en Evidencias. Para videos de más de 10 MB, comparte un enlace accesible para el equipo OLI, sin publicarlo en la página.</p>}
  </section>
}
export default RequestTypeFields
