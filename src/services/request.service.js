import { supabase } from "../lib/supabase";
import { validateRequest } from '../utils/requestValidation.mjs';

export const REQUEST_TYPES = [
  ["EMERGENCIA", "Reportar una emergencia"],
  ["KIT", "Solicitar apoyo o kits"],
  ["OFERTA_RECURSO", "Ofrecer recursos"],
  ["ALIADO", "Sumarse como aliado"],
  ["VOLUNTARIO", "Inscribirse como voluntario"],
  ["PUNTO_ACOPIO", "Proponer un punto de acopio"],
];

export const REQUEST_STATES = [
  "RECIBIDA",
  "EN_REVISION",
  "OBSERVADA",
  "APROBADA",
  "RECHAZADA",
  "ATENDIDA",
  "CERRADA",
  "CANCELADA",
];
export const ALLOWED_TRANSITIONS = {
  RECIBIDA: ["EN_REVISION", "RECHAZADA", "CANCELADA"],
  EN_REVISION: ["OBSERVADA", "APROBADA", "RECHAZADA", "CANCELADA"],
  OBSERVADA: ["EN_REVISION", "RECHAZADA", "CANCELADA"],
  APROBADA: ["ATENDIDA", "CERRADA", "CANCELADA"],
  ATENDIDA: ["CERRADA"],
  RECHAZADA: [],
  CERRADA: [],
  CANCELADA: [],
};

export async function createPublicRequest(form) {
  validateRequest(form);
  const { data, error } = await supabase.rpc("crear_solicitud_publica", {
    p_tipo: form.type,
    p_nombre: form.name,
    p_email: form.email,
    p_telefono: form.phone || null,
    p_asunto: form.subject || null,
    p_descripcion: form.description,
    p_region: form.region || null,
    p_provincia: form.province || null,
    p_distrito: form.district || null,
    p_direccion: form.address || null,
    p_latitud: form.latitude === "" ? null : Number(form.latitude),
    p_longitud: form.longitude === "" ? null : Number(form.longitude),
    p_datos: { ...form.details, ...(form.type === 'ALIADO' && form.details?.tipo_participante === 'Persona' ? { nombre_organizacion: form.name } : {}) },
    p_consentimiento: form.consent,
  });
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export async function getAcceptedVolunteers() {
  const volunteers = [];
  const pageSize = 500;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase.from('solicitudes').select('id,codigo,nombre_solicitante,email_solicitante,telefono_solicitante,region,provincia,distrito,estado,created_at,solicitud_voluntario(habilidades,disponibilidad,zona_preferida)')
      .eq('tipo', 'VOLUNTARIO').in('estado', ['APROBADA', 'ATENDIDA', 'CERRADA'])
      .order('created_at', { ascending: false }).order('id').range(offset, offset + pageSize - 1);
    if (error) throw error;
    volunteers.push(...(data || []));
    if (!data || data.length < pageSize) return volunteers;
  }
}

export async function getAllRequests() {
  const { data, error } = await supabase
    .from("solicitudes")
    .select(
      `
    *, solicitud_emergencia(*), solicitud_kit(*), oferta_recursos(*),
    solicitud_aliado(*), solicitud_voluntario(*), solicitud_punto_acopio(*)
  `,
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function changeRequestStatus(id, status, observation = "") {
  const { data, error } = await supabase.rpc("cambiar_estado_solicitud", {
    p_solicitud_id: id,
    p_estado: status,
    p_observacion: observation || null,
  });
  if (error) throw error;
  return data;
}

export async function getRequestDetails(id) {
  const { data, error } = await supabase
    .from("solicitudes")
    .select(
      `
    *, solicitud_emergencia(*), solicitud_kit(*), oferta_recursos(*), solicitud_aliado(*),
    solicitud_voluntario(*), solicitud_punto_acopio(*), solicitud_historial(*), evidencias(*)
  `,
    )
    .eq("id", id)
    .single();
  if (error) throw error;
  const evidence = await Promise.all(
    (data.evidencias || []).map(async (item) => {
      const { data: signed } = await supabase.storage
        .from("evidencias")
        .createSignedUrl(item.storage_path, 900);
      return { ...item, url: signed?.signedUrl || null };
    }),
  );
  return { ...data, evidencias: evidence };
}

export async function getOliWorkers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,nombre_completo,rol,activo")
    .eq("activo", true)
    .order("nombre_completo");
  if (error) throw error;
  return data;
}

export async function getOliProfiles() {
  const { data, error } = await supabase.functions.invoke("admin-profiles", {
    body: { action: "list" },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data.profiles;
}

export async function updateOliProfile(id, changes) {
  const { data, error } = await supabase.functions.invoke("admin-profiles", {
    body: { action: "update", id, ...changes },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data.profile;
}

export async function createOliProfile(profile) {
  const { data, error } = await supabase.functions.invoke("admin-profiles", {
    body: {
      action: "create",
      ...profile,
    },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data.profile;
}

export async function deleteOliProfile(id) {
  const { data, error } = await supabase.functions.invoke("admin-profiles", {
    body: { action: "delete", id },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function getNotifications(limit = 25) {
  const [
    { data: userData, error: userError },
    { data: notifications, error: notificationsError },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("notificaciones_oli")
      .select(
        `
      id,solicitud_id,tipo,titulo,mensaje,created_at,
      solicitudes(codigo,tipo,estado,asunto,nombre_solicitante,created_at)
    `,
      )
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);
  if (userError) throw userError;
  if (notificationsError) throw notificationsError;
  const ids = (notifications || []).map((item) => item.id);
  if (!ids.length) return [];
  const { data: reads, error: readsError } = await supabase
    .from("notificacion_lecturas")
    .select("notificacion_id,leida_at")
    .eq("usuario_id", userData.user.id)
    .in("notificacion_id", ids);
  if (readsError) throw readsError;
  const readMap = new Map(
    (reads || []).map((item) => [item.notificacion_id, item.leida_at]),
  );
  return notifications.map((item) => ({
    ...item,
    leida_at: readMap.get(item.id) || null,
  }));
}

export async function markNotificationRead(notificationId) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;
  const { error } = await supabase.from("notificacion_lecturas").upsert(
    {
      notificacion_id: notificationId,
      usuario_id: user.id,
      leida_at: new Date().toISOString(),
    },
    { onConflict: "notificacion_id,usuario_id" },
  );
  if (error) throw error;
}

export function subscribeToNotifications(onInsert) {
  const channel = supabase
    .channel("oli-notificaciones")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notificaciones_oli",
      },
      onInsert,
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export async function assignRequest(id, workerId) {
  const { data, error } = await supabase.rpc("asignar_solicitud", {
    p_solicitud_id: id,
    p_asignado_a: workerId || null,
  });
  if (error) throw error;
  return data;
}

export async function publishCollectionPoint(id, publicContact = "") {
  const { data, error } = await supabase.rpc("publicar_punto_acopio", {
    p_solicitud_id: id,
    p_contacto_publico: publicContact || null,
  });
  if (error) throw error;
  return data;
}

export async function getPublishedCollectionPoints() {
  const { data, error } = await supabase
    .from("puntos_acopio_publicos")
    .select("*");
  if (error) throw error;
  return data;
}

export async function getPublicEmergencies() {
  const { data, error } = await supabase
    .from("emergencias_publicas")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return Promise.all(
    (data || []).map(async (item) => {
      if (!item.foto_path) return item;
      const { data: photo } = await supabase.storage
        .from("emergencia-fotos")
        .createSignedUrl(item.foto_path, 3600);
      return { ...item, foto_url: photo?.signedUrl || null };
    }),
  );
}

export async function publishEmergencyPhoto(
  id,
  file,
  approve,
  observation = "",
  resources = [],
) {
  if (
    !Array.isArray(resources) ||
    !resources.length ||
    resources.length > 20 ||
    resources.some(
      (value) =>
        typeof value !== "string" || !value.trim() || value.length > 150,
    )
  ) {
    throw new Error(
      "Ingresa entre 1 y 20 recursos necesarios de hasta 150 caracteres.",
    );
  }
  if (
    !file ||
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size > 5 * 1024 * 1024
  ) {
    throw new Error("Selecciona una imagen JPG, PNG o WebP de hasta 5 MB.");
  }
  // Reexportar elimina metadatos EXIF (por ejemplo, ubicación GPS) antes de publicar.
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.88),
  );
  if (!blob) throw new Error("No se pudo preparar la imagen.");
  const path = `${id}/${crypto.randomUUID()}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from("emergencia-fotos")
    .upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (uploadError) throw uploadError;
  const { error } = await supabase.rpc("publicar_emergencia", {
    p_solicitud_id: id,
    p_path: path,
    p_aprobar: approve,
    p_observacion: observation || null,
    p_recursos: resources,
  });
  // Si falla la aprobación, el archivo queda privado y ninguna tarjeta lo muestra.
  if (error) throw error;
}

export async function isEvidenceUploadEnabled() {
  const { data, error } = await supabase
    .from("configuracion_funcionalidades")
    .select("habilitada")
    .eq("clave", "CARGA_EVIDENCIAS")
    .single();
  if (error) return false;
  return Boolean(data?.habilitada);
}

export async function uploadEvidence(request, file) {
  const body = new FormData();
  body.append("solicitudId", request.id);
  body.append("codigo", request.codigo);
  body.append("file", file);
  const { data, error } = await supabase.functions.invoke("upload-evidence", {
    body,
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}
