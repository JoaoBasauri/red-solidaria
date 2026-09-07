import { Link } from 'react-router-dom';
import AcceptedVolunteers from '../../components/AcceptedVolunteers';

export default function Volunteers() {
  return <main className="min-h-screen bg-slate-100">
    <header className="border-b bg-white"><div className="mx-auto max-w-7xl px-4 py-5 sm:px-8"><Link to="/oli" className="text-sm font-bold text-blue-700 hover:underline">Volver al panel OLI</Link><h1 className="mt-2 text-2xl font-black text-[#073164]">Voluntarios de la Red Solidaria</h1><p className="mt-1 text-sm text-slate-500">Consulta los registros aprobados y encuentra perfiles compatibles con las oportunidades de apoyo.</p></div></header>
    <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-8"><AcceptedVolunteers /></div>
  </main>;
}
