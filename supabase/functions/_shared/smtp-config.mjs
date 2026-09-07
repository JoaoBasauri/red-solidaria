export function smtpConfig(get) {
  if (get('MAIL_ENABLED') !== 'true') return null;
  const required = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD', 'MAIL_FROM_EMAIL'];
  if (required.some(key => !get(key))) throw new Error('Falta configurar el correo SMTP.');
  const port = Number(get('SMTP_PORT') || '587');
  if (![465, 587, 2525].includes(port)) throw new Error('Puerto SMTP no permitido.');
  if (!/^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/.test(get('MAIL_FROM_EMAIL'))) throw new Error('Remitente no válido.');
  return {
    transport: { host: get('SMTP_HOST'), port, secure: port === 465, requireTLS: true,
      auth: { user: get('SMTP_USER'), pass: get('SMTP_PASSWORD') },
      connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000,
      tls: { rejectUnauthorized: true }, logger: false, debug: false,
      disableFileAccess: true, disableUrlAccess: true },
    from: { name: get('MAIL_FROM_NAME') || 'Red Solidaria · Fundación OLI', address: get('MAIL_FROM_EMAIL') },
  };
}
