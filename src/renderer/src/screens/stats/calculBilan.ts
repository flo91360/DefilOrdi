// Calcul du bilan imprimable d'un enfant : sur une période, pour chaque jeu
// joué, l'évolution de ses mesures entre le début et la fin de la période.
import type { JeuId, Medaille, Resultat } from '../../../../shared/data'
import { ORDRE_JEUX } from '../../games/jeux'
import { indicateursDu } from './parJeu'

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

export interface JeuBilan {
  jeu: JeuId
  parties: Resultat[] // dans l'ordre chronologique
  lignes: LigneBilan[]
}

export interface Bilan {
  parties: number
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

// du / au : jours AAAA-MM-JJ inclus.
export function calculerBilan(resultats: Resultat[], du: string, au: string, medailles: Medaille[] = []): Bilan {
  const dansPeriode = (date: string) => {
    const j = jourLocal(date)
    return j >= du && j <= au
  }
  const periode = resultats.filter((r) => dansPeriode(r.date)).sort((a, b) => a.date.localeCompare(b.date))
  const jeux = ORDRE_JEUX.map((jeu): JeuBilan => {
    const parties = periode.filter((r) => r.jeu === jeu)
    const lignes = indicateursDu(jeu).map((ind): LigneBilan => {
      const valeurs = parties.map(ind.valeur)
      const n = Math.min(PARTIES_MOYENNE, Math.floor(valeurs.length / 2))
      const debut = arrondir(moyenne(valeurs.slice(0, Math.max(1, n))), ind.unite)
      const fin = arrondir(moyenne(valeurs.slice(-Math.max(1, n))), ind.unite)
      const meilleur = valeurs.length === 0 ? 0 : arrondir(ind.plusPetitMieux ? Math.min(...valeurs) : Math.max(...valeurs), ind.unite)
      const progres = n === 0 || debut === fin ? null : ind.plusPetitMieux ? fin < debut : fin > debut
      return { nom: ind.nom, unite: ind.unite, debut, fin, meilleur, progres }
    })
    return { jeu, parties, lignes }
  }).filter((j) => j.parties.length > 0)
  return {
    parties: periode.length,
    jours: new Set(periode.map((r) => jourLocal(r.date))).size,
    dureeMs: periode.reduce((t, r) => t + r.dureeMs, 0),
    jeux,
    medailles: medailles.filter((m) => dansPeriode(m.date)).length
  }
}
