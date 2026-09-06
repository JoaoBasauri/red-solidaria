import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import OpenStreetMapPoints from "../components/OpenStreetMapPoints";
import PublicLayout from "../components/PublicLayout";
import { getPublishedCollectionPoints } from "../services/request.service";

function pointZone(point) {
  const name = point.nombre_publico || "";
  if (/lima este/i.test(name)) return "Lima Este";
  if (/lima centro/i.test(name)) return "Lima Centro";
  return point.distrito || point.region || "Otros puntos";
}

function InfoIcon({ type }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-4 w-4 shrink-0">
    {type === "Dirección" ? <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></> : type === "Horario" ? <><circle cx="12" cy="12" r="9" /><path d="M12 6v6l3 2" /></> : <path d="m7 3 3 5-3 2a13 13 0 0 0 7 7l2-3 5 3-1 4C10 23 1 14 3 4Zm9 0a6 6 0 0 1 5 5m-5-1a2 2 0 0 1 1 1" />}
  </svg>;
}

function PointCard({ point, selected, onSelect }) {
  const marker = useMemo(() => [point], [point]);
  return <article className={`grid gap-5 rounded-[1.5rem] bg-white p-4 shadow-[0_3px_10px_#00000020] sm:grid-cols-[.9fr_1fr] lg:grid-cols-1 xl:grid-cols-[.9fr_1fr] ${selected ? "ring-2 ring-[#a8a2ef]" : ""}`}>
    <div className="min-w-0 self-stretch"><OpenStreetMapPoints points={marker} compact label={`Ubicación de ${point.nombre_publico}`} className="h-52 sm:h-full sm:min-h-56 lg:h-48 xl:h-full" /></div>
    <div className="min-w-0 py-2">
      <h3 className="text-lg font-bold text-[#073164]">{point.nombre_publico}</h3>
      {point.descripcion_publica && <p className="mt-3 text-sm leading-5">{point.descripcion_publica}</p>}
      <dl className="mt-5 space-y-3">
        {[["Dirección", point.direccion_publica], ["Horario", point.horario], ["Contacto", point.contacto_publico]].map(([label, value]) => value && <div key={label} className="flex gap-2"><InfoIcon type={label} /><div><dt className="text-xs font-semibold uppercase">{label}</dt><dd className="mt-1 break-words text-xs leading-5">{value}</dd></div></div>)}
      </dl>
      <button type="button" onClick={onSelect} aria-pressed={selected} className="mt-4 rounded-full bg-[#f0edff] px-4 py-2 text-sm font-semibold text-[#073164] transition hover:bg-[#e1dcff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#073164]">Ver en el mapa</button>
    </div>
  </article>;
}

export default function CollectionPoints() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [zone, setZone] = useState("");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  useEffect(() => {
    let active = true;
    getPublishedCollectionPoints().then((data) => { if (active) setPoints(data); })
      .catch(() => { if (active) setError("No se pudieron cargar los puntos de acopio. Intenta recargar la página."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const zones = useMemo(() => [...new Set(points.map(pointZone))].sort(), [points]);
  const visiblePoints = useMemo(() => points.filter((point) => (!zone || pointZone(point) === zone) && [point.nombre_publico, point.direccion_publica, point.descripcion_publica].filter(Boolean).join(" ").toLocaleLowerCase("es").includes(search.trim().toLocaleLowerCase("es"))), [points, zone, search]);
  const selectedVisibleId = visiblePoints.some((point) => point.id === selectedId) ? selectedId : null;

  return <PublicLayout>
    {/* Sección: presentación del portal público de puntos de acopio. */}
    <section className="bg-white px-5 pb-10 pt-10 text-[#073164] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-2xl font-bold uppercase text-[#ff7830]">OLI Conecta</p>
        <h1 className="mt-6 text-4xl font-bold text-[#ef5700] sm:text-5xl">Puntos de Acopio</h1>
        <p className="mt-8 max-w-lg text-lg leading-6">Encuentra espacios publicados por Fundación OLI para entregar donaciones de manera segura y coordinada.</p>
      </div>
    </section>
    {/* Sección: filtros, tarjetas de los puntos publicados y mapa de sus ubicaciones. */}
    <section className="bg-white px-5 pb-20 text-[#073164] sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl items-start gap-8 lg:grid-cols-[.85fr_1.15fr] lg:gap-10">
        <div className="min-w-0">
          <h2 className="mt-5 text-xl font-bold text-[#ef5700]">Puntos disponibles</h2>
          <div className="my-7 flex items-center gap-3">
            <div className="flex flex-1 flex-wrap gap-2" role="group" aria-label="Filtrar puntos por zona">
              <button type="button" aria-pressed={!zone} onClick={() => setZone("")} className={`rounded-full border px-5 py-2.5 text-sm transition ${!zone ? "border-transparent bg-[#edebff] font-bold" : "border-slate-400 hover:bg-slate-50"}`}>Todos</button>
              {zones.map((item) => <button key={item} type="button" aria-pressed={zone === item} onClick={() => setZone(item)} className={`rounded-full border px-5 py-2.5 text-sm transition ${zone === item ? "border-transparent bg-[#edebff] font-bold" : "border-slate-400 hover:bg-slate-50"}`}>{item}</button>)}
            </div>
            <button type="button" aria-label="Mostrar búsqueda de puntos" aria-expanded={showFilters} aria-controls="point-search" onClick={() => { setShowFilters((open) => !open); if(showFilters) setSearch(""); }} className="rounded-xl p-3 text-slate-600 hover:bg-[#edebff]"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6"><path d="M2 5h20M2 12h20M2 19h20" /><circle cx="8" cy="5" r="2" fill="white" /><circle cx="16" cy="12" r="2" fill="white" /><circle cx="10" cy="19" r="2" fill="white" /></svg></button>
          </div>
          {showFilters && <div id="point-search" className="mb-6"><label htmlFor="point-search-input" className="text-sm font-semibold">Buscar por nombre, dirección o artículos recibidos</label><input id="point-search-input" type="search" value={search} onChange={(event) => setSearch(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#ef5700] focus:ring-2 focus:ring-orange-100" placeholder="Busca un punto de acopio" /></div>}
          {error && <p role="alert" className="rounded-2xl bg-red-50 p-5 text-red-800">{error}</p>}
          {loading ? <p role="status" className="rounded-2xl bg-slate-100 p-8">Cargando puntos de acopio...</p> : !error && <><p role="status" className="sr-only">{visiblePoints.length} puntos disponibles</p><div className="grid gap-4">{visiblePoints.map((point) => <PointCard key={point.id} point={point} selected={selectedVisibleId === point.id} onSelect={() => setSelectedId(point.id)} />)}</div>{!visiblePoints.length && <p className="rounded-2xl bg-orange-50 p-8">{points.length ? "No hay puntos que coincidan con los filtros." : "Aún no hay puntos publicados."}</p>}</>}
          <Link to="/solicitud?tipo=PUNTO_ACOPIO" className="mt-7 inline-flex rounded-2xl bg-[#ef5700] px-5 py-3 font-semibold text-white transition hover:bg-[#d64d00]">Proponer un punto de acopio</Link>
        </div>
        <div className="min-w-0 lg:sticky lg:top-28">
          {loading ? <div className="h-96 animate-pulse rounded-3xl bg-slate-100 lg:h-[42rem]" /> : visiblePoints.length > 0 ? <OpenStreetMapPoints points={visiblePoints} selectedId={selectedVisibleId} className="h-96 lg:h-[min(46rem,75dvh)]" /> : <div className="flex h-80 items-center justify-center rounded-3xl bg-slate-100 p-8 text-center text-slate-600">{error ? "El mapa estará disponible cuando se carguen los puntos." : "Las ubicaciones aparecerán aquí cuando haya puntos disponibles."}</div>}
          <p className="mt-3 text-sm text-slate-500">Selecciona un marcador para ver su información. Confirma el horario antes de acercarte.</p>
        </div>
      </div>
    </section>
  </PublicLayout>;
}
