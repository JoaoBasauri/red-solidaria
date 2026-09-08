import { useRef } from "react";
import { Link } from "react-router-dom";
import PublicLayout from "../components/PublicLayout";

const A = "/assets/red-solidaria";
const kitProducts = [
  ["Balde de 20 litros con tapa", 1],
  ["Pala", 1],
  ["Latas de atún", 12],
  ["Paquetes de galletas de soda", 20],
  ["Tubo de pasta dental", 1],
  ["Cepillos de dientes", 4],
  ["Jabón líquido", 1],
  ["Rollos de papel higiénico (PH)", 4],
  ["Toallas higiénicas", 5],
  ["Pañales de bebé", 4],
  ["Pañales de adulto mayor", 2],
  ["Repelente", 4],
  ["Bloqueador solar", 4],
];
const gradient = "bg-gradient-to-r from-[#1d5088] to-[#4aa7d1]";
const steps = [
  [
    "identificar",
    "Identificamos",
    "Recibimos reportes de emergencias y necesidades desde el territorio.",
  ],
  [
    "validar",
    "Validamos",
    "Verificamos la situación y determinamos qué tipo de respuesta se necesita.",
  ],
  [
    "activar",
    "Activamos",
    "Conectamos la emergencia con los aliados y recursos disponibles.",
  ],
  [
    "entregar",
    "Entregamos",
    "Coordinamos la llegada de la ayuda a las personas y familias que la necesitan.",
  ],
  [
    "reportar",
    "Reportamos",
    "Damos seguimiento y transparentamos la respuesta realizada.",
  ],
];
const needs = [
  ["bebes", "Bebés"],
  ["ninos", "Niños y niñas"],
  ["mayores", "Adultos mayores"],
  ["menstrual", "Higiene menstrual"],
  ["higiene", "Higiene y necesidades básicas"],
];
const reportFields = [
  "Lugar de la emergencia.",
  "Tipo de emergencia.",
  "Fecha y hora en que ocurrió.",
  "Número de familias afectadas.",
  "Principales necesidades identificadas.",
  "Persona u organización de contacto en territorio.",
  "Fotografías, videos u otra información que ayude a validar la situación.",
];

function Process({ compact = false }) {
  return (
    <ol
      className={`grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-12 ${compact ? "mt-14" : "mt-16"}`}
    >
      {steps.map(([icon, title, description], index) => (
        <li key={icon} className="relative text-center">
          {!compact && (
            <div className="relative mx-auto flex h-30 w-30 items-center justify-center rounded-full bg-[#1d5088]">
              <img
                src={`${A}/responde-${icon}.png`}
                alt=""
                className="h-14 w-14 object-contain"
              />
              <span className="absolute -left-6 -top-1 flex h-14 w-14 items-center justify-center rounded-full bg-[#acd2ff] text-3xl font-bold">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
          )}
          <h3 className={`${compact ? "" : "mt-4"} text-xl font-semibold`}>
            {title}
          </h3>
          {!compact && (
            <p className="mx-auto mt-4 max-w-52 text-lg leading-6">
              {description}
            </p>
          )}
          {index < steps.length - 1 && (
            <img
              src={`${A}/responde-flecha.png`}
              alt=""
              className={`absolute -right-10 hidden h-7 w-9 object-contain lg:block ${compact ? "top-0" : "top-12"}`}
            />
          )}
        </li>
      ))}
    </ol>
  );
}

export default function Respond() {
  const kitDialog = useRef(null);
  return (
    <PublicLayout>
      {/* Sección: presentación de OLI Responde y su propósito frente a las emergencias. */}
      <section
        className={`${gradient} px-5 py-20 text-white sm:px-8 lg:px-10 lg:py-36`}
      >
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <h1 className="text-4xl leading-tight sm:text-5xl">
              Frente a una emergencia,
              <br className="hidden sm:block" />
              <strong className="mt-2 block font-bold">
                activamos la solidaridad.
              </strong>
            </h1>
            <p className="mt-5 max-w-[31rem] text-lg leading-6 sm:text-justify">
              Una emergencia puede cambiarlo todo en pocas horas. La Red
              Solidaria permite identificar necesidades en territorio, validar
              la información y movilizar recursos para responder de manera
              rápida y organizada frente a desastres naturales.
            </p>
          </div>
          <div
            role="img"
            aria-label="OLI responde"
            className="mx-auto text-center lg:mr-24"
          >
            <div
              aria-hidden="true"
              className="flex items-center justify-center gap-2"
            >
              <span className="text-[8rem] font-black leading-none tracking-[-.08em]">
                oli
              </span>
              <img
                src={`${A}/responde-simbolo.png`}
                alt=""
                className="mt-5 h-24 w-24 object-contain brightness-0 invert"
              />
            </div>
            <span
              aria-hidden="true"
              className="block text-5xl font-bold leading-tight"
            >
              responde
            </span>
          </div>
        </div>
      </section>

      {/* Sección: cinco etapas de identificación, validación, activación, entrega y reporte. */}
      <section className="bg-white px-5 py-16 text-[#073164] sm:px-8 lg:px-10 lg:pb-24">
        <div className="mx-auto max-w-7xl">
          <img
            src={`${A}/responde-simbolo.png`}
            alt=""
            className="mx-auto h-24 w-24 object-contain"
          />
          <h2 className="mt-5 text-center text-3xl font-bold uppercase text-[#1d5088] sm:text-5xl">
            ¿Cómo respondemos?
          </h2>
          <Process />
        </div>
      </section>

      {/* Sección: kits de emergencia familiar y fotografías de entrega de recursos. */}
      <section className="bg-gradient-to-r from-[#d1dce7] to-[#dceff7] px-5 py-12 text-[#073164] sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-4xl font-bold text-[#1d5088] sm:text-5xl">
              Kits de emergencia
            </h2>
            <p className="mt-6 text-lg leading-6">
              Un kit puede hacer la diferencia en las primeras horas.
              <br />
              En una emergencia, contar con lo esencial puede marcar una gran
              diferencia.
            </p>
            <div
              className={`${gradient} mt-7 rounded-[1.25rem] p-7 text-lg leading-6 text-white sm:p-9 sm:text-justify`}
            >
              <p>
                La Red Solidaria articula kits de emergencia familiar que pueden
                ser movilizados durante las primeras 72 horas posteriores a una
                emergencia, de acuerdo con la necesidad identificada y la
                capacidad de respuesta disponible.
              </p>
              <p>
                Cada kit busca cubrir necesidades básicas y brindar una primera
                respuesta mientras se activan otros mecanismos de atención.
              </p>
              <p>Un kit pensado para las personas que lo necesitan.</p>
            </div>
          </div>
          <div className="grid aspect-[1.3] grid-cols-[1.2fr_1fr] grid-rows-[.75fr_1.25fr] gap-4 sm:gap-x-8">
            <img
              src={`${A}/responde-agua.webp`}
              alt="Voluntaria llevando agua para las familias"
              className="row-span-2 h-full min-h-0 w-full rounded-[1.25rem] object-cover object-[52%_center]"
            />
            <img
              src={`${A}/responde-familia.webp`}
              alt="Entrega de un kit a una familia"
              loading="lazy"
              className="h-full min-h-0 w-full rounded-[1.25rem] object-cover"
            />
            <img
              src={`${A}/responde-entrega.webp`}
              alt="Entrega de cajas de ayuda en una comunidad"
              loading="lazy"
              className="h-full min-h-0 w-[75%] rounded-[1.25rem] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Sección: kit inclusivo, necesidades familiares y aporte referencial para apoyar con kits. */}
      <section className="bg-white px-5 py-14 text-[#073164] sm:px-8 lg:px-10 lg:pb-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="mx-auto max-w-4xl text-center text-2xl font-semibold leading-tight sm:text-[2rem]">
            Nuestra propuesta de kit es inclusiva y adaptable a las necesidades
            de cada familia.
          </h2>
          <p className="mt-3 text-center text-lg">
            Incorporamos elementos específicos para:
          </p>
          <div className="mt-8 grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="relative mx-auto w-full max-w-[36.5rem]">
              <img
                src={`${A}/responde-ilustracion.png`}
                alt="Kit de emergencia de Red Solidaria"
                loading="lazy"
                className="max-h-max w-full"
              />
              <button
                type="button"
                onClick={() => kitDialog.current?.showModal()}
                className="absolute right-[1%] top-[53%] flex h-[24%] w-[29%] flex-col items-center justify-center rounded-[1.5rem] text-sm font-bold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#073164] sm:text-xl"
              >
                <img
                  src={`${A}/responde-ver.png`}
                  alt=""
                  className="mb-1 h-5 w-6 object-contain brightness-0 invert"
                />
                Ver kit aquí
              </button>
            </div>
            <ul className="grid gap-6 sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-3 sm:gap-x-10 lg:pr-12">
              {needs.map(([icon, label], index) => (
                <li
                  key={icon}
                  className={`flex min-h-18 items-center gap-4 rounded-[1.25rem] bg-white px-6 py-5 text-lg text-black shadow-[0_3px_4px_#00000040] ${index === 3 ? "sm:translate-y-7" : index === 4 ? "sm:row-span-2 sm:self-center" : ""}`}
                >
                  <img
                    src={`${A}/responde-${icon}.png`}
                    alt=""
                    className="h-8 w-8 shrink-0 object-contain"
                  />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mx-auto mt-16 max-w-4xl text-center">
            <h3 className="text-2xl font-bold sm:text-3xl">
              Valor referencial de un kit: S/ 150
            </h3>
            <p className="mt-3 text-lg leading-8">
              Tu aporte ayuda a que podamos preparar, movilizar y entregar estos
              kits cuando una emergencia lo requiera.
            </p>
            <Link
              to="/solicitud?tipo=DONACION"
              className={`${gradient} mt-7 inline-flex rounded-2xl px-4 py-4 text-lg font-bold text-white transition hover:brightness-110`}
            >
              Quiero apoyar con kits
            </Link>
          </div>
        </div>
      </section>

      {/* Sección: invitación a reportar emergencias y explicación del proceso de validación. */}
      <section className="relative isolate overflow-hidden bg-[#1d5088] px-5 py-20 text-white sm:px-8 lg:px-10">
        <img
          src={`${A}/responde-pucusana.webp`}
          alt=""
          loading="lazy"
          className="absolute inset-y-0 right-0 -z-20 h-full w-full object-cover object-right lg:w-1/2"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#1d5088] via-[#2b7aa9]/95 to-[#4aa7d1]/40 lg:via-[#4aa7d1] lg:to-transparent" />
        <div className="mx-auto max-w-7xl">
          <div className="max-w-[40rem]">
            <p className="text-xl font-bold uppercase">
              Reporta una emergencia
            </p>
            <h2 className="mt-6 text-3xl font-semibold leading-tight sm:text-[2.6rem]">
              ¿Conoces una comunidad que necesita ayuda?
            </h2>
            <p className="mt-5 text-lg leading-6">
              Si estás en territorio y conoces una situación de emergencia
              causada por desastres naturales, puedes reportarla a nuestra Red
              Solidaria.
              <br />
              Cada reporte pasa por un proceso de validación para conocer la
              situación, identificar las necesidades prioritarias y determinar
              si podemos activar una respuesta.
            </p>
          </div>
        </div>
      </section>

      {/* Sección: información requerida y condiciones para activar una respuesta a la emergencia. */}
      <section className="bg-white px-5 pt-20 text-[#073164] sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
          <article className="overflow-hidden rounded-[1.25rem] bg-white shadow-[0_4px_8px_#00000030]">
            <h2
              className={`${gradient} rounded-[1.25rem] px-7 py-9 text-2xl font-semibold text-white sm:px-12 sm:text-[2rem]`}
            >
              ¿Qué necesitamos saber?
            </h2>
            <ul className="list-disc space-y-1 px-10 py-10 text-lg leading-6 sm:px-16">
              {reportFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          </article>
          <article className="overflow-hidden rounded-[1.25rem] bg-white shadow-[0_4px_8px_#00000030]">
            <h2
              className={`${gradient} rounded-[1.25rem] px-7 py-9 text-2xl font-semibold text-white sm:px-12 sm:text-[2rem]`}
            >
              ¿Cuándo podemos responder?
            </h2>
            <p className="px-7 py-12 text-lg leading-6 sm:px-12">
              La activación de la Red depende de la magnitud de la emergencia,
              la información disponible, las necesidades identificadas y los
              recursos que podamos movilizar junto a nuestros aliados.
            </p>
          </article>
        </div>
        <div className="mt-20 flex flex-wrap justify-center gap-6 sm:gap-12">
          <Link
            to="/solicitud?tipo=EMERGENCIA"
            className="flex min-h-14 w-52 items-center justify-center rounded-2xl bg-[#032650] px-7 py-3 text-center text-lg font-bold leading-5 text-white transition hover:bg-[#1d5088]"
          >
            Reporta una
            <br />
            emergencia
          </Link>
          <Link
            to="/emergencias"
            className="flex min-h-14 w-52 items-center justify-center rounded-2xl bg-[#032650] px-7 py-3 text-center text-lg font-bold leading-5 text-white transition hover:bg-[#1d5088]"
          >
            Emergencias
            <br />
            activas
          </Link>
        </div>
      </section>

      {/* Sección: resumen de las etapas posteriores a la recepción de un reporte. */}
      <section className="bg-white px-5 pb-24 pt-16 text-[#073164] sm:px-8 lg:px-10 lg:pb-40">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold text-[#1d5088] sm:text-5xl">
            Después de recibir tu reporte
          </h2>
          <Process compact />
        </div>
      </section>

      {/* Modal: productos y cantidades del kit de emergencia familiar. */}
      <dialog
        ref={kitDialog}
        aria-labelledby="kit-title"
        className="fixed inset-0 m-auto max-h-[100dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-3xl bg-white p-0 text-[#073164] shadow-2xl backdrop:bg-[#032650]/60 backdrop:backdrop-blur-sm"
      >
        <div
          className={`${gradient} flex items-start justify-between gap-4 px-5 py-6 text-white sm:px-8`}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
              OLI Responde
            </p>
            <h2 id="kit-title" className="mt-2 text-2xl font-bold">
              Kit de emergencia familiar
            </h2>
          </div>
          <form method="dialog">
            <button
              type="submit"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label="Cerrar detalles del kit"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="h-5 w-5"
              >
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </form>
        </div>
        <div className="p-4 sm:p-7">
          <div className="overflow-hidden rounded-2xl border border-[#d9e7f2]">
            <table className="w-full table-fixed border-collapse text-sm sm:text-base">
              <caption className="sr-only">
                Productos y cantidades incluidos en el kit de emergencia
                familiar
              </caption>
              <thead className="bg-[#1d5088] text-white">
                <tr>
                  <th
                    scope="col"
                    className="w-12 px-2 py-3 text-center font-semibold sm:w-14"
                  >
                    N°
                  </th>
                  <th scope="col" className="px-3 py-3 text-left font-semibold">
                    Producto
                  </th>
                  <th
                    scope="col"
                    className="w-20 px-2 py-3 text-center font-semibold sm:w-24"
                  >
                    Cantidad
                  </th>
                </tr>
              </thead>
              <tbody>
                {kitProducts.map(([product, quantity], index) => (
                  <tr
                    key={product}
                    className="border-t border-[#e2edf5] odd:bg-white even:bg-[#f0f7fc] hover:bg-[#e0eff9]"
                  >
                    <td className="px-2 py-3 text-center text-[#53718e]">
                      {index + 1}
                    </td>
                    <th
                      scope="row"
                      className="px-3 py-3 text-left font-normal leading-5"
                    >
                      {product}
                    </th>
                    <td className="px-2 py-3 text-center font-semibold tabular-nums">
                      {quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </dialog>
    </PublicLayout>
  );
}
