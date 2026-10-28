import { describe, expect, it } from 'vitest'
import { geste } from '../src/renderer/src/keyboard/azerty'
import { vitesseObjetOcean } from '../src/renderer/src/games/espace/scenes/Ocean'
import {
  avancer,
  cadence,
  estMajuscule,
  estTerminee,
  type Etat,
  type Lettre,
  mesureRecord,
  nouvelEtat,
  simultanees,
  type Reglages,
  SERIES,
  tirer,
  vitesseDeDepart
} from '../src/renderer/src/games/espace/engine'
import { newProfile, type ResultatEspace, VITESSE_CHASSE_DEPART, VITESSE_CHASSE_MAX, VITESSE_CHASSE_MIN } from '../src/shared/data'

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

describe('Plongée sous-marine : vitesses', () => {
  it('les poissons montent plus vite que les autres objets', () => {
    const r = { ...reglages(), vitesseObjet: vitesseObjetOcean }
    const e = jouer(nouvelEtat(), r, 9)
    const vit = new Map(e.lettres.map((l) => [l.id, l.vitesse]))
    const poissons = [...vit].filter(([id]) => vitesseObjetOcean(id) > 1).map(([, v]) => v)
    const autres = [...vit].filter(([id]) => vitesseObjetOcean(id) === 1).map(([, v]) => v)
    expect(vit.size).toBeGreaterThan(0)
    for (const p of poissons) for (const a of autres) expect(p).toBeGreaterThan(a)
  })
})

describe('Chasse aux lettres (moteur)', () => {
  it('fait apparaître des lettres de la série, différentes entre elles', () => {
    const r = reglages()
    const e = jouer(nouvelEtat(1.5), r, 6)
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
        e = avancer({ ...e, vies: 2, vitesse: 2 }, 0.05, r).etat
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

  describe('vitesse adaptative', () => {
    // Joue `secondes` en attrapant chaque lettre dès qu'elle atteint la position `y`.
    function jouerEnTapant(e: Etat, r: Reglages, secondes: number, y: number): Etat {
      let etat = e
      for (let t = 0; t < secondes; t += 0.05) {
        etat = avancer(etat, 0.05, r).etat
        for (const l of etat.lettres) if (l.y >= y) etat = tirer(etat, l.char, r).etat
      }
      return etat
    }

    it('au premier départ, les lettres arrivent une par une, bien plus lentement qu’avant', () => {
      const r = reglages('milieu', 1, 120)
      let e = nouvelEtat()
      expect(e.vitesse).toBe(VITESSE_CHASSE_DEPART)
      let maxALEcran = 0
      for (let t = 0; t < 60; t += 0.05) {
        e = avancer(e, 0.05, r).etat
        maxALEcran = Math.max(maxALEcran, e.lettres.length)
      }
      expect(maxALEcran).toBe(1)
      // L'ancien niveau 1 faisait tomber une lettre en 10 s ; désormais bien plus.
      const premiere = avancer({ ...nouvelEtat(), prochaine: 0 }, 0.05, r).etat.lettres[0]
      expect(1 / premiere.vitesse).toBeGreaterThan(15)
    })

    it('la suivante arrive peu après qu’une lettre a été attrapée', () => {
      const r = reglages('milieu', 1, 120)
      const e = jouerEnTapant(nouvelEtat(), r, 30, 0.1)
      expect(e.detruites).toBeGreaterThan(10)
    })

    it('un enfant rapide accélère, un enfant lent reste lent', () => {
      const r = reglages('milieu', 1, 120)
      const rapide = jouerEnTapant(nouvelEtat(), r, 60, 0.15)
      expect(rapide.vitesse).toBeGreaterThan(1)
      const lent = jouerEnTapant(nouvelEtat(), r, 60, 0.75)
      expect(lent.vitesse).toBeLessThanOrEqual(VITESSE_CHASSE_DEPART)
      const absent = jouer(nouvelEtat(), r, 60)
      expect(absent.vitesse).toBe(VITESSE_CHASSE_MIN)
    })

    it('au-delà du rythme doux, plusieurs lettres peuvent être à l’écran', () => {
      const e = jouer(nouvelEtat(2), reglages('milieu', 1, 120), 6)
      expect(e.lettres.length).toBeGreaterThan(1)
    })

    it('la vitesse reste bornée', () => {
      expect(nouvelEtat(99).vitesse).toBe(VITESSE_CHASSE_MAX)
      expect(nouvelEtat(0).vitesse).toBe(VITESSE_CHASSE_MIN)
      const e = jouerEnTapant(nouvelEtat(), reglages('milieu', 1, 600, 'vies'), 600, 0.02)
      expect(e.vitesse).toBeLessThanOrEqual(VITESSE_CHASSE_MAX)
    })

    describe('vitesse de départ', () => {
      const profil = { ...newProfile('p1', '2026-01-01T00:00:00.000Z', 'CM2'), prenom: 'Léa' }
      const partie = (date: string, detruites: number, complete = true, extra: Partial<ResultatEspace> = {}): ResultatEspace => ({
        id: date,
        profileId: 'p1',
        jeu: 'espace',
        date,
        complete,
        theme: 'espace',
        serieNom: 'Rangée du milieu',
        dureeMs: 60000,
        detruites,
        manquees: 0,
        erreurs: 0,
        mode: 'chrono',
        pieges: 0,
        cadeaux: 0,
        palier: 0,
        lettresRatees: {},
        ...extra
      })

      it('nouveau profil : vitesse douce', () => {
        expect(vitesseDeDepart(profil, [])).toBe(VITESSE_CHASSE_DEPART)
      })

      it('reprend la vitesse mémorisée, quelles que soient les parties', () => {
        expect(vitesseDeDepart({ ...profil, vitesseChasse: 1.3 }, [partie('2026-02-01', 5)])).toBe(1.3)
      })

      it('sans vitesse mémorisée, la déduit de la dernière partie terminée de l’enfant', () => {
        const resultats = [
          partie('2026-02-01', 40),
          partie('2026-02-03', 20),
          partie('2026-02-04', 50, false),
          partie('2026-02-05', 50, true, { profileId: 'autre' })
        ]
        expect(vitesseDeDepart(profil, resultats)).toBeCloseTo(0.8)
        expect(vitesseDeDepart(profil, [partie('2026-02-01', 2)])).toBe(VITESSE_CHASSE_MIN)
      })
    })
  })

  it('les records se mesurent par minute en chrono et en lettres attrapées sinon', () => {
    expect(mesureRecord('chrono', 30, 60000)).toBe(30)
    expect(mesureRecord('vies', 30, 90000)).toBe(30)
  })
})

describe('repère des majuscules', () => {
  it('ne concerne que les majuscules', () => {
    for (const c of 'AZERTYUIOPQSDFGHJKLMWXCVBNÉÀ') expect(estMajuscule(c)).toBe(true)
    for (const c of 'azertyuiopqsdfghjklmwxcvbnéèàçù1-') expect(estMajuscule(c)).toBe(false)
  })

  it('aucune lettre des séries de minuscules ne porte le repère', () => {
    for (const s of SERIES.filter((x) => !x.majuscules)) expect([...s.lettres].some(estMajuscule)).toBe(false)
    expect([...SERIES.find((x) => x.id === 'majuscules')!.lettres].every(estMajuscule)).toBe(true)
  })

  it('le clavier à l’écran met en évidence Maj avec la lettre d’une majuscule', () => {
    for (const c of SERIES.find((x) => x.id === 'majuscules')!.lettres) {
      const cibles = geste(c)!.etapes[0]
      expect(cibles).toContain(c.toLowerCase())
      expect(cibles.some((k) => k.startsWith('maj'))).toBe(true)
    }
    expect(geste('a')!.etapes[0]).toEqual(['a'])
  })
})
