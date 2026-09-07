import EmergencyPhoto from "../components/EmergencyPhoto";
import EmergencyResources from "../components/EmergencyResources";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublicLayout from "../components/PublicLayout";
import { getPublicEmergencies } from "../services/request.service";

const A = "/assets/red-solidaria";
const gradient = "bg-gradient-to-r from-[#bb2383] to-[#692878]";
// Los resultados ejecutados no se infieren de solicitudes aprobadas, metas ni registros demo.
// Hasta disponer de una fuente pública validada, un guion significa dato no publicado, no cero.
const indicators = [
  ["Distritos en emergencia atendidos", "fi-rs-marker.png"],
  ["Kits entregados", "fi-rs-box-alt.png"],
  ["Familias atendidas", "Group 1287.png"],
  ["Aliados activos", "fi-rr-hand-holding-heart.png"],
  ["Toneladas recibidas", "fi-rs-truck-side.png"],
];

function IconBadge({ file, className = "" }) {
  return <span className={`inline-flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#e5bfef] ${className}`}><img src={`${A}/reporta-${file}`} alt="" className="h-10 w-10 object-contain" /></span>;
}

function ReportMark() {
  return <div aria-label="OLI reporta" role="img" className="mx-auto w-64 text-center text-white sm:w-72">
    <div aria-hidden="true" className="flex items-center justify-center gap-2"><span className="text-[112px] font-black leading-none tracking-[-.09em]">oli</span><svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="mt-6 h-28 w-28"><path d="M12 38 65 17v62L12 59Z M12 39H5v19h7 M23 64l-4 20 14 4 6-18 M78 25l12-9 M80 47h14 M78 68l12 10" /></svg></div>
    <span aria-hidden="true" className="text-5xl font-bold tracking-wide">reporta</span>
  </div>;
}

export default function Report() {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    getPublicEmergencies()
      .then((data) => { if (active) setEmergencies(data || []); })
      .catch(() => { if (active) setError("No se pudieron cargar las emergencias. Intenta recargar la página."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return <PublicLayout>
    {/* Sección: presentación de OLI Reporta y compromiso con la transparencia. */}
    <section className={`${gradient} px-5 py-16 text-white sm:px-8 lg:px-10 lg:py-24`}>
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:min-h-[22rem] lg:grid-cols-[1.2fr_1fr] lg:gap-28">
        <div><h1 className="text-4xl leading-tight sm:text-5xl sm:leading-tight">La ayuda también necesita <strong className="font-bold">transparencia.</strong></h1>
          <p className="mt-5 text-lg leading-6">Para <strong>Fundación OLI</strong>, responder a una emergencia no termina cuando entregamos la ayuda.<br />También debemos saber qué hicimos, dónde lo hicimos, a quién llegamos y qué recursos movilizamos.</p>
          <p className="mt-8 rounded-[1.25rem] border border-white px-6 py-5 text-lg leading-6 sm:px-9">Por eso hacemos seguimiento de nuestra respuesta y compartimos información sobre el trabajo realizado.</p>
        </div><ReportMark />
      </div>
    </section>

    {/* Sección: indicadores de impacto correspondientes a acciones efectivamente realizadas. */}
    <section id="impacto" aria-labelledby="impacto-title" className="scroll-mt-32 bg-white px-5 py-14 text-[#073164] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl text-center"><h2 id="impacto-title" className="text-3xl font-bold text-[#702780]">NUESTRO IMPACTO</h2><p className="mt-2 text-lg">Cifras que reflejan la fuerza de la solidaridad</p>
        <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
          {indicators.map(([label, file]) => <div key={label}><h3 className="mx-auto min-h-16 max-w-56 text-lg leading-6 sm:text-xl">{label}</h3><IconBadge file={file} className="mt-3" /><p aria-label="Resultado pendiente de publicación" className={`${gradient} mt-4 bg-clip-text text-6xl font-bold text-transparent`}>—</p></div>)}
        </div><p className="mt-7 text-sm text-slate-600">Resultados pendientes de publicación. Los indicadores reflejarán acciones realizadas y validadas por OLI, no solicitudes recibidas ni metas.</p>
      </div>
    </section>

    {/* Sección: valorización de la campaña y ejecución de los recursos con cifras validadas. */}
    <section aria-labelledby="transparencia-title" className="bg-white px-5 pb-20 pt-7 text-[#073164] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl text-center"><h2 id="transparencia-title" className="text-3xl font-bold text-[#702780]">TRANSPARENCIA EN ACCIÓN</h2><p className="mt-2 text-lg">Conoce cómo se utilizan los recursos y el impacto de cada kit</p>
        <div className="mt-14 grid gap-16 md:grid-cols-2 md:gap-6">
          {[
            ["fi-rs-folder-add.png", "Valorización de la campaña", "Valor total de los kits entregados"],
            ["fi-rs-signal-alt-2.png", "Porcentaje de ejecución", "Avance de ejecución de la campaña"],
          ].map(([icon, title, detail]) => <article key={title} className="relative rounded-[1.25rem] bg-white px-6 pb-6 pt-12 shadow-[0_3px_9px_#0003]">
            <IconBadge file={icon} className="absolute -top-10 left-1/2 -translate-x-1/2" /><p aria-label="Pendiente de publicación" className={`${gradient} bg-clip-text text-6xl font-bold text-transparent`}>—</p><h3 className="mt-2 text-xl">{title}</h3><div className="mt-4 border-t border-[#e5cfec] pt-4"><p className="text-2xl font-bold text-[#702780]">Por publicar</p><p className="mt-3 text-lg">{detail}</p></div>
          </article>)}
        </div>
      </div>
    </section>

    {/* Sección: emergencias activas publicadas y opciones de donación y voluntariado. */}
    <section aria-labelledby="activas-title" className="bg-white px-5 py-8 text-[#073164] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl"><div className={`${gradient} flex flex-col items-center justify-between gap-6 overflow-hidden rounded-[1.25rem] px-8 py-7 text-white sm:flex-row sm:px-10`}>
        <div className="max-w-2xl"><h2 id="activas-title" className="text-2xl font-bold">EMERGENCIAS ACTIVAS</h2><p className="mt-5 text-lg leading-6">Hoy hay comunidades que necesitan de nuestra ayuda.<br />Conoce las emergencias que actualmente se encuentran activas en nuestra Red y descubre cómo puedes sumarte.</p></div><img src={`${A}/reporta-mapa.png`} alt="" className="h-36 w-64 shrink-0 object-contain sm:h-40" />
      </div>
      {loading && <p role="status" className="py-12 text-center">Cargando emergencias...</p>}
      {error && <p role="alert" className="my-10 rounded-2xl bg-red-50 p-6 text-red-800">{error}</p>}
      {!loading && !error && !emergencies.length && <p className="py-12 text-center">No hay emergencias activas publicadas en este momento.</p>}
      <div className="mx-auto mt-16 grid max-w-[70rem] gap-8 md:grid-cols-2 lg:gap-14">
        {emergencies.map((item) => <article key={item.id} className="rounded-[1.25rem] border border-[#e0cbe8] bg-white p-6 shadow-[0_3px_8px_#0003] sm:p-8">
          <div className="grid items-center gap-5 sm:grid-cols-[.9fr_1fr]"><EmergencyPhoto emergency={item} /><div><span className="rounded-full bg-[#f44080] px-3 py-0.5 font-bold text-white">ACTIVA</span>{item.es_demo && <span className="ml-2 text-xs font-bold text-slate-500">Demo</span>}<h3 className="mt-2 text-lg font-bold">{item.titulo}</h3><p>{[item.distrito, item.provincia].filter(Boolean).join(" · ") || "Ubicación por confirmar"}</p><p>{item.poblacion_afectada != null ? `${new Intl.NumberFormat("es-PE").format(item.poblacion_afectada)} personas afectadas` : "Población afectada por confirmar"}</p></div></div>
          <h4 className="mt-5 font-bold">Recursos necesarios:</h4><EmergencyResources emergency={item} />
          <div className="mt-5 grid gap-3 sm:grid-cols-2"><Link to="/solicitud?tipo=OFERTA_RECURSO" className={`${gradient} rounded-2xl px-3 py-3 text-center font-bold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-700`}>Quiero donar</Link><Link to="/solicitud?tipo=VOLUNTARIO" className="rounded-2xl border border-[#702780] px-3 py-3 text-center font-bold text-[#702780] transition hover:bg-purple-50">Quiero ser voluntario</Link></div>
        </article>)}
      </div>
      </div>
    </section>

    {/* Sección: invitación a conocer el impacto y fortalecer la transparencia de la red. */}
    <section className="bg-white px-5 pb-28 pt-16 text-[#073164] sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-7 rounded-[1.25rem] bg-[#e5bfef] p-8 text-center lg:flex-row lg:text-left"><img src={`${A}/reporta-ayuda.png`} alt="" className="h-24 w-32 object-contain" /><div className="flex-1"><h2 className="text-xl font-bold text-[#702780]">La transparencia también es una forma de ayudar.</h2><p className="mt-1 text-lg">Con información clara, construimos una red más fuerte.</p></div><a href="#impacto" className={`${gradient} inline-flex items-center justify-center gap-4 rounded-2xl px-6 py-4 font-bold text-white transition hover:brightness-110`}>Conoce más sobre nuestro impacto<svg aria-hidden="true" className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12h18m-6-6 6 6-6 6" /></svg></a></div>
    </section>
  </PublicLayout>;
}
