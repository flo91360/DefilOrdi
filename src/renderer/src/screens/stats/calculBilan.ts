// Calcul du bilan imprimable d'un enfant : sur une période, pour chaque jeu
// joué, l'évolution de ses mesures entre le début et la fin de la période.
// Seules les parties terminées d'un même groupe (même mode, même liste, même
// palier…) sont comparées : sinon un changement de difficulté passerait pour
// un progrès ou un recul.
import type { JeuId, Medaille, Resultat } from '../../../../shared/data'
import { ORDRE_JEUX } from '../../games/jeux'
import { groupeDu, indicateursDu } from './parJeu'

// Parties prises pour le « début » et la « fin » de la période : une seule
// partie dit peu de chose, la moyenne de quelques-unes est plus fiable.
export const PARTIES_MOYENNE = 3

export interface LigneBilan {
  nom: string
  unite: string
  debut: number
  fin: number
  meilleur: number
  progres: boolean | null // null : pas assez de parties, ou pas de changement
}

export interface GroupeBilan {
  nom: string // ex. « 3 vies · Rangée du milieu »
  parties: Resultat[] // parties terminées, dans l'ordre chronologique
  lignes: LigneBilan[]
}

export interface JeuBilan {
  jeu: JeuId
  parties: Resultat[] // parties terminées, dans l'ordre chronologique
  arretees: number // parties arrêtées avant la fin, non comptées dans les mesures
  groupes: GroupeBilan[] // dans l'ordre de leur première partie
}

export interface Bilan {
  parties: number // toutes les parties de la période, arrêtées comprises
  arretees: number
  jours: number // jours d'utilisation
  dureeMs: number
  jeux: JeuBilan[]
  medailles: number
}

// AAAA-MM-JJ à l'heure locale du PC.
export function jourLocal(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function moyenne(valeurs: number[]): number {
  return valeurs.length === 0 ? 0 : valeurs.reduce((a, b) => a + b, 0) / valeurs.length
}

// Arrondi lisible : une décimale pour les secondes, entier sinon.
export function arrondir(v: number, unite: string): number {
  return unite === 's' ? Math.round(v * 10) / 10 : Math.round(v)
}

function lignesDe(jeu: JeuId, parties: Resultat[]): LigneBilan[] {
  return indicateursDu(jeu).map((ind): LigneBilan => {
    const valeurs = parties.map(ind.valeur)
    const n = Math.min(PARTIES_MOYENNE, Math.floor(valeurs.length / 2))
    const debut = arrondir(moyenne(valeurs.slice(0, Math.max(1, n))), ind.unite)
    const fin = arrondir(moyenne(valeurs.slice(-Math.max(1, n))), ind.unite)
    const meilleur = valeurs.length === 0 ? 0 : arrondir(ind.plusPetitMieux ? Math.min(...valeurs) : Math.max(...valeurs), ind.unite)
    const progres = n === 0 || debut === fin ? null : ind.plusPetitMieux ? fin < debut : fin > debut
    return { nom: ind.nom, unite: ind.unite, debut, fin, meilleur, progres }
  })
}

// du / au : jours AAAA-MM-JJ inclus.
export function calculerBilan(resultats: Resultat[], du: string, au: string, medailles: Medaille[] = []): Bilan {
  const dansPeriode = (date: string) => {
    const j = jourLocal(date)
    return j >= du && j <= au
  }
  const periode = resultats.filter((r) => dansPeriode(r.date)).sort((a, b) => a.date.localeCompare(b.date))
  const jeux = ORDRE_JEUX.map((jeu): JeuBilan => {
    const duJeu = periode.filter((r) => r.jeu === jeu)
    const parties = duJeu.filter((r) => r.complete)
    const groupe = groupeDu(jeu)
    const parGroupe = new Map<string, Resultat[]>()
    for (const r of parties) parGroupe.set(groupe(r), [...(parGroupe.get(groupe(r)) ?? []), r])
    const groupes = [...parGroupe.entries()].map(([nom, ps]): GroupeBilan => ({ nom, parties: ps, lignes: lignesDe(jeu, ps) }))
    return { jeu, parties, arretees: duJeu.length - parties.length, groupes }
  }).filter((j) => j.parties.length + j.arretees > 0)
  return {
    parties: periode.length,
    arretees: periode.filter((r) => !r.complete).length,
    jours: new Set(periode.map((r) => jourLocal(r.date))).size,
    dureeMs: periode.reduce((t, r) => t + r.dureeMs, 0),
    jeux,
    medailles: medailles.filter((m) => dansPeriode(m.date)).length
  }
}
