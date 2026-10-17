import { describe, expect, it } from 'vitest'
import { avancer, cadence, estTerminee, type Etat, type Lettre, mesureRecord, nouvelEtat, simultanees, type Reglages, SERIES, tirer } from '../src/renderer/src/games/espace/engine'

const reglages = (serieId = 'milieu', niveau = 1, dureeS = 60, mode: Reglages['mode'] = 'chrono'): Reglages => ({
  serie: SERIES.find((s) => s.id === serieId)!,
  niveau,
  dureeS,
  mode
})

const lettre = (id: number, char: string, extra: Partial<Lettre> = {}): Lettre => ({ id, char, x: 0.2 + id * 0.1, y: 0.4, vitesse: 0.01, ...extra })

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

  it('propose les niveaux 5, 6 et 7 avec les lettres décrites', () => {
    const lettres = (id: string) => SERIES.find((x) => x.id === id)!.lettres
    expect(SERIES.find((x) => x.id === 'mixte')!.niveau).toBe(5)
    expect([...'aqzAQZ'].every((c) => lettres('mixte').includes(c))).toBe(true)
    expect(lettres('mixte')).toHaveLength(52)
    expect(SERIES.find((x) => x.id === 'majuscules-accents')!.niveau).toBe(6)
    expect(lettres('majuscules-accents')).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZéèàçù')
    expect(SERIES.find((x) => x.id === 'melange')!.niveau).toBe(7)
    expect(lettres('melange')).toHaveLength(57)
    expect(lettres('melange')).toContain('é')
    expect(lettres('melange')).toContain('a')
    expect(lettres('melange')).toContain('A')
  })

  describe('paliers', () => {
    const reussir = (e: Etat, r: Reglages, n: number) => {
      let etat = e
      for (let i = 0; i < n; i++) {
        etat = { ...etat, lettres: [lettre(100 + i, 'q')] }
        etat = tirer(etat, 'q', r).etat
      }
      return etat
    }

    it('8 réussites : plus vite ; 8 autres : deux lettres en même temps', () => {
      const r = reglages('milieu', 1, 600)
      let e = reussir(nouvelEtat(), r, 7)
      expect(e.palier).toBe(0)
      e = reussir(e, r, 1)
      expect(e.palier).toBe(1)
      expect(simultanees(e.palier)).toBe(1)
      const lent = avancer({ ...nouvelEtat(), prochaine: 0 }, 0.05, r).etat.lettres[0].vitesse
      const rapide = avancer({ ...nouvelEtat(), palier: 1, prochaine: 0 }, 0.05, r).etat.lettres[0].vitesse
      expect(rapide).toBeGreaterThan(lent)
      e = reussir(e, r, 8)
      expect(e.palier).toBe(2)
      const deux = avancer({ ...e, lettres: [], prochaine: 0 }, 0.05, r).etat
      expect(deux.lettres).toHaveLength(2)
      expect(deux.lettres[0].char).not.toBe(deux.lettres[1].char)
    })

    it('une erreur repart la série à zéro sans retirer le palier', () => {
      const r = reglages('milieu', 1, 600)
      let e = reussir(nouvelEtat(), r, 5)
      e = tirer({ ...e, lettres: [lettre(1, 'q')] }, 'm', r).etat
      expect(e.serieReussie).toBe(0)
      e = reussir(e, r, 7)
      expect(e.palier).toBe(0)
      e = reussir(e, r, 1)
      expect(e.palier).toBe(1)
    })

    it('en chrono, le palier s’arrête à deux lettres en même temps', () => {
      const r = reglages('milieu', 1, 600)
      expect(reussir(nouvelEtat(), r, 40).palier).toBe(2)
      expect(reussir(nouvelEtat(), reglages('milieu', 1, 0, 'vies'), 40).palier).toBe(5)
    })
  })

  describe('mode 3 vies', () => {
    const r = reglages('milieu', 1, 0, 'vies')

    it('commence avec 3 vies, sans fin tant qu’il en reste', () => {
      const e = jouer(nouvelEtat(), reglages('milieu', 1, 0, 'vies'), 5)
      expect(nouvelEtat().vies).toBe(3)
      expect(e.temps).toBeGreaterThan(4)
    })

    it('une faute retire une vie', () => {
      const e = tirer({ ...nouvelEtat(), lettres: [lettre(1, 'q')] }, 'm', r).etat
      expect(e.vies).toBe(2)
    })

    it('une lettre tombée retire une vie, et la partie finit à zéro vie', () => {
      let e: Etat = { ...nouvelEtat(), prochaine: 999, lettres: [lettre(1, 'q', { y: 0.99, vitesse: 1 })] }
      e = avancer(e, 0.1, r).etat
      expect(e.vies).toBe(2)
      expect(e.manquees).toBe(1)
      expect(estTerminee(e, r)).toBe(false)
      e = { ...e, vies: 1, lettres: [lettre(2, 's', { y: 0.99, vitesse: 1 })] }
      e = avancer(e, 0.1, r).etat
      expect(e.vies).toBe(0)
      expect(estTerminee(e, r)).toBe(true)
      const apres = avancer(e, 1, r)
      expect(apres.etat).toBe(e)
    })

    it('ne donne ni piège ni cadeau', () => {
      const e = jouer(nouvelEtat(), r, 30)
      expect(e.lettres.every((l) => !l.type)).toBe(true)
    })
  })

  describe('mode Pièges et cadeaux', () => {
    const r = reglages('milieu', 1, 0, 'pieges')

    it('fait apparaître des pièges et des cadeaux', () => {
      let e: Etat = { ...nouvelEtat(), vies: 2 }
      const vus = new Set<string>()
      for (let t = 0; t < 400 && e.vies > 0; t += 0.05) {
        e = avancer({ ...e, vies: 2 }, 0.05, r).etat
        e.lettres.forEach((l) => l.type && vus.add(l.type))
      }
      expect(vus).toEqual(new Set(['piege', 'cadeau']))
    })

    it('taper un piège retire une vie, le laisser tomber ne coûte rien', () => {
      let e: Etat = { ...nouvelEtat(), prochaine: 999, lettres: [lettre(1, 'q', { type: 'piege' }), lettre(2, 's')] }
      const tape = tirer(e, 'q', r)
      expect(tape.evenement).toMatchObject({ type: 'piege' })
      expect(tape.etat.vies).toBe(2)
      expect(tape.etat.pieges).toBe(1)
      expect(tape.etat.erreurs).toBe(0)
      e = { ...e, lettres: [lettre(1, 'q', { type: 'piege', y: 0.99, vitesse: 1 })] }
      const tombe = avancer(e, 0.1, r)
      expect(tombe.etat.vies).toBe(3)
      expect(tombe.etat.manquees).toBe(0)
      expect(tombe.evenements[0].type).toBe('passe')
    })

    it('taper un cadeau rend une vie, jusqu’à 5 au plus', () => {
      const e: Etat = { ...nouvelEtat(), vies: 2, lettres: [lettre(1, 'q', { type: 'cadeau' })] }
      const pris = tirer(e, 'q', r)
      expect(pris.etat.vies).toBe(3)
      expect(pris.etat.cadeaux).toBe(1)
      const plein = tirer({ ...e, vies: 5 }, 'q', r)
      expect(plein.etat.vies).toBe(5)
    })

    it('préfère la vraie lettre au piège quand elles se ressemblent', () => {
      const e: Etat = { ...nouvelEtat(), lettres: [lettre(1, 'q', { type: 'piege', y: 0.9 }), lettre(2, 'q', { y: 0.2 })] }
      expect(tirer(e, 'q', r).evenement).toMatchObject({ type: 'detruite', lettre: { id: 2 } })
    })
  })

  it('les records se mesurent par minute en chrono et en lettres attrapées sinon', () => {
    expect(mesureRecord('chrono', 30, 60000)).toBe(30)
    expect(mesureRecord('vies', 30, 90000)).toBe(30)
  })
})
