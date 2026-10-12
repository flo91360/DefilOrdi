// Outils partagés par les jeux.

// Compare deux réponses sans tenir compte des majuscules, des accents ni
// des espaces autour.
export function normaliserReponse(s: string): string {
  return s
    .trim()
    .toLocaleLowerCase('fr')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
}

export function melanger<T>(items: T[], random: () => number = Math.random): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function pourcentage(n: number, total: number): number {
  return total === 0 ? 0 : Math.round((n / total) * 100)
}
