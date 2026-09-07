import { useEffect, useMemo, useState } from 'react';
import { getAcceptedVolunteers } from '../services/request.service';

const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const details = item => Array.isArray(item.solicitud_voluntario) ? item.solicitud_voluntario[0] || {} : item.solicitud_voluntario || {};

export default function AcceptedVolunteers() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let active = true;
    getAcceptedVolunteers().then(data => { if (active) setItems(data); })
      .catch(() => { if (active) setError('No se pudieron cargar los voluntarios aceptados.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refresh]);
  const filtered = useMemo(() => items.filter(item => {
    const info = details(item);
    return normalize([item.nombre_solicitante, item.email_solicitante, item.region, item.provincia, item.distrito, info.habilidades, info.disponibilidad, info.zona_preferida].join(' ')).includes(normalize(query).trim());
  }), [items, query]);
  return <>
    {/* Sección: tabla interna de voluntarios aprobados para contactar según habilidades, disponibilidad y ubicación. */}
    <section aria-labelledby="voluntarios-title" className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 id="voluntarios-title" className="text-xl font-black text-[#073164]">Voluntarios aceptados</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Personas registradas en la Red Solidaria con solicitud aprobada. Consulta sus habilidades, disponibilidad y ubicación para contactarlas cuando exista una oportunidad compatible con su perfil.</p><p className="mt-1 text-xs text-slate-500">Este registro no les concede una cuenta ni acceso al panel OLI.</p></div><button type="button" disabled={loading} onClick={() => { setLoading(true); setError(''); setRefresh(value => value + 1); }} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold transition hover:bg-slate-50 disabled:opacity-50">Actualizar</button></div>
        <label className="mt-5 block text-sm font-bold text-slate-700">Buscar voluntarios<input value={query} onChange={e => setQuery(e.target.value)} placeholder="Nombre, correo, habilidad, disponibilidad o ubicación" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100" /></label>
      </div>
      {loading ? <p role="status" className="px-6 pb-6 text-slate-500">Cargando voluntarios...</p> : error ? <p role="alert" className="mx-6 mb-6 rounded-xl bg-red-50 p-4 text-red-800">{error}</p> : <>
        <p className="px-6 pb-3 text-sm text-slate-500">{filtered.length} de {items.length} registros aprobados</p>
        <div className="overflow-x-auto"><table className="w-full min-w-[950px] text-left text-sm"><caption className="sr-only">Voluntarios con solicitud aprobada y datos para coordinación de oportunidades</caption><thead className="bg-slate-100 text-[#073164]"><tr>{['Voluntario', 'Contacto', 'Habilidades', 'Disponibilidad', 'Ubicación', 'Zona preferida'].map(label => <th key={label} scope="col" className="px-5 py-4 font-bold">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">
          {filtered.map(item => { const info = details(item); return <tr key={item.id} className="align-top hover:bg-orange-50/40"><th scope="row" className="px-5 py-4 font-semibold text-[#073164]">{item.nombre_solicitante}<span className="mt-1 block text-xs font-normal text-slate-500">{item.codigo}</span>{item.codigo?.startsWith('RS-DEMO-') && <span className="text-xs text-orange-700">Demo</span>}</th><td className="break-words px-5 py-4">{item.email_solicitante || 'Sin correo'}<span className="mt-1 block text-slate-500">{item.telefono_solicitante || 'Sin teléfono'}</span></td><td className="max-w-64 whitespace-pre-wrap break-words px-5 py-4">{info.habilidades || 'No indicadas'}</td><td className="max-w-56 whitespace-pre-wrap break-words px-5 py-4">{info.disponibilidad || 'No indicada'}</td><td className="px-5 py-4">{[item.distrito, item.provincia, item.region].filter(Boolean).join(', ') || 'No indicada'}</td><td className="max-w-48 whitespace-pre-wrap break-words px-5 py-4">{info.zona_preferida || 'No indicada'}</td></tr>; })}
          {!filtered.length && <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-500">{items.length ? 'No hay voluntarios que coincidan con la búsqueda.' : 'Todavía no hay solicitudes de voluntariado aprobadas.'}</td></tr>}
        </tbody></table></div>
      </>}
    </section>
  </>;
}
