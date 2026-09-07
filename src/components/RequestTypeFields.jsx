import { fields } from '../utils/requestValidation.mjs'

function RequestTypeFields({ type, values, onChange }) {
  // Sección: campos específicos que cambian según el tipo de solicitud.
  return <section className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
    <h2 className="font-semibold text-blue-950">Información específica</h2>
    <div className="mt-3 grid gap-4 sm:grid-cols-2">
      {fields[type].map(([name,label,inputType,required,extra]) =>
        <label key={name} className="block font-medium">{label}
          <input name={name} type={inputType} required={required} value={values[name] || ''} onChange={onChange} {...extra} className="mt-1 w-full rounded-lg border bg-white p-3 font-normal" />
        </label>
      )}
    </div>
  </section>
}

export default RequestTypeFields
