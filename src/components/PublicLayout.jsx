import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const pillars = [
  ["/responde", "OLI Responde"],
  ["/articula", "OLI Articula"],
  ["/conecta", "OLI Conecta"],
  ["/reporta", "OLI Reporta"],
];

const foundationLinks = [
  ["https://www.facebook.com/FundacionOLI", "Facebook", "facebook"],
  ["https://www.instagram.com/fundacionoli/", "Instagram", "instagram"],
  [
    "https://www.linkedin.com/company/fundaci%C3%B3n-oli/",
    "LinkedIn",
    "linkedin",
  ],
];

function SocialIcon({ name }) {
  if (name === "facebook")
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-5 w-5 fill-current"
      >
        <path d="M13.5 22v-8h2.75l.42-3.21H13.5V8.73c0-.93.26-1.56 1.59-1.56h1.7V4.3a22.7 22.7 0 0 0-2.48-.13c-2.45 0-4.13 1.5-4.13 4.25v2.37H7.4V14h2.78v8h3.32Z" />
      </svg>
    );
  if (name === "instagram")
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-5 w-5 fill-none stroke-current stroke-2"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" className="fill-current stroke-none" />
      </svg>
    );
  if (name === "linkedin")
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-5 w-5 fill-current"
      >
        <path d="M6.5 8.25H3.25V21H6.5V8.25ZM4.88 3A1.88 1.88 0 1 0 4.9 6.76 1.88 1.88 0 0 0 4.88 3ZM21 13.69c0-3.84-2.05-5.63-4.79-5.63a4.13 4.13 0 0 0-3.73 2.05V8.25H9.23V21h3.25v-6.31c0-1.66.32-3.28 2.39-3.28 2.04 0 2.06 1.91 2.06 3.39V21H21v-7.31Z" />
      </svg>
    );
  return null;
}

function FooterLink({ to, href, children }) {
  const className =
    "group inline-flex w-fit items-center gap-3 text-[15px] text-white/80 transition hover:text-white";
  const content = (
    <>
      <img
        src="/assets/red-solidaria/footer-arrow.png"
        alt=""
        className="h-4 w-5 object-contain transition group-hover:translate-x-1"
      />
      <span>{children}</span>
    </>
  );
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {content}
    </a>
  ) : (
    <Link to={to} className={className}>
      {content}
    </Link>
  );
}

export function Brand({ inverse = false, large = false, stacked = false }) {
  if (large)
    return (
      <span
        className={`inline-flex flex-col font-black tracking-tight ${inverse ? "text-white" : "text-[#073164]"}`}
      >
        <span className="text-3xl leading-none">Red</span>
        <span className="-mt-1 inline-flex items-baseline text-5xl leading-none sm:text-6xl">
          Solidaria
          <span
            className={`ml-1 inline-block h-7 w-3 rounded-r-full border-r-[4px] border-t-[4px] ${inverse ? "border-white" : "border-[#073164]"}`}
          />
        </span>
      </span>
    );
  if (stacked)
    return (
      <span className="inline-flex flex-col font-black tracking-tight text-[#073164]">
        <span className="text-xl leading-none">
          Red
          <span className="ml-1 inline-block h-3 w-1.5 rounded-r-full border-r-[3px] border-t-[3px] border-[#073164]" />
        </span>
        <span className="-mt-0.5 inline-flex items-baseline text-3xl leading-none">
          S<span className="text-[#ef5b16]">oli</span>daria
          <span className="ml-1 inline-block h-4 w-2 rounded-r-full border-r-[3px] border-t-[3px] border-[#ef5b16]" />
        </span>
      </span>
    );
  return (
    <span
      className={`inline-flex items-baseline text-2xl font-black leading-none tracking-tight ${inverse ? "text-white" : "text-[#073164]"}`}
    >
      Red&nbsp;
      <span className={inverse ? "text-white" : "text-[#ef5b16]"}>
        Solidaria
      </span>
      <span
        className={`ml-1 inline-block h-4 w-2 rounded-r-full border-r-[3px] border-t-[3px] ${inverse ? "border-white" : "border-[#073164]"}`}
      />
    </span>
  );
}

function PillarsMenu() {
  const [open, setOpen] = useState(false);
  const [conectaOpen, setConectaOpen] = useState(false);
  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          setConectaOpen(false);
        }}
        aria-expanded={open}
        className="flex items-center gap-2 px-2 py-3 text-base font-medium text-slate-950 transition hover:text-[#8f227f]"
      >
        <span
          aria-hidden="true"
          className={`inline-flex h-5 w-5 items-center justify-center text-[#ef5b16] transition ${open ? "rotate-180" : ""}`}
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className="h-5 w-5"
            focusable="false"
          >
            <path
              d="m5 7.5 5 5 5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>{" "}
        Pilares
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 w-40 rounded-xl bg-white py-2 shadow-xl">
          {pillars.map(([to, label]) =>
            label === "OLI Conecta" ? (
              <div
                key={to}
                className="relative"
                onMouseEnter={() => setConectaOpen(true)}
              >
                <NavLink
                  to={to}
                  onFocus={() => setConectaOpen(true)}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `mx-2 block rounded-lg px-3 py-3 text-[15px] font-medium transition-colors hover:bg-[#f7eff6] hover:text-[#8f227f] ${isActive ? "bg-[#f7eff6] text-[#8f227f]" : "text-slate-950"}`
                  }
                >
                  {label}
                </NavLink>
                {conectaOpen && (
                  <div className="absolute left-full top-0 ml-1 w-44 rounded-xl bg-[#f7eff6] p-2 shadow-lg">
                    <NavLink
                      to="/puntos-acopio"
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `block rounded-lg px-4 py-3 text-[15px] font-medium transition-colors hover:bg-white hover:text-[#8f227f] ${isActive ? "bg-white text-[#8f227f]" : "text-slate-950"}`
                      }
                    >
                      Puntos de acopio
                    </NavLink>
                    <NavLink
                      to="/emergencias"
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `block rounded-lg px-4 py-3 text-[15px] font-medium transition-colors hover:bg-white hover:text-[#8f227f] ${isActive ? "bg-white text-[#8f227f]" : "text-slate-950"}`
                      }
                    >
                      Emergencias
                    </NavLink>
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={to}
                to={to}
                onMouseEnter={() => setConectaOpen(false)}
                onFocus={() => setConectaOpen(false)}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-5 py-3 text-[15px] font-medium transition hover:bg-slate-50 hover:text-[#8f227f] ${isActive ? "text-[#8f227f]" : "text-slate-950"}`
                }
              >
                {label}
              </NavLink>
            ),
          )}
        </div>
      )}
    </div>
  );
}

export default function PublicLayout({ children }) {
  const [open, setOpen] = useState(false);
  const { user, profile, loading } = useAuth();
  const canAccessPanel =
    !loading &&
    Boolean(
      user &&
      profile?.activo &&
      ["ADMIN", "GESTOR", "LECTURA"].includes(profile.rol),
    );
  const mobileClass = ({ isActive }) =>
    `rounded-xl px-4 py-3 text-sm font-semibold ${isActive ? "bg-orange-50 text-[#d94f0b]" : "text-slate-700 hover:bg-slate-50"}`;
  const desktopClass =
    "px-2 py-3 text-base font-medium text-slate-950 transition hover:text-[#8f227f]";
  return (
    <div className="min-h-screen bg-white text-[#0a2f5f]">
      <div className="bg-gradient-to-r from-[#082d59] via-[#493441] to-[#ef5b00] px-4 py-2 text-center">
        <img
          src="/assets/red-solidaria/plataforma-oli-blanco.png"
          alt="La plataforma de emergencia de Fundación OLI"
          className="mx-auto h-8 max-w-[90vw] object-contain"
        />
      </div>
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-5 py-4 sm:px-8 lg:px-10">
          <Link
            to="/"
            aria-label="Red Solidaria, inicio"
            className="rounded-lg focus-visible:outline-2 focus-visible:outline-[#ef5b16]"
          >
            <Brand stacked />
          </Link>
          <nav
            aria-label="Navegación principal"
            className="ml-auto hidden items-center gap-9 lg:flex"
          >
            <NavLink to="/" end className={desktopClass}>
              Inicio
            </NavLink>
            <NavLink to="/nosotros" className={desktopClass}>
              Nosotros
            </NavLink>
            <PillarsMenu />
            <NavLink to="/faq" className={desktopClass}>
              FAQ
            </NavLink>
          </nav>
          <div className="ml-3 flex items-center gap-2 lg:ml-8">
            {canAccessPanel && (
              <Link
                to="/oli"
                className="hidden rounded-full border border-[#0a2f5f]/15 px-4 py-2.5 text-sm font-bold text-[#0a2f5f] hover:bg-slate-50 sm:block"
              >
                Panel de control
              </Link>
            )}
            <Link
              to="/solicitud"
              className="hidden rounded-2xl bg-[#ef5b16] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#d94f0b] sm:block"
            >
              Súmate
            </Link>
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-navigation"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              className="rounded-xl border border-slate-200 p-2.5 lg:hidden"
            >
              <span className="block h-0.5 w-5 bg-[#0a2f5f]" />
              <span className="mt-1.5 block h-0.5 w-5 bg-[#0a2f5f]" />
              <span className="mt-1.5 block h-0.5 w-5 bg-[#0a2f5f]" />
            </button>
          </div>
        </div>
        {open && (
          <nav
            id="mobile-navigation"
            aria-label="Navegación móvil"
            className="border-t bg-white px-4 py-4 lg:hidden"
          >
            <div className="mx-auto grid max-w-7xl gap-1">
              <NavLink
                to="/"
                end
                onClick={() => setOpen(false)}
                className={mobileClass}
              >
                Inicio
              </NavLink>
              <NavLink
                to="/nosotros"
                onClick={() => setOpen(false)}
                className={mobileClass}
              >
                Nosotros
              </NavLink>
              {pillars.map(([to, label]) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={mobileClass}
                >
                  {label}
                </NavLink>
              ))}
              <NavLink
                to="/puntos-acopio"
                onClick={() => setOpen(false)}
                className={mobileClass}
              >
                Puntos de acopio
              </NavLink>
              <NavLink
                to="/emergencias"
                onClick={() => setOpen(false)}
                className={mobileClass}
              >
                Emergencias
              </NavLink>
              <NavLink
                to="/faq"
                onClick={() => setOpen(false)}
                className={mobileClass}
              >
                FAQ
              </NavLink>
              <Link
                to="/solicitud"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-xl bg-[#ef5b16] px-4 py-3 text-center font-bold text-white sm:hidden"
              >
                Solicitar apoyo
              </Link>
              {canAccessPanel && (
                <Link
                  to="/oli"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-center font-bold sm:hidden"
                >
                  Panel de control
                </Link>
              )}
            </div>
          </nav>
        )}
      </header>
      {children}
      <footer className="bg-gradient-to-r from-[#052b56] via-[#073c78] to-[#0670df] text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-20 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.2fr_.8fr_1fr_1.05fr_1.25fr] lg:gap-10 lg:px-10">
          <div className="lg:pt-2">
            <Brand inverse large />
            <img
              src="/assets/red-solidaria/plataforma-oli-blanco.png"
              alt="La plataforma de emergencia de Fundación OLI"
              className="mt-4 h-auto w-56 object-contain object-left"
            />
          </div>
          <div>
            <p className="text-lg font-bold">Nosotros</p>
            <div className="mt-6 grid gap-5">
              <FooterLink to="/nosotros">Sobre nosotros</FooterLink>
              <FooterLink href="https://olifoundation.org/">
                Fundación OLI
              </FooterLink>
            </div>
          </div>
          <div>
            <p className="text-lg font-bold">Pilares de Red</p>
            <div className="mt-6 grid gap-5">
              {pillars.map(([to, label]) => (
                <FooterLink key={to} to={to}>
                  {label
                    .replace("OLI ", "OLI ")
                    .toLowerCase()
                    .replace("oli ", "OLI ")}
                </FooterLink>
              ))}
            </div>
          </div>
          <div>
            <p className="text-lg font-bold">FAQ</p>
            <div className="mt-6 grid gap-5">
              <FooterLink to="/faq">Sobre la Red</FooterLink>
              <FooterLink to="/solicitud?tipo=DONACION">
                Donaciones y Voluntariado
              </FooterLink>
              <FooterLink to="/solicitud?tipo=ALIADO">
                Empresas y Aliados
              </FooterLink>
              <FooterLink to="/reporta">Transparencia</FooterLink>
            </div>
          </div>
          <div>
            <p className="text-lg font-bold">Red</p>
            <div className="mt-6 grid gap-5">
              <FooterLink to="/solicitud?tipo=VOLUNTARIO">
                Únete a la Red
              </FooterLink>
              <FooterLink to="/solicitud?tipo=EMERGENCIA">
                Reporta una Emergencia
              </FooterLink>
              <FooterLink to="/solicitud?tipo=ALIADO">
                Súmate como un Aliado
              </FooterLink>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {foundationLinks.map(([href, label, icon]) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${label} de Fundación OLI`}
                  title={label}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:-translate-y-0.5 hover:bg-[#ef5b16] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <SocialIcon name={icon} />
                  <span className="sr-only">{label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 pb-14 text-sm text-white/75 sm:px-8 lg:px-10">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <p>
              © {new Date().getFullYear()} Fundación OLI. Todos los derechos
              reservados.
            </p>
            <p>
              Desarrollado por{" "}
              <a
                href="https://www.linkedin.com/in/joao-basauri/"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-white/80"
              >
                Joao Basauri
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  tone = "navy",
  image,
  logo,
  focusActors = false,
}) {
  const tones = {
    navy: "from-[#092f60] to-[#061d3c]",
    orange: "from-[#df510c] to-[#f87922]",
    blue: "from-[#245d91] to-[#50aed0]",
    green: "from-[#2baea7] to-[#60a97b]",
    violet: "from-[#b6277d] to-[#803685]",
  };
  // Sección: portada reutilizable con imagen, título, descripción y acciones principales.
  return (
    <section
      className={`relative overflow-hidden bg-gradient-to-r ${tones[tone] || tones.navy} text-white`}
    >
      {image && (
        <>
          <img
            src={image}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover ${focusActors ? "object-[50%_35%]" : "object-center"}`}
          />
          <div
            className={`absolute inset-0 bg-gradient-to-r ${focusActors ? "from-black/80 via-black/30 to-black/5" : "from-black/75 via-black/45 to-transparent"}`}
          />
        </>
      )}
      <div className="relative mx-auto grid min-h-[32rem] max-w-7xl items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1.3fr_.7fr] lg:px-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[.18em] text-white/75">
            {eyebrow}
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-medium leading-tight tracking-tight sm:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/85">
            {description}
          </p>
          {children && (
            <div className="mt-8 flex flex-wrap gap-3">{children}</div>
          )}
        </div>
        {logo && (
          <img
            src={logo}
            alt=""
            className="mx-auto hidden max-h-64 max-w-full object-contain lg:block"
          />
        )}
      </div>
    </section>
  );
}
export function PrimaryLink({ to, children, light = false }) {
  return (
    <Link
      to={to}
      className={`rounded-2xl px-6 py-3.5 text-center font-bold shadow-sm transition ${light ? "bg-white text-[#0a2f5f] hover:bg-orange-50" : "bg-[#ef5b16] text-white hover:bg-[#d94f0b]"}`}
    >
      {children}
    </Link>
  );
}
export function SecondaryLink({ to, children, dark = false }) {
  return (
    <Link
      to={to}
      className={`rounded-2xl border px-6 py-3.5 text-center font-bold transition ${dark ? "border-white/50 text-white hover:bg-white/10" : "border-[#0a2f5f]/20 text-[#0a2f5f] hover:bg-slate-50"}`}
    >
      {children}
    </Link>
  );
}
