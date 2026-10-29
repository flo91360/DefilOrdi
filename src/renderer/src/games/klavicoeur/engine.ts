// « Klavicoeur » : apprendre le clavier par cœur. Le clavier est caché ;
// l'enfant place à la souris, une par une, les lettres à leur place.
//
// Règles :
// - lettre mal placée : elle est mise de côté (une « hésitation ») et revient
//   à la fin, quand toutes les autres lettres ont été proposées ;
// - niveau validé quand toutes les lettres sont placées (dans le temps, s'il
//   y a une limite) : le niveau suivant est débloqué ;
// - temps dépassé : on rejoue le niveau ; 2e fois de suite : niveau inférieur
//   (les niveaux déjà débloqués le restent).
// La phase d'apprentissage des rangées se fait avec l'ergothérapeute, hors du
// jeu : les niveaux « apprendre » sont des placements sans limite de temps.

import { NIVEAU_KLAVICOEUR_MAX, type ProgressionKlavicoeur } from '../../../../shared/data'
import { melanger } from '../commun'

// Les trois rangées de lettres du clavier AZERTY (chiffres exclus).
export const RANGEES_KLAVICOEUR: readonly (readonly string[])[] = [
  ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
  ['W', 'X', 'C', 'V', 'B', 'N']
]

// Décalage de chaque rangée, en largeur de touche, comme sur un vrai clavier.
export const DECALAGES_RANGEES = [0, 0.3, 0.8]

// Code couleur : main gauche en rouge, main droite en vert, milieu en bleu clair.
export type Zone = 'gauche' | 'droite' | 'milieu'

const GAUCHE = new Set('AZERQSDFWXC'.split(''))
const DROITE = new Set('UIOPJKLMNB'.split(''))
const MILIEU = new Set('TGVYH'.split(''))
const GRAS = new Set(['T', 'G', 'V'])

export function zoneDe(lettre: string): Zone {
  if (GAUCHE.has(lettre)) return 'gauche'
  if (DROITE.has(lettre)) return 'droite'
  if (MILIEU.has(lettre)) return 'milieu'
  throw new Error(`Lettre hors du jeu : ${lettre}`)
}

// T, G et V sont mises en évidence en gras.
export function enGras(lettre: string): boolean {
  return GRAS.has(lettre)
}

export const NOMS_ZONES: Record<Zone, string> = {
  gauche: 'main gauche',
  droite: 'main droite',
  milieu: 'zone du milieu'
}

// --- Niveaux -----------------------------------------------------------------

export interface NiveauKlavicoeur {
  numero: number // 1 à 11
  rangees: number[] // index dans RANGEES_KLAVICOEUR
  tempsLimite: number // secondes, 0 = sans limite
}

export const NIVEAUX_KLAVICOEUR: NiveauKlavicoeur[] = [
  { numero: 1, rangees: [0], tempsLimite: 0 },
  { numero: 2, rangees: [0], tempsLimite: 90 },
  { numero: 3, rangees: [1], tempsLimite: 0 },
  { numero: 4, rangees: [1], tempsLimite: 90 },
  { numero: 5, rangees: [2], tempsLimite: 0 },
  { numero: 6, rangees: [2], tempsLimite: 90 },
  { numero: 7, rangees: [0, 1], tempsLimite: 180 },
  { numero: 8, rangees: [1, 2], tempsLimite: 180 },
  { numero: 9, rangees: [0, 1, 2], tempsLimite: 240 },
  { numero: 10, rangees: [0, 1, 2], tempsLimite: 180 },
  { numero: 11, rangees: [0, 1, 2], tempsLimite: 120 }
]

export function niveauKlavicoeur(numero: number): NiveauKlavicoeur {
  const n = Math.min(NIVEAU_KLAVICOEUR_MAX, Math.max(1, Math.round(numero) || 1))
  return NIVEAUX_KLAVICOEUR[n - 1]
}

export function lettresDuNiveau(numero: number): string[] {
  return niveauKlavicoeur(numero).rangees.flatMap((r) => [...RANGEES_KLAVICOEUR[r]])
}

// « 1 min 30 », « 3 min », « Sans limite de temps ».
export function formatLimite(secondes: number): string {
  if (secondes <= 0) return 'Sans limite de temps'
  const m = Math.floor(secondes / 60)
  const s = secondes % 60
  return s === 0 ? `${m} min` : m === 0 ? `${s} s` : `${m} min ${s}`
}

// « Rangée 1 », « Rangées 1 et 2 », « Toutes les rangées ».
export function nomRangees(numero: number): string {
  const r = niveauKlavicoeur(numero).rangees
  if (r.length === RANGEES_KLAVICOEUR.length) return 'Toutes les rangées'
  if (r.length === 1) return `Rangée ${r[0] + 1}`
  return `Rangées ${r.map((x) => x + 1).join(' et ')}`
}

// « Niveau 2 · Rangée 1 · 1 min 30 », pour l'enfant et pour l'ergothérapeute.
export function descriptionNiveau(numero: number): string {
  const n = niveauKlavicoeur(numero)
  const temps = n.tempsLimite > 0 ? `en ${formatLimite(n.tempsLimite)} maximum` : 'sans limite de temps'
  return `${nomRangees(numero)}, ${temps}`
}

// --- Partie ------------------------------------------------------------------

export interface EtatPartie {
  pioche: string[] // lettres à placer, la première est la lettre en cours
  deCote: string[] // lettres mal placées, qui reviendront à la fin
  placees: string[] // lettres déjà à leur place
  hesitations: number
  hesitationsParLettre: Record<string, number>
  rattrapage: boolean // on replace les lettres mises de côté
}

export function nouvellePartie(numero: number, random: () => number = Math.random): EtatPartie {
  return { pioche: melanger(lettresDuNiveau(numero), random), deCote: [], placees: [], hesitations: 0, hesitationsParLettre: {}, rattrapage: false }
}

export function lettreEnCours(etat: EtatPartie): string | null {
  return etat.pioche[0] ?? null
}

export function partieFinie(etat: EtatPartie): boolean {
  return etat.pioche.length === 0 && etat.deCote.length === 0
}

// L'enfant pose la lettre en cours sur l'emplacement de la lettre `cible`.
export function placer(etat: EtatPartie, cible: string): { etat: EtatPartie; juste: boolean } {
  const lettre = lettreEnCours(etat)
  if (lettre === null || etat.placees.includes(cible)) return { etat, juste: false }
  const reste = etat.pioche.slice(1)
  const juste = lettre === cible
  let suivant: EtatPartie = juste
    ? { ...etat, pioche: reste, placees: [...etat.placees, lettre] }
    : {
        ...etat,
        pioche: reste,
        deCote: [...etat.deCote, lettre],
        hesitations: etat.hesitations + 1,
        hesitationsParLettre: { ...etat.hesitationsParLettre, [lettre]: (etat.hesitationsParLettre[lettre] ?? 0) + 1 }
      }
  // Toutes les lettres ont été proposées : les lettres mises de côté reviennent.
  if (suivant.pioche.length === 0 && suivant.deCote.length > 0) {
    suivant = { ...suivant, pioche: suivant.deCote, deCote: [], rattrapage: true }
  }
  return { etat: suivant, juste }
}

// --- Progression -------------------------------------------------------------

export const ECHECS_POUR_DESCENDRE = 2

export type Changement = 'debloque' | 'suivant' | 'rejoue' | 'descend' | null

// Suite de la progression après une partie terminée au niveau `numero`.
export function avancerProgression(
  prog: ProgressionKlavicoeur,
  numero: number,
  reussi: boolean
): { progression: ProgressionKlavicoeur; changement: Changement } {
  if (reussi) {
    const suivant = Math.min(NIVEAU_KLAVICOEUR_MAX, numero + 1)
    const debloque = Math.max(prog.debloque, suivant)
    const changement: Changement = suivant > prog.debloque ? 'debloque' : suivant > numero ? 'suivant' : null
    return { progression: { debloque, niveau: suivant, echecs: 0 }, changement }
  }
  // Les échecs ne comptent que pour le niveau proposé ; un autre niveau repart de zéro.
  const echecs = (prog.niveau === numero ? prog.echecs : 0) + 1
  if (echecs >= ECHECS_POUR_DESCENDRE) {
    const inferieur = Math.max(1, numero - 1)
    return { progression: { debloque: prog.debloque, niveau: inferieur, echecs: 0 }, changement: inferieur < numero ? 'descend' : 'rejoue' }
  }
  return { progression: { debloque: prog.debloque, niveau: numero, echecs }, changement: 'rejoue' }
}

// Lettres les plus hésitées, de la plus fréquente à la moins fréquente.
export function lettresHesitees(parLettre: Record<string, number>): [string, number][] {
  return Object.entries(parLettre)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}
