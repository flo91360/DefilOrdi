// « Couleurs piégées » (effet Stroop) : un nom de couleur est écrit dans une
// autre couleur. Selon la consigne, l'enfant tape le mot écrit ou la couleur
// de l'encre.

import type { ModeCouleurs } from '../../../../shared/data'
import { normaliserReponse } from '../commun'

export interface Couleur {
  nom: string
  hex: string // lisible sur le fond sombre de la carte
}

// Dans l'ordre où elles s'ajoutent quand le niveau augmente.
export const COULEURS: Couleur[] = [
  { nom: 'rouge', hex: '#ff5a52' },
  { nom: 'bleu', hex: '#4f8bff' },
  { nom: 'vert', hex: '#3fcf6b' },
  { nom: 'jaune', hex: '#ffd43b' },
  { nom: 'orange', hex: '#ff922b' },
  { nom: 'violet', hex: '#b07cff' },
  { nom: 'rose', hex: '#ff7ac6' },
  { nom: 'blanc', hex: '#ffffff' }
]

export function couleursPourNiveau(niveau: number): Couleur[] {
  const n = { 1: 4, 2: 5, 3: 6, 4: 8 }[niveau] ?? 4
  return COULEURS.slice(0, n)
}

export type Consigne = 'mot' | 'couleur'

export interface Manche {
  mot: Couleur
  encre: Couleur
  consigne: Consigne
}

export function estPiege(m: Manche): boolean {
  return m.mot.nom !== m.encre.nom
}

export function reponseAttendue(m: Manche): string {
  return m.consigne === 'mot' ? m.mot.nom : m.encre.nom
}

export function estJuste(m: Manche, reponse: string): boolean {
  return normaliserReponse(reponse) === reponseAttendue(m)
}

// Environ 7 manches sur 10 sont des pièges (mot et encre différents).
// Deux manches qui se suivent ne sont jamais identiques.
export function genererManches(
  n: number,
  mode: ModeCouleurs,
  couleurs: Couleur[],
  random: () => number = Math.random
): Manche[] {
  const pickC = () => couleurs[Math.floor(random() * couleurs.length)]
  const out: Manche[] = []
  while (out.length < n) {
    const mot = pickC()
    let encre = mot
    if (random() < 0.7) {
      while (encre.nom === mot.nom) encre = pickC()
    }
    const consigne: Consigne = mode === 'melange' ? (random() < 0.5 ? 'mot' : 'couleur') : mode
    const m = { mot, encre, consigne }
    const prev = out[out.length - 1]
    if (prev && prev.mot.nom === m.mot.nom && prev.encre.nom === m.encre.nom) continue
    out.push(m)
  }
  return out
}
