function parse(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number]
}

function toHex(rgb: number[]): string {
  return '#' + rgb.map((c) => Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, '0')).join('')
}

// Mélange deux couleurs : t = 0 donne a, t = 1 donne b.
export function mix(a: string, b: string, t: number): string {
  const ca = parse(a)
  const cb = parse(b)
  return toHex(ca.map((c, i) => c + (cb[i] - c) * t))
}

export const lighten = (c: string, t: number): string => mix(c, '#ffffff', t)
export const darken = (c: string, t: number): string => mix(c, '#000000', t)

function luminance(hex: string): number {
  const [r, g, b] = parse(hex).map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const TEXTE_FONCE = '#1f2330'
const TEXTE_CLAIR = '#ffffff'

// Rapport de contraste entre deux couleurs (de 1 à 21).
export function contraste(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}

// Couleur de texte lisible (foncé ou blanc) sur un fond donné : celle qui
// contraste le plus (un seuil fixe laissait du blanc sur l'orange ou le
// turquoise, à moins de 3:1).
export function textOn(bg: string): string {
  return contraste(bg, TEXTE_FONCE) >= contraste(bg, TEXTE_CLAIR) ? TEXTE_FONCE : TEXTE_CLAIR
}

// Version de la couleur assez foncée pour du texte sur fond clair.
export function inkOf(c: string): string {
  let ink = c
  for (let i = 0; i < 6 && luminance(ink) > 0.18; i++) ink = darken(ink, 0.15)
  return ink
}
