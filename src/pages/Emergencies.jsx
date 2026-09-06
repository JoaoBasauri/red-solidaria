import EmergencyPhoto from "../components/EmergencyPhoto";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PublicLayout from "../components/PublicLayout";
import OpenStreetMapPoints from "../components/OpenStreetMapPoints";
import { getPublicEmergencies } from "../services/request.service";

export default function Emergencies() {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  useEffect(() => {
    let active = true;
    getPublicEmergencies().then((data) => { if (active) setEmergencies(data); })
      .catch(() => { if (active) setError("No se pudieron cargar las emergencias. Intenta recargar la página."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const markers = useMemo(() => emergencies.filter((item) => item.latitud != null && item.longitud != null).map((item) => ({
    ...item, emergencia: true,
    nombre_publico: `${item.es_demo ? "[Demo] " : ""}${item.titulo}`,
    direccion_publica: `${[item.distrito, item.provincia, item.region].filter(Boolean).join(" · ")} · Ubicación aproximada`,
  })), [emergencies]);

  return <PublicLayout>
    {/* Sección: presentación del portal público de emergencias aprobadas que requieren apoyo. */}
    <section className="bg-white px-5 pb-12 pt-10 text-[#073164] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl"><p className="text-2xl font-bold uppercase text-[#ff7830]">OLI Conecta</p><h1 className="mt-6 text-4xl font-bold text-[#ef5700] sm:text-5xl">Emergencias Activas</h1><p className="mt-8 max-w-lg text-lg leading-6 sm:text-justify">Emergencias aprobadas por OLI que requieren coordinación y apoyo.</p></div>
    </section>

    {/* Sección: mapa interactivo con las ubicaciones aproximadas de las emergencias activas. */}
    <section aria-label="Mapa de emergencias activas" className="bg-white px-5 text-[#073164] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {error && <p role="alert" className="rounded-2xl bg-red-50 p-6 text-red-800">{error}</p>}
        {loading ? <div role="status" className="flex h-80 items-center justify-center rounded-3xl bg-slate-100 sm:h-[29rem]">Cargando emergencias...</div> : !error && (markers.length ? <>
          <OpenStreetMapPoints points={markers} selectedId={selectedId} label="Ubicaciones aproximadas de emergencias activas" className="h-80 sm:h-[29rem]" />
          <p className="mt-5 text-center text-base leading-6 sm:text-lg">Círculos naranjas: emergencias. Selecciona una ubicación para ver su información.</p>
          <p className="mt-2 text-center text-sm text-slate-500">Las ubicaciones son aproximadas para proteger a los solicitantes.</p>
        </> : <p className="rounded-3xl bg-orange-50 p-10 text-center">{emergencies.length ? "Las emergencias publicadas aún no tienen una ubicación disponible en el mapa." : "No hay emergencias aprobadas pendientes de atención."}</p>)}
      </div>
    </section>

    {/* Sección: tarjetas de emergencias con estado, ubicación, población afectada y opciones de apoyo. */}
    <section aria-label="Emergencias que requieren apoyo" className="bg-white px-5 pb-24 pt-14 text-[#073164] sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-[67rem] gap-6 md:grid-cols-2">
        {emergencies.map((item) => <article key={item.id} className={`rounded-[1.25rem] border border-[#dfd0e9] bg-white p-6 shadow-[0_3px_8px_#00000020] sm:p-8 ${selectedId === item.id ? "ring-2 ring-orange-300" : ""}`}>
          <div className="grid items-start gap-5 sm:grid-cols-[.95fr_1.05fr] md:grid-cols-1 lg:grid-cols-[.95fr_1.05fr]">
            <EmergencyPhoto emergency={item} />
            <div><div className="flex flex-wrap gap-2"><span className="rounded-full bg-[#ec407a] px-3 py-0.5 text-sm font-bold text-white">ACTIVA</span>{item.es_demo && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-800">Demo</span>}</div>
              <h2 className="mt-2 text-lg font-bold leading-6">{item.titulo}</h2>
              <p className="mt-1 flex items-start gap-1 text-base leading-6"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-1 h-4 w-4 shrink-0 text-[#ef5700]"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>{[item.distrito, item.provincia].filter(Boolean).join(" · ") || item.region || "Ubicación por confirmar"}</p>
              {item.poblacion_afectada != null && <p className="flex items-start gap-1 text-base leading-6"><svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="mt-1 h-4 w-4 shrink-0 text-[#ef5700]"><circle cx="12" cy="6" r="4" /><path d="M5 22v-5a7 7 0 0 1 14 0v5Z" /></svg>{item.poblacion_afectada} personas afectadas</p>}
            </div>
          </div>
          {item.tipo_emergencia && <p className="mt-5 text-sm text-slate-600">Tipo de emergencia: {item.tipo_emergencia}</p>}
          <h3 className="mt-4 font-bold">Recursos necesarios:</h3><p className="mt-1 text-sm leading-6">Consulta con el equipo OLI las necesidades prioritarias antes de coordinar tu aporte.</p>
          <div className="mt-5 flex flex-wrap gap-3"><Link to="/solicitud?tipo=OFERTA_RECURSO" className="rounded-xl bg-[#ef5700] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#d54d00]">Ofrecer ayuda</Link>{markers.some((marker) => marker.id === item.id) && <button type="button" onClick={() => setSelectedId(item.id)} aria-pressed={selectedId === item.id} className="rounded-xl bg-orange-50 px-4 py-2.5 text-sm font-semibold text-[#ad4200] transition hover:bg-orange-100">Ver ubicación</button>}</div>
        </article>)}
      </div>
      <div className="mt-12 text-center"><Link to="/solicitud?tipo=EMERGENCIA" className="inline-flex rounded-2xl bg-[#073164] px-6 py-3 font-bold text-white transition hover:bg-[#1d5088]">Reportar una emergencia</Link></div>
    </section>
  </PublicLayout>;
}
