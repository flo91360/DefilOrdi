// Identifiant unique (crypto.randomUUID n'existe que dans un contexte sécurisé).
export function uid(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}
