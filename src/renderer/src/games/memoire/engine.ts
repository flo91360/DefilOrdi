// « Mots à retenir » : l'enfant regarde une liste de mots, puis la retape de
// tête, dans l'ordre qu'il veut. Au palier « phrase », il retape une vraie
// phrase, entière et dans l'ordre.
//
// Difficulté progressive (paliers 3 → 4 → 5 → 6 → 7 mots → phrase) :
// - une partie est réussie quand tous les mots (ou la phrase) sont retrouvés ;
// - 3 réussites consécutives : palier supérieur ;
// - 1er échec : on rejoue au même palier ; 2e échec consécutif : palier
//   inférieur, jamais sous 3 mots ; une réussite remet les échecs à zéro ;
// - à chaque changement de palier, réussites et échecs repartent à zéro.

import { PALIER_MIN, PALIER_PHRASE, type ProgressionMemoire } from '../../../../shared/data'
import { defaultPhrasesMemoire } from '../../../../shared/phrases'
import { melanger, normaliserReponse } from '../commun'
import { preparePhrase } from '../dactylo/engine'

export const REUSSITES_POUR_MONTER = 3
export const ECHECS_POUR_DESCENDRE = 2

export function nombreParNiveau(niveau: number): number {
  return { 1: 3, 2: 4, 3: 5, 4: 6 }[niveau] ?? 4
}

export function estPhrase(palier: number): boolean {
  return palier === PALIER_PHRASE
}

export function libellePalier(palier: number): string {
  return estPhrase(palier) ? 'une phrase' : `${palier} mots`
}

// Temps pour mémoriser : 2,5 s par mot, plus 2 s.
export function dureeMemorisation(nbMots: number): number {
  return nbMots * 2500 + 2000
}

export function choisirMots(liste: string[], n: number, random: () => number = Math.random): string[] {
  const uniques = [...new Map(liste.map((m) => [normaliserReponse(m), m.trim()])).values()].filter((m) => m !== '')
  return melanger(uniques, random).slice(0, n)
}

// --- Progression -----------------------------------------------------------

export type EtatProgression = Pick<ProgressionMemoire, 'palier' | 'reussites' | 'echecs'>
export type Changement = 'monte' | 'descend' | null

export function departProgression(palier: number): EtatProgression {
  return { palier: Math.min(PALIER_PHRASE, Math.max(PALIER_MIN, palier)), reussites: 0, echecs: 0 }
}

export function avancerProgression(etat: EtatProgression, reussie: boolean): EtatProgression & { changement: Changement } {
  if (reussie) {
    const reussites = etat.reussites + 1
    if (reussites >= REUSSITES_POUR_MONTER && etat.palier < PALIER_PHRASE) {
      return { palier: etat.palier + 1, reussites: 0, echecs: 0, changement: 'monte' }
    }
    // Au palier le plus haut, on reste à la phrase.
    return { palier: etat.palier, reussites: Math.min(reussites, REUSSITES_POUR_MONTER), echecs: 0, changement: null }
  }
  const echecs = etat.echecs + 1
  if (echecs >= ECHECS_POUR_DESCENDRE) {
    if (etat.palier > PALIER_MIN) return { palier: etat.palier - 1, reussites: 0, echecs: 0, changement: 'descend' }
    // Déjà au minimum : on reste à 3 mots, compteurs remis à zéro.
    return { palier: etat.palier, reussites: 0, echecs: 0, changement: null }
  }
  return { palier: etat.palier, reussites: 0, echecs, changement: null }
}

// --- Vérification des mots (paliers 3 à 7) -----------------------------------

// Moins de 5 mots : aucune tolérance (seuls les espaces autour sont ignorés).
// De 5 à 7 mots : accents et majuscules ne comptent pas.
export function toleranceAccents(palier: number): boolean {
  return palier >= 5
}

function cleMot(s: string, palier: number): string {
  return toleranceAccents(palier) ? normaliserReponse(s) : s.trim().replace(/\s+/g, ' ')
}

export type Proposition = { type: 'trouve'; index: number } | { type: 'deja'; index: number } | { type: 'absent' } | { type: 'vide' }

export function proposer(mots: string[], trouves: boolean[], saisie: string, palier: number): Proposition {
  const r = cleMot(saisie, palier)
  if (r === '') return { type: 'vide' }
  const index = mots.findIndex((m) => cleMot(m, palier) === r)
  if (index === -1) return { type: 'absent' }
  return trouves[index] ? { type: 'deja', index } : { type: 'trouve', index }
}

// --- Palier « phrase » -------------------------------------------------------

// Grande tolérance : accents, majuscules et ponctuation ne comptent pas.
// L'apostrophe et le trait d'union sont simplement ignorés (« J'aime » =
// « jaime » = « j'aime »).
export function cleMotPhrase(s: string): string {
  return normaliserReponse(preparePhrase(s))
    .replace(/['-]/g, '')
    .replace(/[^\p{L}\p{N}]/gu, '')
}

// Les mots d'une phrase, tels qu'affichés (ponctuation collée comprise) ;
// la ponctuation isolée (« ; », « ! »…) n'est pas un mot.
export function motsDePhrase(phrase: string): string[] {
  return preparePhrase(phrase)
    .split(' ')
    .filter((m) => cleMotPhrase(m) !== '')
}

export function choisirPhrase(phrases: string[], random: () => number = Math.random): string {
  const valides = phrases.map(preparePhrase).filter((p) => motsDePhrase(p).length > 0)
  const source = valides.length > 0 ? valides : defaultPhrasesMemoire().map(preparePhrase)
  return source[Math.floor(random() * source.length)] ?? source[0]
}

export interface VerificationPhrase {
  trouves: boolean[] // mots de la phrase retrouvés à leur place
  enTrop: number // mots tapés qui ne correspondent à aucun mot attendu
  reussie: boolean // tous les mots justes, dans l'ordre, sans mot en trop
}

// Compare la saisie à la phrase attendue mot à mot, dans l'ordre (plus longue
// sous-suite commune) : un mot oublié ne décale pas les suivants.
export function verifierPhrase(attendus: string[], saisie: string): VerificationPhrase {
  const a = attendus.map(cleMotPhrase)
  const t = saisie
    .split(/\s+/)
    .map(cleMotPhrase)
    .filter((m) => m !== '')
  const n = a.length
  const m = t.length
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === t[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1])
    }
  }
  const trouves = a.map(() => false)
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (a[i] === t[j]) {
      trouves[i] = true
      i++
      j++
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) i++
    else j++
  }
  const justes = lcs[0][0]
  return { trouves, enTrop: m - justes, reussie: n > 0 && justes === n && m === n }
}
