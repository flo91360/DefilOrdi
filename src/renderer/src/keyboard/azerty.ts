// Clavier AZERTY français (Windows) : disposition, doigts, et touches à
// presser pour obtenir chaque caractère.

export type Doigt =
  | 'auriculaire-g'
  | 'annulaire-g'
  | 'majeur-g'
  | 'index-g'
  | 'pouce'
  | 'index-d'
  | 'majeur-d'
  | 'annulaire-d'
  | 'auriculaire-d'

export interface Touche {
  id: string
  label: string // caractère principal (minuscule)
  haut?: string // caractère avec Maj
  largeur?: number // en unités de touche (1 par défaut)
  doigt: Doigt
  speciale?: boolean
}

const t = (id: string, doigt: Doigt, haut?: string, label = id): Touche => ({ id, label, haut, doigt })
const s = (id: string, label: string, largeur: number, doigt: Doigt): Touche => ({
  id,
  label,
  largeur,
  doigt,
  speciale: true
})

export const RANGEES: Touche[][] = [
  [
    t('²', 'auriculaire-g'),
    t('&', 'auriculaire-g', '1'),
    t('é', 'annulaire-g', '2'),
    t('"', 'majeur-g', '3'),
    t("'", 'index-g', '4'),
    t('(', 'index-g', '5'),
    t('-', 'index-d', '6'),
    t('è', 'index-d', '7'),
    t('_', 'majeur-d', '8'),
    t('ç', 'annulaire-d', '9'),
    t('à', 'auriculaire-d', '0'),
    t(')', 'auriculaire-d', '°'),
    t('=', 'auriculaire-d', '+'),
    s('retour', '⌫', 2, 'auriculaire-d')
  ],
  [
    s('tab', '↹', 1.5, 'auriculaire-g'),
    t('a', 'auriculaire-g'),
    t('z', 'annulaire-g'),
    t('e', 'majeur-g'),
    t('r', 'index-g'),
    t('t', 'index-g'),
    t('y', 'index-d'),
    t('u', 'index-d'),
    t('i', 'majeur-d'),
    t('o', 'annulaire-d'),
    t('p', 'auriculaire-d'),
    t('^', 'auriculaire-d', '¨'),
    t('$', 'auriculaire-d', '£'),
    s('entree', 'Entrée', 1.5, 'auriculaire-d')
  ],
  [
    s('verr', 'Verr. maj', 1.75, 'auriculaire-g'),
    t('q', 'auriculaire-g'),
    t('s', 'annulaire-g'),
    t('d', 'majeur-g'),
    t('f', 'index-g'),
    t('g', 'index-g'),
    t('h', 'index-d'),
    t('j', 'index-d'),
    t('k', 'majeur-d'),
    t('l', 'annulaire-d'),
    t('m', 'auriculaire-d'),
    t('ù', 'auriculaire-d', '%'),
    t('*', 'auriculaire-d', 'µ'),
    s('vide', '', 1.25, 'auriculaire-d')
  ],
  [
    s('maj-g', 'Maj', 1.25, 'auriculaire-g'),
    t('<', 'auriculaire-g', '>'),
    t('w', 'auriculaire-g'),
    t('x', 'annulaire-g'),
    t('c', 'majeur-g'),
    t('v', 'index-g'),
    t('b', 'index-g'),
    t('n', 'index-d'),
    t(',', 'majeur-d', '?'),
    t(';', 'annulaire-d', '.'),
    t(':', 'auriculaire-d', '/'),
    t('!', 'auriculaire-d', '§'),
    s('maj-d', 'Maj', 2.75, 'auriculaire-d')
  ],
  [
    s('ctrl', 'Ctrl', 1.5, 'auriculaire-g'),
    s('alt', 'Alt', 1.5, 'pouce'),
    s('espace', '', 7, 'pouce'),
    s('altgr', 'Alt Gr', 1.5, 'pouce'),
    s('ctrl-d', 'Ctrl', 3.5, 'auriculaire-d')
  ]
]

const TOUCHES = new Map(RANGEES.flat().map((k) => [k.id, k]))

export function touche(id: string): Touche | undefined {
  return TOUCHES.get(id)
}

// Maj de la main opposée à la touche, comme on l'apprend en dactylographie.
function majPour(id: string): string {
  const d = TOUCHES.get(id)?.doigt ?? ''
  return d.endsWith('-g') ? 'maj-d' : 'maj-g'
}

const PAR_MAJ = new Map<string, string>()
for (const k of RANGEES.flat()) {
  if (k.haut) PAR_MAJ.set(k.haut, k.id)
}

const ALTGR: Record<string, string> = { '@': 'à', '€': 'e', '#': '"', '~': 'é', '{': "'", '[': '(', '|': '-', '`': 'è', '\\': '_', ']': ')', '}': '=' }

const CIRCONFLEXE: Record<string, string> = { â: 'a', ê: 'e', î: 'i', ô: 'o', û: 'u' }
const TREMA: Record<string, string> = { ä: 'a', ë: 'e', ï: 'i', ö: 'o', ü: 'u', ÿ: 'y' }

export interface Geste {
  // Touches à presser ensemble, étape par étape (ex. [["^"], ["e"]] pour ê)
  etapes: string[][]
  aide: string
}

function nom(id: string): string {
  if (id === 'espace') return 'Espace'
  if (id.startsWith('maj')) return 'Maj'
  if (id === 'altgr') return 'Alt Gr'
  return TOUCHES.get(id)?.label ?? id
}

function decrire(etapes: string[][]): string {
  return etapes.map((e) => e.map(nom).join(' + ')).join(' puis ')
}

// Comment taper un caractère sur un clavier AZERTY. null si inconnu.
export function geste(c: string): Geste | null {
  let etapes: string[][] | null = null
  const bas = c.toLocaleLowerCase('fr')
  if (c === ' ') etapes = [['espace']]
  else if (TOUCHES.has(c) && !TOUCHES.get(c)?.speciale) etapes = [[c]]
  else if (PAR_MAJ.has(c)) {
    const id = PAR_MAJ.get(c) as string
    etapes = [[majPour(id), id]]
  } else if (c !== bas && TOUCHES.has(bas) && /[a-z]/.test(bas)) etapes = [[majPour(bas), bas]]
  else if (CIRCONFLEXE[bas]) {
    const l = CIRCONFLEXE[bas]
    etapes = [['^'], c === bas ? [l] : [majPour(l), l]]
  } else if (TREMA[bas]) {
    const l = TREMA[bas]
    etapes = [[majPour('^'), '^'], c === bas ? [l] : [majPour(l), l]]
  } else if (ALTGR[c]) etapes = [['altgr', ALTGR[c]]]
  else if (c !== bas && TOUCHES.has(bas)) {
    // É, È, À, Ç, Ù ne se tapent pas simplement sur un clavier Windows :
    // la majuscule sans accent est acceptée (voir memeCaractere).
    const l = bas.normalize('NFD')[0]
    etapes = [[majPour(l), l]]
  }
  return etapes ? { etapes, aide: decrire(etapes) } : null
}

// Touche principale d'un caractère (pour la carte des erreurs).
export function toucheDe(c: string): string | null {
  const g = geste(c)
  if (!g) return null
  const derniere = g.etapes[g.etapes.length - 1]
  return derniere[derniere.length - 1]
}
