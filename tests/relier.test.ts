import { describe, expect, it } from 'vitest'
import { QUESTIONS } from '../src/renderer/src/games/quiz/questions'
import { tirerPartie } from '../src/renderer/src/games/quiz/engine'
import { ACTIONS_RELIER, LOGICIELS, NB_ACTIONS_RELIER, tirerRelier, verifierRelier, type Liaisons } from '../src/renderer/src/games/quiz/relier'

describe('Points reliés', () => {
  it('a 9 logiciels et plus de 10 actions, chacune vers un logiciel connu', () => {
    expect(LOGICIELS).toHaveLength(9)
    expect(ACTIONS_RELIER.length).toBeGreaterThan(NB_ACTIONS_RELIER)
    expect(new Set(ACTIONS_RELIER.map((a) => a.id)).size).toBe(ACTIONS_RELIER.length)
    const ids = new Set(LOGICIELS.map((l) => l.id))
    expect(ACTIONS_RELIER.every((a) => ids.has(a.logiciel))).toBe(true)
  })

  it('tire 10 actions différentes, qui varient d’une partie à l’autre', () => {
    const a = tirerRelier()
    expect(new Set(a.actions.map((x) => x.id)).size).toBe(10)
    const parties = new Set(Array.from({ length: 20 }, () => tirerRelier().actions.map((x) => x.id).join()))
    expect(parties.size).toBeGreaterThan(1)
  })

  it('ne vérifie qu’une fois les 10 liaisons faites ; réussi seulement à 10 sur 10', () => {
    const q = tirerRelier()
    const l: Liaisons = {}
    q.actions.slice(0, 9).forEach((a) => (l[a.id] = a.logiciel))
    expect(verifierRelier(q, l).juste).toBe(false)
    q.actions.forEach((a) => (l[a.id] = a.logiciel))
    expect(verifierRelier(q, l).juste).toBe(true)
    const faux = q.actions[0]
    l[faux.id] = LOGICIELS.find((x) => x.id !== faux.logiciel)!.id
    const v = verifierRelier(q, l)
    expect(v.juste).toBe(false)
    expect(v.fausses).toHaveLength(1)
  })

  it('apparaît au plus une fois avec « Tout mélanger », et seul avec son thème', () => {
    for (let i = 0; i < 200; i++) {
      const p = tirerPartie(QUESTIONS, 4, 'tout', 10)
      expect(p).toHaveLength(10)
      expect(p.filter((q) => q.type === 'relier').length).toBeLessThanOrEqual(1)
    }
    expect(Array.from({ length: 300 }, () => tirerPartie(QUESTIONS, 4, 'tout', 10)).some((p) => p.some((q) => q.type === 'relier'))).toBe(true)
    expect(tirerPartie(QUESTIONS, 4, 'materiel', 10).some((q) => q.type === 'relier')).toBe(false)
    const seul = tirerPartie(QUESTIONS, 4, 'relier', 10)
    expect(seul).toHaveLength(1)
    expect(seul[0].type).toBe('relier')
  })
})
