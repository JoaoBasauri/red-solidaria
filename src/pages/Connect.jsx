import { Link } from "react-router-dom";
import PublicLayout from "../components/PublicLayout";
import ConectaNetwork from "../components/ConectaNetwork";

const A = "/assets/red-solidaria";
const orangeGradient = "bg-gradient-to-r from-[#efb452] to-[#ff720b]";
// Completar con la dirección pública cuando esté disponible el directorio de aliados.
const alliesDirectoryUrl = null;
const exploreCards = [
  {
    image: "conecta-emergencias.webp",
    title: "Emergencias activas",
    description:
      "Conoce las situaciones que están siendo atendidas y las necesidades que aún requieren apoyo.",
    to: "/emergencias",
    action: "Ver emergencias activas",
  },
  {
    image: "conecta-aliados.webp",
    title: "Directorio de aliados",
    description:
      "Encuentra organizaciones y actores que forman parte de nuestra red.",
    to: alliesDirectoryUrl,
    action: "Directorio de aliados",
  },
  {
    image: "conecta-voluntario.webp",
    title: "Sé Voluntario",
    description:
      "Pon tu tiempo y tus capacidades al servicio de una emergencia.",
    to: "/solicitud?tipo=VOLUNTARIO",
    action: "Quiero ser voluntario",
  },
];

function ExploreCard({ card }) {
  const content = (
    <>
      <img
        src={`${A}/${card.image}`}
        alt=""
        loading="lazy"
        className="aspect-[1.34] w-full rounded-t-[1.25rem] object-cover transition duration-300 group-hover:grayscale group-focus-visible:grayscale"
      />
      <div className="flex flex-1 flex-col px-6 pb-6 pt-7 transition-colors group-hover:bg-gradient-to-b group-hover:from-[#ff720b] group-hover:to-[#efb452] group-hover:text-white group-focus-visible:bg-gradient-to-b group-focus-visible:from-[#ff720b] group-focus-visible:to-[#efb452] group-focus-visible:text-white">
        <h3 className="text-center text-xl font-semibold">{card.title}</h3>
        <p className="mt-8 text-lg leading-6 sm:text-justify">
          {card.description}
        </p>
        <div className="mt-auto pt-10">
          {card.to ? (
            <span className="flex items-center justify-between gap-3 text-base italic uppercase text-[#ef5700] group-hover:text-white group-focus-visible:text-white lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100">
              {card.action}
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5 shrink-0"
              >
                <path d="M6 18 18 6M6 6h12v12" />
              </svg>
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-[#b84500]">
              Próximamente
            </span>
          )}
        </div>
      </div>
    </>
  );
  const classes =
    "group flex h-full flex-col overflow-hidden rounded-[1.25rem] bg-white text-[#073164] shadow-[0_3px_8px_#00000030] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ef5700]";
  return card.to ? (
    <Link to={card.to} className={classes}>
      {content}
    </Link>
  ) : (
    <article className={classes}>{content}</article>
  );
}

export default function Connect() {
  return (
    <PublicLayout>
      {/* Sección: portada de OLI Conecta y accesos para voluntarios y nuevos puntos de acopio. */}
      <section
        className={`${orangeGradient} px-5 py-20 text-white sm:px-8 lg:px-10 lg:py-24`}
      >
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
          <div>
            <h1 className="text-4xl leading-tight sm:text-5xl">
              Conectamos necesidades con personas{" "}
              <strong className="font-bold">que pueden ayudar.</strong>
            </h1>
            <div className="mt-8 text-lg leading-6">
              <p>
                La <strong>Red Solidaria</strong> existe para hacer más fácil
                una conexión que muchas veces ocurre de manera desordenada:
              </p>
              <p>Alguien necesita.</p>
              <p>Alguien puede ayudar.</p>
              <p>OLI conecta a ambos.</p>
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/solicitud?tipo=VOLUNTARIO"
                className="inline-flex min-h-14 min-w-48 items-center justify-center rounded-2xl bg-white px-6 py-4 text-center text-lg font-bold text-[#ef5700] transition hover:bg-orange-50"
              >
                Ser voluntario
              </Link>
              <Link
                to="/solicitud?tipo=PUNTO_ACOPIO"
                className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white px-4 py-4 text-center text-lg font-bold transition hover:bg-white/15"
              >
                Proponer punto de acopio
              </Link>
            </div>
          </div>
          <img
            src={`${A}/conecta-logo.png`}
            alt="OLI conecta"
            className="mx-auto h-auto w-72 max-w-full"
          />
        </div>
      </section>

      {/* Sección: presentación de la plataforma y sus oportunidades para conectar ayuda. */}
      <section className="bg-white px-5 pb-12 pt-20 text-[#073164] sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl items-center overflow-hidden rounded-[1.5rem] bg-white shadow-[0_4px_8px_#00000030] lg:grid-cols-[1.7fr_1fr]">
          <div className="px-7 py-10 sm:px-9">
            <h2 className="text-xl font-bold uppercase text-[#ef5700]">
              OLI Conecta
            </h2>
            <p className="mt-5 max-w-[40rem] text-lg leading-6">
              A través de nuestra plataforma podrás conocer las emergencias
              activas, identificar oportunidades para sumarte y acceder a una
              red de aliados que trabajan por una respuesta más rápida y
              organizada.
            </p>
          </div>
          <img
            src={`${A}/conecta-plataforma.png`}
            alt="Conexión de personas y recursos a través de la plataforma"
            className="h-auto w-full object-contain"
          />
        </div>
      </section>

      {/* Mapa interactivo: puntos de acopio publicados y emergencias aprobadas con ubicaciones aproximadas. */}
      <ConectaNetwork mapOnly />

      {/* Sección: exploración de emergencias, directorio de aliados y participación voluntaria. */}
      <section className="bg-white px-5 pb-20 pt-12 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold uppercase text-[#ef5700]">
            Explora red
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {exploreCards.map((card) => (
              <ExploreCard key={card.title} card={card} />
            ))}
          </div>
        </div>
      </section>

      {/* Sección: accesos públicos a puntos de acopio y emergencias de la red. */}
      <section
        aria-label="Consultar puntos de acopio y emergencias"
        className="bg-white px-5 pb-28 sm:px-8 lg:px-10 lg:pb-48"
      >
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2">
          {[
            ["/puntos-acopio", "Puntos de Acopio", "conecta-punto.png"],
            ["/emergencias", "Emergencias", "conecta-sirena.png"],
          ].map(([to, title, icon]) => (
            <Link
              key={to}
              to={to}
              className={`${orangeGradient} flex items-center gap-6 rounded-[1.25rem] px-6 py-5 text-white transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ef5700]`}
            >
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#ffc29d] sm:h-20 sm:w-20">
                <img
                  src={`${A}/${icon}`}
                  alt=""
                  className="h-10 w-10 object-contain sm:h-12 sm:w-12"
                />
              </span>
              <span className="flex-1 text-center text-2xl font-bold sm:text-3xl">
                {title}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
