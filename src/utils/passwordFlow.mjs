export function isPasswordFlow(hash) {
  const type = new URLSearchParams(hash.replace(/^#/, '')).get('type')
  return type === 'invite' || type === 'recovery'
}
