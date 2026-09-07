export default function EmergencyResources({ emergency }) {
  const resources = emergency.recursos_necesarios || [];
  return resources.length ? <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm leading-6">
    {resources.map((resource, index) => <li key={`${index}-${resource}`} className="flex items-start gap-2"><span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-purple-800" />{resource}</li>)}
  </ul> : <p className="mt-1 text-sm leading-6">Recursos pendientes de publicación por OLI.</p>;
}
