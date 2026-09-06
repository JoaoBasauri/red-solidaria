const fields = {
  EMERGENCIA: [
    ['tipo_emergencia','Tipo de emergencia','text',true],
    ['fecha_emergencia','Fecha de la emergencia','date',true],
    ['poblacion_afectada','Personas afectadas','number',true,{min:1}],
    ['necesidades_urgentes','Necesidades urgentes','text',false],
  ],
  KIT: [
    ['tipo_kit','Tipo de kit','text',true],
    ['cantidad_solicitada','Cantidad de kits','number',true,{min:1}],
    ['poblacion_beneficiaria','Personas beneficiarias','number',true,{min:1}],
    ['fecha_necesidad','Fecha en que se necesitan','date',true],
    ['condiciones_especiales','Condiciones especiales','text',false],
  ],
  OFERTA_RECURSO: [
    ['tipo_recurso','Tipo de recurso','text',true],
    ['descripcion_recurso','Descripción del recurso','text',true],
    ['cantidad','Cantidad','number',false,{min:0,step:'any'}],
    ['unidad','Unidad de medida','text',false],
    ['disponibilidad_desde','Disponible desde','date',false],
    ['disponibilidad_hasta','Disponible hasta','date',false],
  ],
  ALIADO: [
    ['tipo_aliado','Tipo de aliado','text',true],
    ['nombre_organizacion','Nombre de la organización','text',true],
    ['cobertura','Zona o cobertura','text',true],
    ['capacidades','Capacidades que ofrece','text',true],
    ['sitio_web','Sitio web','url',false],
  ],
  VOLUNTARIO: [
    ['disponibilidad','Disponibilidad','text',true],
    ['habilidades','Habilidades','text',true],
    ['zona_preferida','Zona donde puede apoyar','text',true],
    ['fecha_nacimiento','Fecha de nacimiento','date',false],
  ],
  PUNTO_ACOPIO: [
    ['nombre_propuesto','Nombre propuesto del punto','text',true],
    ['responsable_nombre','Responsable del punto','text',true],
    ['responsable_telefono','Teléfono del responsable','tel',true],
    ['horario_propuesto','Horario propuesto','text',true],
    ['fecha_inicio','Fecha de inicio','date',false],
    ['fecha_fin','Fecha de cierre','date',false],
    ['capacidad_descripcion','Capacidad y condiciones del local','text',false],
  ],
}

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
