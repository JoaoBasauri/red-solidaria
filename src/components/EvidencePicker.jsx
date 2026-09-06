const allowed = '.jpg,.jpeg,.png,.webp,.pdf'

function EvidencePicker({ files, onChange }) {
  function select(event) {
    const selected = [...event.target.files].slice(0, 5)
    onChange(selected)
  }
  // Sección: carga opcional y listado de evidencias adjuntas a la solicitud.
  return <section className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
    <h2 className="font-semibold">Evidencias opcionales</h2>
    <p className="mt-1 text-sm text-slate-600">Hasta 5 archivos. Imágenes: 5 MB. PDF: 10 MB.</p>
    <input type="file" accept={allowed} multiple onChange={select} className="mt-3 block w-full text-sm" />
    {!!files.length && <ul className="mt-3 list-disc pl-5 text-sm">{files.map((file)=><li key={`${file.name}-${file.size}`}>{file.name}</li>)}</ul>}
  </section>
}

export default EvidencePicker
