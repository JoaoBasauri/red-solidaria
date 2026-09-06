import { useEffect, useState } from 'react';
import { publishEmergencyPhoto } from '../services/request.service';

export default function EmergencyPhotoApproval({ request, approve = false, observation = '', onSaved }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  function chooseFile(e) {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setPreview(selected ? URL.createObjectURL(selected) : '');
    setConfirmed(false); setError('');
  }
  async function save() {
    if (busy || !file || !confirmed) return;
    setBusy(true); setError('');
    try { await publishEmergencyPhoto(request.id, file, approve, observation); await onSaved(); }
    catch (e) { setError(e.message || 'No se pudo publicar la fotografía.'); }
    finally { setBusy(false); }
  }
  return <div className="col-span-full grid gap-3 rounded-xl border border-purple-200 bg-purple-50 p-4">
    <label className="font-semibold">Foto pública de esta emergencia<input disabled={busy} type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full text-sm" onChange={chooseFile} /></label>
    <p className="text-sm text-slate-600">JPG, PNG o WebP, máximo 5 MB. Se mostrará en las tarjetas públicas. Las evidencias del solicitante permanecen privadas.</p>
    {file && preview && <img src={preview} alt="Vista previa de la foto que se publicará" className="max-h-56 rounded-xl object-contain" />}
    <label className="flex gap-2 text-sm"><input type="checkbox" checked={confirmed} disabled={busy} onChange={e => setConfirmed(e.target.checked)} />Confirmo que corresponde a esta emergencia y está autorizada para publicación, sin datos sensibles.</label>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <button type="button" disabled={busy || !file || !confirmed} onClick={save} className="rounded-xl bg-purple-800 px-4 py-3 font-bold text-white disabled:opacity-50">{busy ? 'Guardando...' : approve ? 'Aprobar emergencia y publicar foto' : 'Publicar / reemplazar foto'}</button>
  </div>;
}
