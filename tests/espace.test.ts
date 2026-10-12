import { describe, expect, it } from 'vitest'
import { avancer, cadence, type Etat, nouvelEtat, type Reglages, SERIES, tirer } from '../src/renderer/src/games/espace/engine'

const reglages = (serieId = 'milieu', niveau = 1, dureeS = 60): Reglages => ({
  serie: SERIES.find((s) => s.id === serieId)!,
  niveau,
  dureeS
})

function jouer(e: Etat, r: Reglages, secondes: number): Etat {
  let etat = e
  for (let t = 0; t < secondes; t += 0.05) etat = avancer(etat, 0.05, r).etat
  return etat
}

describe('Chasse aux lettres (moteur)', () => {
  it('fait apparaître des lettres de la série, différentes entre elles', () => {
    const r = reglages()
    const e = jouer(nouvelEtat(), r, 6)
    expect(e.lettres.length).toBeGreaterThan(1)
    expect(e.lettres.every((l) => r.serie.lettres.includes(l.char))).toBe(true)
    expect(new Set(e.lettres.map((l) => l.char)).size).toBe(e.lettres.length)
  })

  it('compte les lettres qui touchent le sol', () => {
    const r = reglages()
    const e = jouer(nouvelEtat(), r, 25)
    expect(e.manquees).toBeGreaterThan(0)
    expect(Object.values(e.lettresRatees).reduce((a, b) => a + b, 0)).toBe(e.manquees)
  })

  it('détruit la lettre la plus basse qui correspond', () => {
    const r = reglages()
    const e: Etat = {
      ...nouvelEtat(),
      lettres: [
        { id: 1, char: 'q', x: 0.2, y: 0.3, vitesse: 0.1 },
        { id: 2, char: 'q', x: 0.6, y: 0.7, vitesse: 0.1 },
        { id: 3, char: 's', x: 0.4, y: 0.9, vitesse: 0.1 }
      ]
    }
    const { etat, evenement } = tirer(e, 'Q', r)
    expect(evenement).toMatchObject({ type: 'detruite', lettre: { id: 2 } })
    expect(etat.lettres.map((l) => l.id)).toEqual([1, 3])
    expect(etat.detruites).toBe(1)

    const raté = tirer(etat, 'm', r)
    expect(raté.evenement).toEqual({ type: 'erreur', touche: 'm' })
    expect(raté.etat.erreurs).toBe(1)
    expect(raté.etat.lettresRatees).toEqual({ s: 1 })

    expect(tirer(nouvelEtat(), 'q', r).evenement).toBeNull()
  })

  it('respecte les majuscules dans la série Majuscules', () => {
    const r = reglages('majuscules', 4)
    const e: Etat = { ...nouvelEtat(), lettres: [{ id: 1, char: 'A', x: 0.5, y: 0.5, vitesse: 0.1 }] }
    expect(tirer(e, 'a', r).evenement?.type).toBe('erreur')
    expect(tirer(e, 'A', r).evenement?.type).toBe('detruite')
  })

  it('s’arrête à la fin du temps', () => {
    const r = reglages('milieu', 1, 10)
    const e = jouer(nouvelEtat(), r, 15)
    expect(e.temps).toBe(10)
    expect(cadence(30, 60000)).toBe(30)
  })
})
