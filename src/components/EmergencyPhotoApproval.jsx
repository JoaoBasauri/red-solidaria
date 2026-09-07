import { useEffect, useState } from 'react';
import { publishEmergencyPhoto } from '../services/request.service';

export default function EmergencyPhotoApproval({ request, approve = false, observation = '', onSaved }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [resourcesText, setResourcesText] = useState('');
  const resources = [...new Set(resourcesText.split('\n').map(value => value.trim()).filter(Boolean))];
  const validResources = resources.length > 0 && resources.length <= 20 && resources.every(value => value.length <= 150);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  function chooseFile(e) {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setPreview(selected ? URL.createObjectURL(selected) : '');
    setConfirmed(false); setError('');
  }
  async function save() {
    if (busy || !file || !confirmed || !validResources) return;
    setBusy(true); setError('');
    try { await publishEmergencyPhoto(request.id, file, approve, observation, resources); await onSaved(); }
    catch (e) { setError(e.message || 'No se pudo publicar la fotografía.'); }
    finally { setBusy(false); }
  }
  return <div className="col-span-full grid gap-3 rounded-xl border border-purple-200 bg-purple-50 p-4">
    <label className="font-semibold">Foto pública de esta emergencia<input disabled={busy} type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full text-sm" onChange={chooseFile} /></label>
    <p className="text-sm text-slate-600">JPG, PNG o WebP, máximo 5 MB. Se mostrará en las tarjetas públicas. Las evidencias del solicitante permanecen privadas.</p>
    {file && preview && <img src={preview} alt="Vista previa de la foto que se publicará" className="max-h-56 rounded-xl object-contain" />}
    <label className="font-semibold">Recursos necesarios (obligatorio)<textarea disabled={busy} value={resourcesText} onChange={e => { setResourcesText(e.target.value); setConfirmed(false); }} rows={4} maxLength={3020} placeholder={'Agua potable: 100 litros\nFrazadas: 50 unidades\nKits de alimentos: 30 unidades'} className="mt-2 block w-full rounded-lg border p-3 text-sm font-normal" aria-describedby="recursos-ayuda" /></label>
    <p id="recursos-ayuda" className="text-sm text-slate-600">Ingresa un recurso por línea, con cantidad y unidad cuando corresponda. Máximo 20 recursos y 150 caracteres por recurso. Esta información será pública.</p>
    {!!resourcesText && !validResources && <p role="alert" className="text-sm text-red-700">Ingresa entre 1 y 20 recursos de hasta 150 caracteres cada uno.</p>}
    <label className="flex gap-2 text-sm"><input type="checkbox" checked={confirmed} disabled={busy} onChange={e => setConfirmed(e.target.checked)} />Confirmo que la foto y los recursos corresponden a esta emergencia y están autorizados para publicación, sin datos sensibles.</label>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <button type="button" disabled={busy || !file || !confirmed || !validResources} onClick={save} className="rounded-xl bg-purple-800 px-4 py-3 font-bold text-white disabled:opacity-50">{busy ? 'Guardando...' : approve ? 'Aprobar y publicar foto y recursos' : 'Actualizar foto y recursos'}</button>
  </div>;
}
