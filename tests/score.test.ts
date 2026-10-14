import { describe, expect, it } from 'vitest'
import { CLASSES } from '../src/shared/data'
import { moyennesParJour, nouvellePhrase, scorePhrase, taper, type Regles } from '../src/renderer/src/games/dactylo/engine'
import { SEUILS_DACTYLO, smileyPrecision, smileyVitesse } from '../src/renderer/src/games/dactylo/seuils'

const strict: Regles = { accents: true, majuscules: true, bloquer: true }

describe('smiley de vitesse', () => {
  it('suit l’exemple du CE2 : 6 rouge, 9 orange, 24 vert, 40 étoile', () => {
    expect([6, 9, 24, 40].map((v) => smileyVitesse(v, 'CE2'))).toEqual(['rouge', 'orange', 'vert', 'etoile'])
  })

  it('applique les bornes : strictement en dessous du rouge, étoile dès la valeur étoile', () => {
    expect(smileyVitesse(7, 'CE2')).toBe('orange')
    expect(smileyVitesse(12.4, 'CE2')).toBe('vert')
    expect(smileyVitesse(34.1, 'CE2')).toBe('etoile')
    expect(smileyVitesse(34, 'CE2')).toBe('vert')
  })

  it('dépend de la classe', () => {
    expect(smileyVitesse(50, 'CP')).toBe('etoile')
    expect(smileyVitesse(50, 'Terminale')).toBe('rouge')
  })

  it('a des seuils croissants pour chaque classe', () => {
    for (const c of CLASSES) {
      const s = SEUILS_DACTYLO.vitesse[c]
      expect(s.rouge).toBeLessThan(s.vert)
      expect(s.vert).toBeLessThan(s.etoile)
    }
  })
})

describe('smiley de précision', () => {
  it('donne 64 % rouge, 74 % orange, 89 % vert, 90 % étoile', () => {
    expect([64, 74, 89, 90].map(smileyPrecision)).toEqual(['rouge', 'orange', 'vert', 'etoile'])
    expect([65, 75, 100].map(smileyPrecision)).toEqual(['orange', 'vert', 'etoile'])
  })
})

describe('score d’une phrase', () => {
  it('utilise les règles de comptage de la partie', () => {
    let e = nouvellePhrase('abcd')
    // 5 frappes dont 1 erreur, de 0 à 10 s : 4 frappes justes en 10 s = 24/min.
    for (const [c, t] of [['a', 0], ['x', 2000], ['b', 4000], ['c', 6000], ['d', 10000]] as const) {
      e = taper(e, c, t, strict).etat
    }
    expect(scorePhrase(e, 99999)).toEqual({ vitesse: 24, precision: 80 })
  })
})

describe('moyennes par jour', () => {
  it('regroupe les parties d’un même jour et les classe dans l’ordre', () => {
    const jour = (j: number, h: number) => new Date(2026, 1, j, h).toISOString()
    const m = moyennesParJour([
      { date: jour(4, 9), dureeMs: 60000, frappes: 30, erreurs: 0 },
      { date: jour(3, 10), dureeMs: 60000, frappes: 20, erreurs: 2 },
      { date: jour(3, 15), dureeMs: 60000, frappes: 20, erreurs: 2 }
    ])
    expect(m).toEqual([
      { jour: '2026-02-03', parties: 2, vitesse: 18, precision: 90 },
      { jour: '2026-02-04', parties: 1, vitesse: 30, precision: 100 }
    ])
  })
})
