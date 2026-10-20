import { supabase } from "../lib/supabase";
import { validateLogo } from "../../supabase/functions/_shared/ally-logo.mjs";

const BUCKET = "logos-aliados";
const extensions = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/svg+xml": "svg" };
export const LOGO_STATES = { PENDIENTE: "Pendiente", PUBLICADO: "Publicado", OCULTO: "Oculto" };

// Lee el archivo y aplica las mismas reglas que el servidor. Devuelve { type, width, height } o lanza el motivo exacto.
export async function checkLogoFile(file) {
  return validateLogo({ bytes: new Uint8Array(await file.arrayBuffer()), size: file.size, declaredType: file.type });
}

async function withUrls(items) {
  const paths = items.map((item) => item.storage_path);
  if (!paths.length) return [];
  const { data } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 3600);
  const urls = new Map((data || []).map((item) => [item.path, item.signedUrl]));
  return items.map((item) => ({ ...item, logo_url: urls.get(item.storage_path) || null }));
}

// Banner público: solo logos publicados, en el orden definido por OLI.
export async function getPublishedAllies() {
  const { data, error } = await supabase
    .from("aliados_publicos")
    .select("*")
    .order("orden")
    .order("nombre");
  if (error) throw error;
  return (await withUrls(data || [])).filter((item) => item.logo_url);
}

// Logo enviado desde el formulario de aliado (organización); queda pendiente de aprobación.
export async function uploadAllyLogo(request, file) {
  const body = new FormData();
  body.append("solicitudId", request.id);
  body.append("codigo", request.codigo);
  body.append("file", file);
  const { data, error } = await supabase.functions.invoke("upload-ally-logo", { body });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

// Gestión del panel OLI (solo ADMIN, controlado por RLS).
export async function getAllyLogos() {
  const { data, error } = await supabase
    .from("aliados_logos")
    .select("*")
    .order("orden")
    .order("created_at");
  if (error) throw error;
  return withUrls(data || []);
}

async function storeFile(file, folder) {
  const logo = await checkLogoFile(file);
  const path = `${folder}/${crypto.randomUUID()}.${extensions[logo.type]}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: logo.type, upsert: false });
  if (error) throw error;
  return { storage_path: path, mime_type: logo.type, ancho: logo.width, alto: logo.height };
}

export async function createAllyLogo({ nombre, sitio_web, estado, orden }, file) {
  const stored = await storeFile(file, "manual");
  const { error } = await supabase.from("aliados_logos").insert({ nombre, sitio_web: sitio_web || null, estado, orden, ...stored });
  if (error) {
    await supabase.storage.from(BUCKET).remove([stored.storage_path]);
    throw error;
  }
}

export async function updateAllyLogo(id, changes) {
  const { error } = await supabase.from("aliados_logos").update(changes).eq("id", id);
  if (error) throw error;
}

export async function replaceAllyLogoFile(item, file) {
  const stored = await storeFile(file, item.solicitud_id || "manual");
  try {
    await updateAllyLogo(item.id, stored);
  } catch (error) {
    await supabase.storage.from(BUCKET).remove([stored.storage_path]);
    throw error;
  }
  await supabase.storage.from(BUCKET).remove([item.storage_path]);
}

export async function deleteAllyLogo(item) {
  const { error } = await supabase.from("aliados_logos").delete().eq("id", item.id);
  if (error) throw error;
  await supabase.storage.from(BUCKET).remove([item.storage_path]);
}

// Guarda el orden mostrado en el panel (0, 1, 2...) solo para los registros que cambiaron.
export async function saveAllyOrder(items) {
  const changed = items.map((item, orden) => ({ id: item.id, orden, before: item.orden })).filter((item) => item.orden !== item.before);
  const results = await Promise.all(changed.map(({ id, orden }) => supabase.from("aliados_logos").update({ orden }).eq("id", id)));
  const failed = results.find((result) => result.error);
  if (failed) throw failed.error;
}
