// Seuils des smileys du jeu Dactylo (score de chaque phrase).
//
// Toutes les valeurs sont réunies ici pour pouvoir les changer facilement
// si des études plus récentes ou plus adaptées sont trouvées.
// Testé dans tests/engine.test.ts.

import type { Classe } from '../../../../shared/data'

export interface SeuilsVitesse {
  rouge: number // en dessous : smiley rouge
  vert: number // en dessous : smiley orange ; à partir de là : vert
  etoile: number // à partir de là : étoile (grande réussite)
}

export const SEUILS_DACTYLO: {
  vitesse: Record<Classe, SeuilsVitesse> // frappes par minute, selon la classe
  precision: { rouge: number; orange: number; vert: number } // pourcentages, toutes classes
} = {
  vitesse: {
    CP: { rouge: 1, vert: 2.4, etoile: 9.78 },
    CE1: { rouge: 3, vert: 12.5, etoile: 23.66 },
    CE2: { rouge: 7, vert: 12.4, etoile: 34.1 },
    CM1: { rouge: 10.8, vert: 27.8, etoile: 44.9 },
    CM2: { rouge: 17, vert: 24.4, etoile: 57.2 },
    '6ème': { rouge: 31.2, vert: 48.6, etoile: 66 },
    '5ème': { rouge: 34, vert: 54, etoile: 74.2 },
    '4ème': { rouge: 32.2, vert: 56.6, etoile: 81.4 },
    '3ème': { rouge: 41.6, vert: 64, etoile: 86 },
    '2nde': { rouge: 60, vert: 95, etoile: 110 },
    '1ère': { rouge: 70, vert: 100, etoile: 120 },
    Terminale: { rouge: 75, vert: 110, etoile: 130 }
  },
  // Précision : moins de 65 % rouge, moins de 75 % orange, moins de 90 % vert,
  // 90 % ou plus étoile.
  precision: { rouge: 65, orange: 75, vert: 90 }
}

export type Smiley = 'rouge' | 'orange' | 'vert' | 'etoile'

export function smileyVitesse(frappesParMinute: number, classe: Classe): Smiley {
  const s = SEUILS_DACTYLO.vitesse[classe]
  if (frappesParMinute < s.rouge) return 'rouge'
  if (frappesParMinute < s.vert) return 'orange'
  if (frappesParMinute < s.etoile) return 'vert'
  return 'etoile'
}

export function smileyPrecision(pourcentage: number): Smiley {
  const s = SEUILS_DACTYLO.precision
  if (pourcentage < s.rouge) return 'rouge'
  if (pourcentage < s.orange) return 'orange'
  if (pourcentage < s.vert) return 'vert'
  return 'etoile'
}

// Texte d'accompagnement : le smiley rouge reste encourageant.
export const TEXTES_SMILEY: Record<Smiley, string> = {
  rouge: 'Continue, tu vas y arriver !',
  orange: 'Tu t’approches !',
  vert: 'Très bien !',
  etoile: 'Grande réussite !'
}
