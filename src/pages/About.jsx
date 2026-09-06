import { useState } from "react";
import PublicLayout from "../components/PublicLayout";

const A = "/assets/red-solidaria";
const gallery = [
  ["collage-tres.webp", "Equipo de OLI movilizando donaciones"],
  ["collage-cuatro.webp", "Entrega de ayuda a una familia"],
  ["collage-uno.webp", "Voluntarios organizando kits de ayuda"],
  ["collage-dos.webp", "Movilización de recursos por el voluntariado"],
];
const values = [
  ["nosotros-personas.png", "Solidaridad", "Personas que se unen por un propósito."],
  ["nosotros-escudo.png", "Sostenibilidad", "Acciones que generan un impacto real."],
  ["nosotros-enlaces.png", "Articulación", "Alianzas que multiplican resultados."],
];
const actors = [
  ["nosotros-personas.png", "Personas"],
  ["nosotros-organizaciones.png", "Organizaciones"],
  ["nosotros-empresas.png", "Empresas"],
  ["nosotros-recursos.png", "Recursos"],
  ["nosotros-impacto.png", "Más impacto"],
];

function Arrow({ className = "h-6 w-6" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 12h16m-6-6 6 6-6 6" />
    </svg>
  );
}

export default function About() {
  const [galleryIndex, setGalleryIndex] = useState(0);
  const moveGallery = (direction) => setGalleryIndex((index) => (index + direction * 2 + gallery.length) % gallery.length);

  return (
    <PublicLayout>
      {/* Sección: presentación de Fundación OLI y collage de sus acciones solidarias. */}
      <section className="bg-white px-5 pb-10 pt-6 text-[#073164] sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-12">
          <div>
            <h1 className="text-xl font-bold uppercase text-[#ff7830]">Sobre nosotros</h1>
            <img src={`${A}/fundacion-oli.png`} alt="Fundación OLI, organizando las iniciativas" className="mt-5 w-60 max-w-full" />
            <p className="mt-7 text-lg leading-6 sm:text-justify">
              Desde 2012, <strong className="font-semibold text-[#ef5700]">Fundación OLI</strong> articula personas, organizaciones, empresas y recursos para generar mejores oportunidades y construir un Perú más solidario.
            </p>
            <a href="https://olifoundation.org/" target="_blank" rel="noopener noreferrer" className="mt-9 inline-flex items-center justify-center gap-4 rounded-[1.25rem] bg-[#ef5700] px-6 py-3 text-center text-lg text-white transition-colors hover:bg-[#ce4900] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#073164]">
              Conoce más sobre Fundación OLI
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 shrink-0"><path d="M9 8V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-3m-3-4h15m-5-5 5 5-5 5" /></svg>
            </a>
          </div>
          <div className="grid aspect-[1.65] grid-cols-[1.2fr_1fr] grid-rows-[1.2fr_1fr] gap-4 sm:gap-x-9 sm:gap-y-8 lg:aspect-auto lg:h-[27.5rem]">
            <img src={`${A}/nosotros-uno.webp`} alt="Entrega de kits a una familia" className="h-full min-h-0 w-full rounded-[1.25rem] object-cover" />
            <img src={`${A}/nosotros-tres.webp`} alt="Niño recibiendo abrigo y ayuda" className="row-span-2 mt-8 h-[calc(100%-2rem)] w-full rounded-[1.25rem] object-cover sm:mt-12 sm:h-[calc(100%-3rem)]" />
            <img src={`${A}/nosotros-dos.webp`} alt="Entrega de mantas en una comunidad" className="h-full min-h-0 w-[83%] justify-self-end rounded-[1.25rem] object-cover" />
          </div>
        </div>
      </section>

      {/* Sección: valores de solidaridad, sostenibilidad y articulación de la fundación. */}
      <section aria-label="Nuestros valores" className="bg-white px-5 py-10 text-[#073164] sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-7 rounded-[1.5rem] bg-white px-7 py-10 shadow-[0_4px_9px_#00000030] md:grid-cols-3 md:gap-0 lg:px-16 lg:py-16">
          {values.map(([icon, title, description], index) => (
            <article key={title} className={`flex items-center gap-5 ${index ? "border-t border-[#ffc2a3] pt-7 md:border-l md:border-t-0 md:pt-0" : ""} md:flex-col md:items-start md:px-5 xl:flex-row xl:items-center xl:px-8`}>
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#ffc09e]">
                <img src={`${A}/${icon}`} alt="" className="h-10 w-12 object-contain" />
              </span>
              <div><h2 className="text-xl font-semibold uppercase">{title}</h2><p className="mt-1 text-lg leading-6">{description}</p></div>
            </article>
          ))}
        </div>
      </section>

      {/* Sección: compromiso de trabajo en red y galería navegable de entregas de ayuda. */}
      <section aria-label="Conectamos esfuerzos" className="bg-white px-5 py-10 sm:px-8 lg:px-10">
        <div className="relative mx-auto max-w-7xl lg:py-0">
          <div className="rounded-[1.25rem] bg-gradient-to-r from-[#032650] to-[#075abe] px-7 pb-20 pt-10 text-white lg:w-3/4 lg:px-12 lg:py-11">
            <div className="lg:max-w-[28rem]">
              <h2 className="text-3xl font-semibold leading-tight sm:text-[2.1rem]">Creemos que ninguna iniciativa transforma sola.</h2>
              <p className="mt-4 text-lg leading-6">Por eso conectamos esfuerzos, generamos alianzas y movilizamos recursos para responder a necesidades concretas y generar un impacto que pueda sostenerse en el tiempo.</p>
              <p className="mt-7 text-lg font-semibold"><span className="text-[#ff6a00]">Ayuda</span> hoy, comunidades más fuertes mañana.</p>
            </div>
          </div>
          <div role="region" aria-label="Galería de acciones de Fundación OLI" aria-roledescription="carrusel" className="relative mx-5 -mt-10 rounded-[1.25rem] bg-white p-6 shadow-[0_4px_9px_#00000030] sm:p-10 lg:absolute lg:right-5 lg:top-1/2 lg:mx-0 lg:mt-0 lg:w-[44%] lg:-translate-y-1/2">
            <div className="grid grid-cols-2 gap-4 sm:gap-10">
              {[0, 1].map((offset) => {
                const [file, alt] = gallery[(galleryIndex + offset) % gallery.length];
                return <img key={file} src={`${A}/${file}`} alt={alt} loading="lazy" className="aspect-[1.22] w-full rounded-xl object-cover" />;
              })}
            </div>
            <p className="sr-only" aria-live="polite">Fotografías {galleryIndex + 1} y {galleryIndex + 2} de {gallery.length}</p>
            <button type="button" aria-label="Ver fotografías anteriores" onClick={() => moveGallery(-1)} className="absolute -left-5 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#ffc09e] text-[#ef5700] transition hover:bg-[#ffa777] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#073164] sm:-left-7 sm:h-14 sm:w-14"><Arrow className="h-8 w-8 rotate-180" /></button>
            <button type="button" aria-label="Ver fotografías siguientes" onClick={() => moveGallery(1)} className="absolute -right-5 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#ffc09e] text-[#ef5700] transition hover:bg-[#ffa777] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#073164] sm:-right-7 sm:h-14 sm:w-14"><Arrow className="h-8 w-8" /></button>
          </div>
        </div>
      </section>

      {/* Sección: nacimiento de Red Solidaria y conexión de personas, organizaciones, empresas y recursos. */}
      <section className="bg-white px-5 py-10 text-[#073164] sm:px-8 lg:px-10 lg:py-12">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="text-xl font-bold uppercase text-[#ff7830]">Un paso más</p>
            <h2 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">Nace una<br />Red Solidaria</h2>
            <p className="mt-4 text-lg leading-6 sm:text-justify">Hoy damos un paso más con la Red Solidaria, una plataforma digital que nos permite organizar y activar esa capacidad colectiva frente a situaciones de emergencia.</p>
            <ol className="mt-8 flex flex-wrap justify-center gap-y-5 rounded-[1.25rem] bg-white px-3 py-7 shadow-[0_4px_9px_#00000030] sm:flex-nowrap">
              {actors.map(([icon, label], index) => (
                <li key={label} className="relative flex w-1/3 min-w-0 flex-col items-center gap-2 text-center sm:w-1/5">
                  <span className="flex h-[3.75rem] w-[3.75rem] items-center justify-center rounded-full border-[3px] border-[#245d91]"><img src={`${A}/${icon}`} alt="" className="h-8 w-9 object-contain" /></span>
                  <span className="text-sm sm:text-[15px]">{label}</span>
                  {index < actors.length - 1 && <Arrow className="absolute -right-2 top-5 hidden h-5 w-5 text-[#6b98c8] sm:block" />}
                </li>
              ))}
            </ol>
          </div>
          <img src={`${A}/nosotros-hero.webp`} alt="Entrega de medicamentos al personal de un establecimiento de salud" loading="lazy" className="aspect-[1.56] w-full rounded-[1.25rem] object-cover" />
        </div>
      </section>

      {/* Sección: mensaje final e ilustración de una comunidad unida, conectada con el footer. */}
      <section className="bg-white pt-12 text-center text-[#073164] sm:pt-20">
        <h2 className="mx-auto max-w-5xl px-5 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">Porque cuando trabajamos en red,<br className="hidden sm:block" /><span className="block mt-2 text-[#ef5700]">podemos llegar más lejos.</span></h2>
        <img src={`${A}/unidad.png`} alt="Personas unidas para construir comunidades más fuertes" loading="lazy" className="mt-12 block h-auto w-full sm:mt-20" />
      </section>
    </PublicLayout>
  );
}
