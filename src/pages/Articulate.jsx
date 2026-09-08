import { Link } from "react-router-dom";
import PublicLayout from "../components/PublicLayout";

const A = "/assets/red-solidaria";
const greenGradient = "bg-gradient-to-r from-[#3aaca6] to-[#54a574]";
const contributors = [
  [
    "Actores territoriales",
    "Identifican necesidades y ayudan a orientar la respuesta desde el territorio.",
  ],
  [
    "Organizaciones sociales",
    "Acompañan la atención y facilitan la llegada de recursos a las comunidades.",
  ],
  [
    "Empresas",
    "Movilizan recursos, capacidades, infraestructura y conocimiento.",
  ],
  [
    "Aliados logísticos",
    "Hacen posible que la ayuda llegue hasta donde se necesita.",
  ],
  [
    "Voluntarios",
    "Ponen su tiempo, habilidades y energía al servicio de la respuesta.",
  ],
  [
    "Personas",
    "Donan, comparten, movilizan y ayudan a que más personas conozcan una emergencia.",
  ],
];
const participation = [
  [
    "territorio",
    "Aliado en territorio",
    "Si trabajas directamente con comunidades y puedes apoyar en la identificación, coordinación o atención de emergencias.",
    "ALIADO",
  ],
  [
    "acopio",
    "Punto de acopio",
    "Si puedes poner un espacio a disposición para recibir donaciones.",
    "PUNTO_ACOPIO",
  ],
  [
    "logistico",
    "Aliado logístico",
    "Si puedes apoyar con transporte, almacenamiento o distribución.",
    "ALIADO",
  ],
  [
    "donante",
    "Aliado donante",
    "Si tu organización puede aportar recursos económicos, productos o servicios.",
    "ALIADO",
  ],
  [
    "tecnico",
    "Aliado técnico",
    "Si puedes poner conocimientos o servicios especializados al servicio de una emergencia.",
    "ALIADO",
  ],
  [
    "voluntario",
    "Voluntario",
    "Si quieres aportar tu tiempo y capacidades cuando la Red se active.",
    "VOLUNTARIO",
  ],
];
const resources = [
  "Alimentos",
  "Agua",
  "Kits de emergencia",
  "Equipamiento",
  "Espacios de almacenamiento",
  "Transporte",
  "Servicios profesionales",
  "Infraestructura",
  "Capacidad de difusión",
  "Voluntariado",
  "Recursos económicos",
];

export default function Articulate() {
  return (
    <PublicLayout>
      {/* Sección: presentación de OLI Articula y la importancia de sumar capacidades ante emergencias. */}
      <section
        className={`${greenGradient} px-5 py-20 text-white sm:px-8 lg:px-10 lg:py-24`}
      >
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:min-h-[22rem] lg:grid-cols-2 lg:gap-24">
          <div>
            <h1 className="text-4xl leading-tight sm:text-5xl">
              Cuando cada uno aporta lo que puede,{" "}
              <strong className="font-bold">
                juntos podemos hacer mucho más.
              </strong>
            </h1>
            <div className="mt-6 text-lg leading-6 sm:text-justify">
              <p>Una emergencia no se resuelve con una sola donación.</p>
              <p>
                Se necesita transporte, alimentos, agua, espacios de acopio,
                voluntariado, recursos económicos, capacidades técnicas y
                personas dispuestas a movilizarse.
              </p>
              <p>
                Por eso creamos una red donde cada actor puede aportar desde lo
                que tiene.
              </p>
            </div>
          </div>
          <img
            src={`${A}/articula-logo.png`}
            alt="OLI articula"
            className="mx-auto h-auto w-56 max-w-full lg:mr-24"
          />
        </div>
      </section>

      {/* Sección: seis tipos de actores y su contribución a la respuesta solidaria. */}
      <section className="bg-white px-5 pb-10 pt-20 text-[#073164] sm:px-8 lg:px-10 lg:pt-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold uppercase text-[#35aca7] sm:text-5xl">
            ¿Cómo puedes aportar?
          </h2>
          <ol className="mt-10 grid gap-y-8 rounded-[1.5rem] bg-white px-6 py-10 shadow-[0_4px_8px_#00000030] md:grid-cols-2 lg:grid-cols-3 lg:px-16 lg:py-16">
            {contributors.map(([title, description], index) => (
              <li
                key={title}
                className="flex items-start gap-5 px-2 md:px-6 lg:border-r lg:border-[#3aaca6] lg:px-8 lg:[&:nth-child(3n)]:border-r-0"
              >
                <span
                  className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-3xl font-bold text-white xl:h-20 xl:w-20 ${index % 2 === 0 ? "bg-[#3aaca6]" : "bg-[#54a574]"}`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-xl font-semibold leading-6">{title}</h3>
                  <p className="mt-1 text-lg leading-6">{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Sección: opciones para unirse a la red como aliado, punto de acopio o voluntario. */}
      <section className="bg-white px-5 py-14 text-[#073164] sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold uppercase text-[#35aca7]">
            Súmate a la red
          </h2>
          <div className="mx-auto mt-7 max-w-5xl text-center text-lg leading-7">
            <p className="font-bold">
              Tu organización también puede ser parte de la respuesta.
            </p>
            <p>
              Buscamos empresas, organizaciones, instituciones y personas que
              quieran poner sus recursos y capacidades al servicio de una
              respuesta solidaria, organizada y transparente.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {participation.map(([icon, title, description, type]) => (
              <Link
                key={icon}
                to={`/solicitud?tipo=${type}`}
                className={`${greenGradient} group grid min-h-60 grid-cols-[minmax(0,1fr)_30%] overflow-hidden rounded-[1.25rem] text-white transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#073164]`}
              >
                <div className="self-center px-6 py-8">
                  <h3 className="text-xl font-semibold">{title}</h3>
                  <p className="mt-3 text-lg leading-6">{description}</p>
                </div>
                <div className="flex items-center justify-center rounded-[1.25rem] bg-[#b7e8dc] px-2">
                  <img
                    src={`${A}/articula-${icon}.png`}
                    alt=""
                    loading="lazy"
                    className="max-h-44 w-full object-contain mix-blend-multiply transition-transform group-hover:scale-105"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sección: invitación a poner recursos y capacidades al servicio de una emergencia. */}
      <section className="bg-white px-5 pb-20 pt-6 text-[#073164] sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[1.5rem] bg-white shadow-[0_4px_8px_#00000030] lg:grid-cols-[1.4fr_1fr]">
          <div className="self-center px-7 py-10 sm:px-12">
            <p className="text-xl font-bold uppercase text-[#35aca7]">
              Ofrece recursos
            </p>
            <h2 className="mt-5 text-2xl font-bold text-[#35aca7]">
              ¿Qué puedes poner al servicio de una emergencia?
            </h2>
            <p className="mt-4 text-lg leading-6">
              No siempre ayudar significa donar dinero.
              <br />
              Muchas veces, lo que más se necesita es aquello que{" "}
              <strong>ya tienes.</strong>
            </p>
          </div>
          <img
            src={`${A}/articula-emergencia.png`}
            alt="Recursos y capacidades que se unen para responder a una emergencia"
            loading="lazy"
            className="h-auto w-full self-center object-contain"
          />
        </div>
      </section>

      {/* Sección: recursos que se pueden ofrecer y fotografía de ayuda en territorio. */}
      <section className="bg-gradient-to-r from-[#d8eeec] to-[#deede3] px-5 py-11 text-[#073164] sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="text-4xl font-bold text-[#1d5088] sm:text-5xl">
              Puedes ofrecer
            </h2>
            <ul className="mt-7 list-disc pl-5 text-lg leading-6">
              {resources.map((resource) => (
                <li key={resource}>{resource}.</li>
              ))}
            </ul>
          </div>
          <img
            src={`${A}/articula-hero.webp`}
            alt="Voluntarias entregando recursos a una comunidad"
            loading="lazy"
            className="aspect-[1.65] w-full rounded-[1.25rem] object-cover"
          />
        </div>
      </section>

      {/* Sección: información institucional y accesos al registro de aliados y oferta de recursos. */}
      <section className="bg-white px-5 pb-20 pt-12 text-center text-[#073164] sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-lg leading-6">
            Cuéntanos qué puedes ofrecer y te contactaremos cuando exista una
            necesidad compatible con tu aporte.
            <br />
            Somos una entidad perceptora de donaciones. Contamos con{" "}
            <strong>
              EEFF auditados de los tres últimos años y registro en APCI.
            </strong>
          </p>
          <div className="mt-14 flex flex-wrap justify-center gap-6 sm:gap-9">
            <Link
              to="/solicitud?tipo=ALIADO"
              className={`${greenGradient} min-w-50 rounded-2xl px-5 py-3 font-medium text-white transition hover:brightness-110`}
            >
              Regístrate como Aliado
            </Link>
            <Link
              to="/solicitud?tipo=OFERTA_RECURSO"
              className={`${greenGradient} min-w-50 rounded-2xl px-5 py-3 font-medium text-white transition hover:brightness-110`}
            >
              Ofrece Recursos
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
