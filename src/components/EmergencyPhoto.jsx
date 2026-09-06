import { useState } from 'react';

export default function EmergencyPhoto({ emergency }) {
  const [failedUrl, setFailedUrl] = useState(null);
  const url = emergency.foto_url;
  return url && failedUrl !== url
    ? <img src={url} alt={`Fotografía de ${emergency.titulo} publicada por OLI`} loading="lazy" onError={() => setFailedUrl(url)} className="h-28 w-full rounded-xl object-cover" />
    : <div className="flex h-28 items-center justify-center rounded-xl bg-slate-100 px-4 text-center text-sm text-slate-500">Fotografía pendiente de publicación</div>;
}
