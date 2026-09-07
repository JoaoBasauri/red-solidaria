import { Link } from 'react-router-dom'
import PublicLayout from '../components/PublicLayout'

const assets = '/assets/red-solidaria'
const categories = [
  {
    id: 'sobre-la-red', title: 'Sobre Red Solidaria', icon: 'info',
    questions: [
      ['¿Qué es la Red Solidaria?', <>Es una plataforma de <strong>Fundación OLI</strong> que conecta emergencias con personas, empresas, organizaciones y aliados capaces de movilizar recursos y capacidades para responder.</>],
      ['¿Quién puede reportar una emergencia?', <>Cualquier persona u organización puede <Link to="/solicitud?tipo=EMERGENCIA">reportar una emergencia</Link>. No necesitas crear una cuenta para registrar la información.</>],
      ['¿OLI atiende todas las emergencias reportadas?', 'Cada reporte pasa por un proceso de evaluación y validación. La respuesta depende de las necesidades identificadas y de los recursos y aliados disponibles; reportar una emergencia no garantiza su atención.'],
    ],
  },
  {
    id: 'donaciones-y-ayuda', title: 'Donaciones y ayuda', icon: 'donation',
    questions: [
      ['¿Qué puedo donar?', <>Puedes ofrecer recursos para apoyar la respuesta a una emergencia. Registra tu aporte en el <Link to="/solicitud?tipo=DONACION">formulario de donación</Link> para que el equipo evalúe cómo coordinarlo según las necesidades.</>],
      ['¿Puedo ayudar si no tengo dinero?', <>Sí. Puedes aportar tu tiempo como <Link to="/solicitud?tipo=VOLUNTARIO">voluntario</Link>, ofrecer capacidades o ayudar a conectar personas y organizaciones con la red.</>],
      ['¿Cómo sé que mi donación llegó?', <>Puedes consultar la información publicada en <Link to="/reporta">OLI Reporta</Link> sobre las acciones y resultados de la red. Para conocer el estado de un aporte específico, consulta al equipo que coordinó tu donación.</>],
    ],
  },
  {
    id: 'participa', title: 'Participa en la red', icon: 'person',
    questions: [
      ['¿Cómo puedo ser voluntario?', <>Completa el <Link to="/solicitud?tipo=VOLUNTARIO">formulario de voluntariado</Link> con tus datos y las capacidades que puedes aportar para que el equipo evalúe tu participación.</>],
      ['¿Mi empresa puede participar?', <>Sí. Tu empresa puede ofrecer recursos, servicios o capacidades. Completa el <Link to="/solicitud?tipo=ALIADO">formulario de aliados</Link> e indica cómo le gustaría colaborar.</>],
      ['¿Cómo puede mi organización ser parte de la Red?', <>Registra a tu organización como <Link to="/solicitud?tipo=ALIADO">aliada de la red</Link> y cuéntanos dónde trabaja y qué apoyo puede ofrecer.</>],
    ],
  },
  {
    id: 'emergencias', title: 'Emergencias', icon: 'alert',
    questions: [
      ['¿Cómo puedo saber qué pasó con una emergencia?', <>Consulta la sección de <Link to="/emergencias">emergencias</Link> y la información de <Link to="/reporta">OLI Reporta</Link>. Solo se publica información validada, sin exponer los datos personales de quienes reportan.</>],
    ],
  },
]

function CategoryIcon({ type }) {
  const tone = type === 'donation' || type === 'alert'
    ? 'bg-[#ed5500]'
    : type === 'person' ? 'bg-[#052b5b]' : 'bg-[#1d568e]'
  return (
    <span className={`grid size-[73px] shrink-0 place-items-center rounded-full text-white max-[900px]:size-14 ${tone}`}>
      <svg className="size-11 max-[900px]:size-[34px]" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {type === 'info' && <><path d="M35 35H20A15 15 0 1 1 35 20Z" /><path d="M18 19h3v10" /><circle cx="20" cy="12" r="1" fill="currentColor" /></>}
        {type === 'alert' && <><circle cx="20" cy="20" r="15" /><path d="M20 10v13" /><circle cx="20" cy="29" r="1" fill="currentColor" /></>}
        {type === 'person' && <><circle cx="20" cy="12" r="7" /><path d="M9 35c0-15 22-15 22 0" /></>}
        {type === 'donation' && <><path d="M20 14s-8-4-6-8c2-4 6-1 6 1 0-2 4-5 6-1 2 4-6 8-6 8Z" /><path d="M6 33V23c0-2 2-3 4-3h10c5 0 5 6 0 6h-6m10-3 7-7c4-3 7 1 4 4L24 32c-2 2-4 3-7 3H9c-2 0-3-1-3-2Z" /></>}
      </svg>
    </span>
  )
}

export default function Faq() {
  return (
    <PublicLayout>
      <main className="mx-auto max-w-[1680px] px-10 pb-[100px] text-[#052b5b] max-[900px]:px-6 max-[900px]:pb-16 max-[600px]:px-5">
        <section className="grid grid-cols-2 items-center gap-16 pt-8 pb-[90px] max-[900px]:gap-7 max-[900px]:pt-10 max-[900px]:pb-14 max-[600px]:grid-cols-1" aria-labelledby="faq-title">
          <div>
            <p className="text-[clamp(20px,1.65vw,30px)] font-bold text-[#ff7933] uppercase">Preguntas frecuentes</p>
            <h1 id="faq-title" className="mt-7 mb-10 text-[clamp(36px,3.5vw,64px)] leading-[1.16] font-bold tracking-[-.025em] max-[900px]:mt-5 max-[900px]:mb-6">¿Tienes alguna duda?</h1>
            <p className="max-w-[610px] text-[clamp(18px,1.3vw,24px)] leading-[1.35]">Encuentra aquí las respuestas sobre cómo funciona <strong>Red Solidaria</strong> y las diferentes formas de participar.</p>
          </div>
          <img src={`${assets}/faq-principal.png`} alt="" className="max-h-[410px] w-full object-contain max-[600px]:max-h-60" />
        </section>

        <div className="grid gap-[50px] max-[600px]:gap-9">
          {categories.map(({ id, title, icon, questions }) => (
            <section key={id} aria-labelledby={id}>
              <div className="mb-2.5 flex items-center gap-[34px] max-[900px]:mb-[18px] max-[900px]:gap-5 max-[600px]:gap-3.5">
                <CategoryIcon type={icon} />
                <h2 id={id} className="scroll-mt-[130px] text-[clamp(23px,1.9vw,34px)] leading-[1.2] font-bold uppercase">{title}</h2>
              </div>
              <div className="mr-[8.5%] ml-[107px] grid gap-[33px] max-[900px]:mr-0 max-[900px]:ml-[76px] max-[900px]:gap-5 max-[600px]:ml-0">
                {questions.map(([question, answer]) => (
                  <details key={question} className="group overflow-hidden rounded-[13px] border border-[#91bdff] open:bg-[#ecf4ff]">
                    <summary className="flex min-h-[74px] cursor-pointer list-none items-center justify-between gap-6 px-[30px] py-5 text-[clamp(20px,1.5vw,27px)] leading-[1.3] font-bold hover:bg-[#ecf4ff] focus-visible:rounded-xl focus-visible:outline-[3px] focus-visible:outline-offset-[-4px] focus-visible:outline-[#1d568e] max-[600px]:gap-4 max-[600px]:p-[18px] [&::-webkit-details-marker]:hidden">{question}<span className="size-0 shrink-0 border-x-[15px] border-t-[15px] border-x-transparent border-t-[#052b5b] group-open:rotate-180 max-[600px]:border-x-[9px] max-[600px]:border-t-[9px]" aria-hidden="true" /></summary>
                    <p className="-mt-[7px] px-[30px] pb-6 text-[clamp(18px,1.3vw,24px)] leading-[1.35] max-[600px]:mt-0 max-[600px]:px-[18px] max-[600px]:pb-5 [&_a]:underline [&_a]:underline-offset-[3px] [&_a:focus-visible]:outline-[3px] [&_a:focus-visible]:outline-offset-[5px] [&_a:focus-visible]:outline-[#ff7933]">{answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-[100px] grid grid-cols-[1.15fr_1fr] items-center gap-[50px] rounded-[26px] bg-[#052b5b] px-[50px] py-[42px] text-white max-[900px]:mt-16 max-[900px]:gap-6 max-[900px]:p-8 max-[600px]:grid-cols-1 max-[600px]:rounded-[22px] max-[600px]:px-[22px] max-[600px]:py-7" aria-labelledby="faq-join-title">
          <div>
            <h2 id="faq-join-title" className="text-[clamp(24px,1.8vw,32px)] leading-[1.3] font-bold">¿Aún tienes dudas sobre cómo participar?</h2>
            <p className="mt-5 max-w-[690px] text-[clamp(18px,1.3vw,24px)] leading-[1.35]">Forma parte de una red que conecta personas, organizaciones y recursos para responder cuando más se necesita.</p>
            <Link className="mt-[38px] inline-block rounded-[18px] bg-[linear-gradient(110deg,#ec5500,#ff792c)] px-[38px] py-[18px] text-center text-[clamp(18px,1.3vw,24px)] font-bold text-white hover:bg-[#d94f0b] hover:bg-none focus-visible:outline-[3px] focus-visible:outline-offset-[5px] focus-visible:outline-[#ff7933] max-[600px]:mt-[26px] max-[600px]:w-full max-[600px]:p-4" to="/solicitud?tipo=VOLUNTARIO">Quiero ser parte de la red</Link>
          </div>
          <img src={`${assets}/faq-union.png`} alt="" loading="lazy" className="max-h-[270px] w-full object-contain max-[600px]:mt-2" />
        </section>
      </main>
    </PublicLayout>
  )
}
