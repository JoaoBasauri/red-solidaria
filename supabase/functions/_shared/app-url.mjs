export function passwordRedirect(base) {
  if (!base) throw new Error('Configura la URL base pública de Red Solidaria antes de enviar enlaces.');
  let url;
  try { url = new URL(base); } catch { throw new Error('La URL base pública no es válida.'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || ['localhost','127.0.0.1','[::1]'].includes(url.hostname) || url.hostname.endsWith('.localhost')) {
    throw new Error('La URL base debe ser pública, HTTPS y no contener credenciales, parámetros ni fragmentos.');
  }
  return `${url.href.replace(/\/+$/, '')}/actualizar-contrasena`;
}
