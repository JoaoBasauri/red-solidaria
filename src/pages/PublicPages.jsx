import { Link } from "react-router-dom";
import PublicLayout, {
  PageHero,
  PrimaryLink,
} from "../components/PublicLayout";

const A = "/assets/red-solidaria";
const HomeStep = ({ number, title, text, image, blue = false }) => (
  <article className="text-center">
    <div className="relative">
      <div className="aspect-[1.45/1] overflow-hidden rounded-[1.25rem]">
        <img
          src={image}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
      <span
        className={`absolute -bottom-10 left-1/2 grid h-20 w-20 -translate-x-1/2 place-items-center rounded-full text-3xl font-black ${blue ? "bg-[#aed5ff] text-[#082f61]" : "bg-[#ffb78f] text-[#e9530b]"}`}
      >
        {number}
      </span>
    </div>
    <p className="pt-14 text-2xl leading-7 text-[#072e5e]">
      <strong className="block font-black">{title}</strong>
      <span>{text}</span>
    </p>
  </article>
);
const FundUseCard = ({ icon, percent, title, text, tone = "dark" }) => {
  const circle =
    tone === "dark"
      ? "bg-[#e95000]"
      : tone === "mid"
        ? "bg-[#ff7830]"
        : "bg-[#ffb690]";
  return (
    <article className="grid min-h-28 items-center gap-5 rounded-[1.35rem] bg-white px-7 py-4 shadow-[0_6px_16px_rgba(0,0,0,.2)] sm:grid-cols-[4.8rem_6rem_1px_1fr]">
      <span
        className={`grid h-[4.8rem] w-[4.8rem] place-items-center rounded-full ${circle}`}
      >
        <img src={icon} alt="" className="h-9 w-9 object-contain" />
      </span>
      <strong className="text-4xl text-[#ed5600]">{percent}</strong>
      <span aria-hidden="true" className="hidden h-20 bg-[#ffb292] sm:block" />
      <p className="text-lg leading-6 text-[#073164]">
        <b className="block font-black">{title}</b>
        {text}
      </p>
    </article>
  );
};
export function Home() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="Red Solidaria"
        title={
          <>
            La solidaridad también puede{" "}
            <strong className="font-black">responder rápido.</strong>
          </>
        }
        description="Conectamos personas, empresas y organizaciones para responder ante una emergencia."
        image={`${A}/inicio-hero.webp`}
        focusActors
      >
        <PrimaryLink to="/solicitud?tipo=EMERGENCIA">
          Reporta una emergencia
        </PrimaryLink>
        <PrimaryLink to="/solicitud?tipo=ALIADO">
          Súmate como aliado
        </PrimaryLink>
      </PageHero>
      {/* Sección: proceso de respuesta en cuatro etapas, desde la identificación hasta el reporte. */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
        <h2 className="text-xl font-black uppercase tracking-wide text-[#ff6826] sm:text-2xl">
          La ayuda llega cuando más se necesita
        </h2>
        <div className="mt-9 grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          <HomeStep
            number="01"
            title="Identificamos"
            text="necesidades"
            image={`${A}/inicio-identificamos.webp`}
          />
          <HomeStep
            number="02"
            title="Articulamos"
            text="recursos"
            image={`${A}/inicio-articulamos.webp`}
            blue
          />
          <HomeStep
            number="03"
            title="Activamos"
            text="capacidades"
            image={`${A}/inicio-activamos.webp`}
          />
          <HomeStep
            number="04"
            title="Reportamos"
            text="resultados"
            image={`${A}/inicio-reportamos.webp`}
            blue
          />
        </div>
      </section>
      {/* Sección: contexto 2026-2027 y población expuesta al Fenómeno El Niño. */}
      <section className="relative overflow-visible bg-gradient-to-r from-[#052d5c] via-[#073b78] to-[#076ddd] text-white">
        <div className="relative mx-auto grid min-h-[29rem] max-w-7xl items-center px-5 py-10 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:px-10">
          <div className="relative z-10 max-w-2xl">
            <p className="text-lg font-black uppercase text-[#ff681f]">
              Contexto 2026-2027
            </p>
            <h2 className="mt-3 max-w-md text-3xl font-black leading-tight sm:text-4xl">
              Prepararnos también es parte de responder
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-7 text-white/90">
              CENEPRED y SIGRID proyectan que el Fenómeno El Niño (FEN) tendrá
              impacto en distintas zonas del país.
            </p>
            <div className="mt-5 grid max-w-xl gap-5 sm:grid-cols-2">
              <article className="flex min-h-48 items-center gap-4 rounded-2xl bg-[#174f8d] p-5">
                <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-[#acd4ff]">
                  <img
                    src={`${A}/personas-icono.png`}
                    alt=""
                    className="h-11 w-14 object-contain"
                  />
                </span>
                <div>
                  <strong className="block text-5xl leading-none text-[#ff681f]">
                    7.9
                  </strong>
                  <span className="mt-2 block text-2xl font-black uppercase leading-none text-[#ff681f]">
                    Millones
                  </span>
                  <p className="mt-2 text-lg leading-6">
                    de personas estarán expuestas
                  </p>
                </div>
              </article>
              <article className="flex min-h-48 items-center gap-4 rounded-2xl bg-[#174f8d] p-5">
                <span
                  aria-hidden="true"
                  className="h-20 w-20 shrink-0 rounded-full bg-[conic-gradient(#ff5a00_0_41%,#063d79_41%_100%)] p-4"
                >
                  <span className="block h-full w-full rounded-full bg-[#174f8d]" />
                </span>
                <div>
                  <strong className="block text-5xl leading-none text-[#ff681f]">
                    41%
                  </strong>
                  <p className="mt-3 text-lg leading-6">
                    del territorio con probabilidad de afectación
                  </p>
                </div>
              </article>
            </div>
          </div>
          <img
            src={`${A}/mapa-peru.png`}
            alt="Mapa del Perú con zonas de posible afectación"
            className="relative z-5 mx-auto -mb-20 -mt-10 -translate-y-8 w-full max-w-[32rem] object-contain lg:absolute lg:-bottom-12 lg:right-4 lg:top-0 lg:m-0 lg:h-[35rem] lg:w-auto"
          />
        </div>
      </section>
      {/* Sección: metas de movilización de recursos y personas beneficiadas para 2026-2027. */}
      <section className="relative overflow-hidden bg-white px-5 pt-14 sm:px-8 lg:min-h-[59rem] lg:px-10 lg:pt-16">
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-4xl font-black uppercase leading-tight text-[#ff7130] sm:text-5xl">
              Nuestra meta 2026-2027
            </h2>
            <p className="mt-4 text-2xl text-[#073164] sm:text-3xl">
              Prepararnos hoy para responder mañana
            </p>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-6 text-slate-950">
              Ante este escenario, queremos estar preparados para llegar
              <br className="hidden sm:block" /> a quienes más lo necesitan.
            </p>
          </div>
          <div className="mx-auto mt-14 grid max-w-5xl items-center gap-8 lg:grid-cols-[1fr_13rem_1fr]">
            <article className="flex min-h-48 items-center gap-7 rounded-[1.35rem] bg-white p-7 shadow-[0_8px_18px_rgba(0,0,0,.2)]">
              <span className="grid h-28 w-28 shrink-0 place-items-center rounded-full bg-[#ffb690]">
                <img
                  src={`${A}/meta-donacion.png`}
                  alt=""
                  className="h-16 w-16 object-contain"
                />
              </span>
              <div>
                <strong className="block text-5xl leading-none text-[#ed5600]">
                  S/4
                </strong>
                <span className="mt-2 block text-3xl font-black uppercase leading-none text-[#ed5600]">
                  Millones
                </span>
                <p className="mt-2 text-lg leading-6 text-[#073164]">
                  movilizados para articular ayuda.
                </p>
              </div>
            </article>
            <div className="text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#0b4c8d]">
                <img
                  src={`${A}/footer-arrow.png`}
                  alt=""
                  className="h-8 w-9 object-contain"
                />
              </span>
              <p className="mx-auto mt-4 max-w-[12rem] text-lg font-black leading-6 text-[#073164]">
                Recursos que transforman en impacto real
              </p>
            </div>
            <article className="flex min-h-48 items-center gap-7 rounded-[1.35rem] bg-white p-7 shadow-[0_8px_18px_rgba(0,0,0,.2)]">
              <span className="grid h-28 w-28 shrink-0 place-items-center rounded-full bg-[#ffb690]">
                <img
                  src={`${A}/meta-personas.png`}
                  alt=""
                  className="h-16 w-16 object-contain"
                />
              </span>
              <div>
                <strong className="block text-5xl leading-none text-[#ed5600]">
                  100,000
                </strong>
                <span className="mt-2 block text-3xl font-black uppercase leading-none text-[#ed5600]">
                  Personas
                </span>
                <p className="mt-2 text-lg leading-6 text-[#073164]">
                  beneficiadas en los puntos más críticos.
                </p>
              </div>
            </article>
          </div>
        </div>
        <div className="relative mx-auto mt-20 max-w-7xl lg:absolute lg:inset-x-0 lg:bottom-0">
          <img
            src={`${A}/personas-paisaje.png`}
            alt="Voluntarios de Red Solidaria preparados para responder"
            className="mx-auto w-full object-contain"
          />
          <img
            src={`${A}/plataforma-oli.png`}
            alt="La plataforma de emergencia de Fundación OLI"
            className="absolute bottom-[13%] left-[7%] w-[38%] max-w-md object-contain"
          />
        </div>
      </section>
      {/* Sección: llamado a unirse a la red y multiplicar el impacto de la solidaridad. */}
      <section className="bg-gradient-to-r from-[#052c59] via-[#073c78] to-[#076fdc] text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-7 px-5 py-8 sm:px-8 lg:grid-cols-[8rem_1.2fr_1px_1fr_auto] lg:px-10">
          <span className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-white">
            <img
              src={`${A}/cta-corazon.png`}
              alt=""
              className="h-12 w-12 object-contain"
            />
          </span>
          <h2 className="text-center text-3xl font-black leading-tight lg:text-left lg:text-4xl">
            Juntos, multiplicamos
            <br /> la solidaridad
          </h2>
          <span
            aria-hidden="true"
            className="hidden h-40 bg-white/40 lg:block"
          />
          <p className="text-center text-xl leading-8 lg:text-left">
            Con tu apoyo, convertimos
            <br className="hidden lg:block" /> cada recurso en esperanza
            <br className="hidden lg:block" /> y cada acción es un futuro
            <br className="hidden lg:block" /> más seguro para todos.
          </p>
          <Link
            to="/solicitud?tipo=VOLUNTARIO"
            className="mx-auto rounded-2xl bg-gradient-to-r from-[#f05700] to-[#ff7a32] px-8 py-4 text-lg font-black text-white shadow-sm transition hover:-translate-y-0.5"
          >
            Únete a la red
          </Link>
        </div>
      </section>
      {/* Sección: distribución porcentual y destino previsto de los fondos recaudados. */}
      <section className="bg-white px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-black text-[#e95300] sm:text-4xl">
            ¿Cómo utilizaremos los fondos?
          </h2>
          <p className="mt-2 max-w-xl text-lg leading-6 text-[#073164]">
            Cada aporte se transforma en recursos y acciones
            <br className="hidden sm:block" /> concretas para responder ante una
            emergencia.
          </p>
          <div className="mt-12 grid items-center gap-14 lg:grid-cols-[1fr_1.2fr]">
            <div className="relative mx-auto h-80 w-80 rounded-full bg-[conic-gradient(#ff7830_0_20%,#ffd1ba_20%_25%,#ed5600_25%_100%)] sm:h-[26rem] sm:w-[26rem]">
              <span className="absolute inset-[24%] rounded-full bg-white" />
              {/* Porcentajes centrados en el ángulo medio de cada segmento y en el grosor del anillo. */}
              <strong className="absolute left-[72.34%] top-[19.26%] -translate-x-1/2 -translate-y-1/2 text-2xl leading-none text-[#073164] sm:text-3xl">
                20%
              </strong>
              <strong className="absolute left-[87.53%] top-[44.06%] -translate-x-1/2 -translate-y-1/2 text-2xl leading-none text-[#073164] sm:text-3xl">
                5%
              </strong>
              <strong className="absolute left-[23.13%] top-[76.87%] -translate-x-1/2 -translate-y-1/2 text-2xl leading-none text-white sm:text-3xl">
                75%
              </strong>
            </div>
            <div className="grid gap-7">
              <FundUseCard
                icon={`${A}/fondos-kits.png`}
                percent="75%"
                title="Kits"
                text="Recursos destinados a la ayuda directa para las familias."
              />
              <FundUseCard
                icon={`${A}/fondos-transporte.png`}
                percent="20%"
                title="Logística y transporte"
                text="Movilización y entrega de los recursos."
                tone="mid"
              />
              <FundUseCard
                icon={`${A}/fondos-administracion.png`}
                percent="5%"
                title="Gastos administrativos"
                text="Gestión operativa necesaria para hacer posible la respuesta."
                tone="light"
              />
            </div>
          </div>
        </div>
      </section>
      {/* Sección: convocatoria final para sumar personas, empresas y organizaciones. */}
      <section className="relative isolate min-h-[28rem] overflow-hidden text-white">
        <img
          src={`${A}/inicio-cierre.webp`}
          alt="Equipo de Fundación OLI junto a una comunidad"
          className="absolute inset-0 -z-30 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 -z-20 bg-gradient-to-r from-[#f04d00] via-[#ef5700]/85 to-[#04366f]/70" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-orange-600/40 via-transparent to-blue-950/25" />
        <div className="mx-auto flex min-h-[28rem] max-w-7xl items-center px-5 py-12 sm:px-8 lg:px-10">
          <div className="max-w-xl">
            <p className="text-lg font-black uppercase">
              Fundación OLI ya está presente
            </p>
            <h2 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
              Ahora necesitamos sumar a más personas, empresas y organizaciones.
            </h2>
            <p className="mt-5 text-lg leading-7 text-white/95">
              Estamos construyendo la red, articulando aliados y preparando los
              recursos para responder cuando más se necesite.
            </p>
            <p className="mt-7 text-lg font-black">¿Nos ayudas a llegar?</p>
            <div className="mt-7 flex flex-wrap gap-8">
              <Link
                to="/solicitud?tipo=VOLUNTARIO"
                className="min-w-44 rounded-2xl bg-[#073164] px-7 py-4 text-center text-lg font-black transition hover:bg-[#041f40]"
              >
                Súmate a la red
              </Link>
              <Link
                to="/solicitud?tipo=DONACION"
                className="min-w-44 rounded-2xl bg-[#073164] px-7 py-4 text-center text-lg font-black transition hover:bg-[#041f40]"
              >
                Donar ahora
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

export { default as About } from "./About";

export { default as Respond } from "./Respond";

export { default as Articulate } from "./Articulate";

export { default as Connect } from "./Connect";

export { default as Emergencies } from "./Emergencies";

export { default as Report } from "./Report";

const faqs = [
  [
    "¿Qué es la Red Solidaria?",
    "Es la plataforma de emergencia de Fundación OLI que conecta necesidades, personas, organizaciones y recursos.",
  ],
  [
    "¿Quién puede reportar una emergencia?",
    "Cualquier persona u organización puede registrar una alerta. No necesita crear una cuenta.",
  ],
  [
    "¿Cómo sé si mi solicitud fue recibida?",
    "Al finalizar recibirás un código de seguimiento y comunicaciones al correo registrado.",
  ],
  [
    "¿Cómo puedo ayudar?",
    "Puedes ofrecer recursos, sumarte como aliado, ser voluntario o proponer un punto de acopio.",
  ],
  [
    "¿Todas las solicitudes son públicas?",
    "No. Solo se publica información validada y limitada, sin exponer los datos personales del solicitante.",
  ],
];
export function Faq() {
  return (
    <PublicLayout>
      {/* Sección: portada e introducción a las preguntas frecuentes. */}
      <section className="bg-[#f7eef7]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-[#ef5b16]">
              Preguntas frecuentes
            </p>
            <h1 className="mt-4 text-5xl font-black text-[#0a2f5f]">
              ¿Tienes alguna duda?
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              Encuentra respuestas sobre cómo funciona Red Solidaria y las
              diferentes formas de participar.
            </p>
          </div>
          <img
            src={`${A}/faq-principal.png`}
            alt="Personas conectadas mediante la Red Solidaria"
            className="mx-auto max-h-96"
          />
        </div>
      </section>
      {/* Sección: respuestas desplegables sobre el funcionamiento de Red Solidaria. */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-[#0a2f5f] text-2xl font-black text-white">
            i
          </span>
          <h2 className="text-2xl font-black">Sobre Red Solidaria</h2>
        </div>
        {faqs.map(([question, answer], index) => (
          <details
            key={question}
            open={index === 0}
            className="group border-b border-slate-200 py-6"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-black">
              {question}
              <span className="text-2xl text-[#ef5b16] group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-4 max-w-3xl leading-7 text-slate-600">{answer}</p>
          </details>
        ))}
      </section>
    </PublicLayout>
  );
}
