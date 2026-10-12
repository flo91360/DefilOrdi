// « Mots à retenir » : l'enfant regarde une liste de mots, puis la retape de
// tête, dans l'ordre qu'il veut.

import { melanger, normaliserReponse } from '../commun'

export function nombreParNiveau(niveau: number): number {
  return { 1: 3, 2: 4, 3: 5, 4: 6 }[niveau] ?? 4
}

// Temps pour mémoriser : 2,5 s par mot, plus 2 s.
export function dureeMemorisation(nbMots: number): number {
  return nbMots * 2500 + 2000
}

export function choisirMots(liste: string[], n: number, random: () => number = Math.random): string[] {
  const uniques = [...new Map(liste.map((m) => [normaliserReponse(m), m.trim()])).values()].filter((m) => m !== '')
  return melanger(uniques, random).slice(0, n)
}

export type Proposition = { type: 'trouve'; index: number } | { type: 'deja'; index: number } | { type: 'absent' } | { type: 'vide' }

// Accents et majuscules ne comptent pas : on évalue la mémoire, pas
// l'orthographe (le mot s'affiche ensuite correctement écrit).
export function proposer(mots: string[], trouves: boolean[], saisie: string): Proposition {
  const r = normaliserReponse(saisie)
  if (r === '') return { type: 'vide' }
  const index = mots.findIndex((m) => normaliserReponse(m) === r)
  if (index === -1) return { type: 'absent' }
  return trouves[index] ? { type: 'deja', index } : { type: 'trouve', index }
}
