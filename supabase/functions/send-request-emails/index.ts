import { createClient } from 'jsr:@supabase/supabase-js@2';
import nodemailer from 'npm:nodemailer@7';
import { smtpConfig } from '../_shared/smtp-config.mjs';
import { renderEmail } from '../_shared/email-templates.mjs';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

Deno.serve(async request => {
  if (request.method !== 'POST') return json({ error: 'Método no permitido.' }, 405);
  // Secreto exclusivo del programador; nunca se usa una clave pública del frontend.
  const secret = Deno.env.get('MAIL_WORKER_SECRET');
  if (!secret || secret.length < 32 || request.headers.get('x-mail-worker-secret') !== secret) return json({ error: 'No autorizado.' }, 401);
  let config;
  try { config = smtpConfig(key => Deno.env.get(key)); }
  catch { return json({ error: 'Configuración SMTP incompleta o inválida.' }, 503); }
  if (!config) return json({ mensaje: 'Envío desactivado. No se procesó la cola.' });
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
  const { data, error } = await db.rpc('reclamar_correo');
  if (error) return json({ error: 'No se pudo consultar la cola.' }, 500);
  const mail = data?.[0];
  if (!mail) return json({ mensaje: 'No hay correos pendientes.' });
  const update = async (values: Record<string, unknown>) => {
    const { error } = await db.from('correos_salida').update(values).eq('id', mail.id).eq('estado', 'PROCESANDO');
    if (error) throw new Error('No se pudo registrar el resultado.');
  };
  let content;
  try {
    if (!/^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/.test(mail.destinatario)) throw new Error('Destinatario inválido');
    content = renderEmail(mail.plantilla, mail.datos);
  } catch {
    await update({ estado: 'CANCELADO', ultimo_error: 'Destinatario o plantilla inválidos.' });
    return json({ mensaje: 'Correo cancelado por datos inválidos.' });
  }
  const transport = nodemailer.createTransport(config.transport);
  try {
    await transport.sendMail({ ...content, from: config.from, to: { address: mail.destinatario, name: '' },
      messageId: `<red-solidaria-${mail.id}@${config.from.address.split('@')[1]}>` });
  } catch (error) {
    const failure = error as { responseCode?: number; code?: string };
    // SMTP no garantiza idempotencia. Un fallo ambiguo NO se reenvía automáticamente.
    const rejected = failure.responseCode && failure.responseCode >= 400 && failure.responseCode < 600;
    const beforeSend = ['EAUTH','EDNS'].includes(failure.code || '');
    if (rejected || beforeSend) {
      const permanent = failure.code === 'EAUTH' || (failure.responseCode || 0) >= 500 || mail.intentos >= 5;
      await update({ estado: permanent ? 'CANCELADO' : 'ERROR', ultimo_error: permanent ? 'Envío rechazado; revisar configuración o destinatario.' : 'Fallo temporal de SMTP.',
        disponible_desde: new Date(Date.now() + 60000 * 2 ** mail.intentos).toISOString() });
    } else {
      await update({ ultimo_error: 'Resultado SMTP incierto. Revisar entrega antes de reintentar manualmente.' });
    }
    return json({ error: 'No se pudo confirmar el envío. Revisar la cola.' }, 502);
  } finally { transport.close(); }
  try { await update({ estado: 'ENVIADO', enviado_at: new Date().toISOString(), ultimo_error: null }); }
  catch { return json({ error: 'SMTP aceptó el correo, pero no se pudo registrar. No reenviar sin verificar.' }, 500); }
  return json({ mensaje: 'Correo aceptado por el servidor SMTP.' });
});
