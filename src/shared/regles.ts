// Règles des phrases personnelles que les enfants ajoutent après une médaille.
// Fonctions pures, testées dans tests/regles.test.ts. Aucune donnée ne quitte
// le PC : tout est vérifié localement.

export interface ReglesNiveau {
  maxMots: number | null // null = pas de maximum
  accents: boolean
  majuscules: 'aucune' | 'debut' | 'libres'
  maxSignes: number // ponctuation et caractères spéciaux (hors apostrophe et trait d'union dans un mot)
  chiffres: boolean
  description: string // rappel donné à l'enfant, sans le nombre de mots (ajouté à part)
}

export const REGLES_NIVEAU: Record<number, ReglesNiveau> = {
  1: {
    maxMots: 6,
    accents: false,
    majuscules: 'aucune',
    maxSignes: 0,
    chiffres: false,
    description: 'une phrase très courte, sans accent, sans majuscule et sans ponctuation'
  },
  2: {
    maxMots: 10,
    accents: true,
    majuscules: 'debut',
    maxSignes: 1,
    chiffres: false,
    description: 'une phrase un peu plus longue, avec des accents, une majuscule au début et au plus un signe de ponctuation (par exemple le point final)'
  },
  3: {
    maxMots: 14,
    accents: true,
    majuscules: 'libres',
    maxSignes: 3,
    chiffres: true,
    description: 'une phrase avec des majuscules et au plus 3 signes de ponctuation ou caractères spéciaux'
  },
  4: {
    maxMots: null,
    accents: true,
    majuscules: 'libres',
    maxSignes: Infinity,
    chiffres: true,
    description: 'une phrase très longue, avec accents, ponctuation, majuscules et caractères spéciaux'
  }
}

export function reglesDuNiveau(niveau: number): ReglesNiveau {
  return REGLES_NIVEAU[niveau] ?? REGLES_NIVEAU[1]
}

// Texte affiché à l'enfant : la règle du niveau, avec le nombre maximal de mots.
export function texteRegle(niveau: number): string {
  const r = reglesDuNiveau(niveau)
  const mots = r.maxMots === null ? 'pas de maximum de mots' : `${r.maxMots} mots au maximum`
  return `Niveau ${niveau} : ${r.description} (${mots}).`
}

const LETTRES_ACCENTUEES = 'àâäçéèêëîïôöùûüÿ'
// Caractères qu'on obtient avec le clavier AZERTY Windows (touches, Maj, ^ et ¨).
const SPECIAUX_AZERTY = '&"\'(-_)=~#{[|`\\^@]}$£¤*µ%§!/:;.,?<>²°+€'

export function estTapable(c: string): boolean {
  if (c === ' ') return true
  if (/[a-zA-Z0-9]/.test(c)) return true
  if (LETTRES_ACCENTUEES.includes(c.toLocaleLowerCase('fr'))) return true
  return SPECIAUX_AZERTY.includes(c)
}

export function mots(texte: string): string[] {
  return texte.split(/\s+/).filter((m) => m !== '')
}

export function estLettre(c: string): boolean {
  return /\p{L}/u.test(c)
}

// Liste des règles non respectées (vide = phrase conforme). Les messages
// restent bienveillants : ils sont montrés tels quels à l'enfant.
export function verifierRegles(texte: string, niveau: number): string[] {
  const r = reglesDuNiveau(niveau)
  const t = texte.trim().replace(/\s+/g, ' ')
  const problemes: string[] = []
  const lesMots = mots(t)
  if (lesMots.length === 0) return ['Écris une phrase.']
  if (r.maxMots !== null && lesMots.length > r.maxMots) {
    problemes.push(`Ta phrase a ${lesMots.length} mots : au niveau ${niveau}, il y en a ${r.maxMots} au maximum.`)
  }
  const chars = [...t]
  if (chars.some((c) => !estTapable(c))) {
    problemes.push('Ta phrase contient un caractère qu’on ne peut pas taper sur le clavier.')
  }
  if (!r.accents && chars.some((c) => LETTRES_ACCENTUEES.includes(c.toLocaleLowerCase('fr')))) {
    problemes.push('Au niveau ' + niveau + ', on n’utilise pas d’accent.')
  }
  const majuscules = chars.filter((c, i) => estLettre(c) && c !== c.toLocaleLowerCase('fr') && !(r.majuscules === 'debut' && i === 0))
  if (r.majuscules !== 'libres' && majuscules.length > 0) {
    problemes.push(
      r.majuscules === 'aucune' ? 'Au niveau ' + niveau + ', on n’utilise pas de majuscule.' : 'Au niveau ' + niveau + ', seule la première lettre est une majuscule.'
    )
  }
  if (!r.chiffres && chars.some((c) => /[0-9]/.test(c))) {
    problemes.push('Au niveau ' + niveau + ', on n’utilise pas de chiffre.')
  }
  // Signes : tout sauf lettres, chiffres, espaces ; l'apostrophe et le trait
  // d'union entre deux lettres font partie du mot.
  let signes = 0
  chars.forEach((c, i) => {
    if (estLettre(c) || /[0-9 ]/.test(c) || !estTapable(c)) return
    const dansMot = r.maxSignes > 0 && (c === "'" || c === '-') && i > 0 && i < chars.length - 1 && estLettre(chars[i - 1]) && estLettre(chars[i + 1])
    if (!dansMot) signes++
  })
  if (signes > r.maxSignes) {
    problemes.push(
      r.maxSignes === 0
        ? 'Au niveau ' + niveau + ', on n’utilise pas de ponctuation.'
        : `Ta phrase a trop de signes de ponctuation ou de caractères spéciaux (${r.maxSignes} au maximum au niveau ${niveau}).`
    )
  }
  return problemes
}
