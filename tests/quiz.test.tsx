import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { melangerChoix, questionsDisponibles, tirerQuestions } from '../src/renderer/src/games/quiz/engine'
import { QUESTIONS } from '../src/renderer/src/games/quiz/questions'
import { THEMES } from '../src/renderer/src/games/quiz/types'
import { Ecran, ICONES } from '../src/renderer/src/games/quiz/visuels'

function zones(scene: Parameters<typeof Ecran>[0]['scene'], menu: string | null): Set<string> {
  const html = renderToStaticMarkup(<Ecran scene={scene} menu={menu} />)
  return new Set([...html.matchAll(/data-zone="([^"]+)"/g)].map((m) => m[1]))
}

describe('banque de questions', () => {
  it('a des identifiants uniques et des niveaux valides', () => {
    const ids = QUESTIONS.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(QUESTIONS.every((q) => q.niveau >= 1 && q.niveau <= 4)).toBe(true)
  })

  it('propose au moins 10 questions pour chaque niveau', () => {
    for (const n of [1, 2, 3, 4]) expect(questionsDisponibles(n, 'tout').length).toBeGreaterThanOrEqual(10)
    for (const t of THEMES) expect(questionsDisponibles(4, t.id).length).toBeGreaterThanOrEqual(8)
  })

  it('chaque visuel existe', () => {
    for (const q of QUESTIONS) {
      if (!q.visuel) continue
      if ('icone' in q.visuel) expect(ICONES[q.visuel.icone], q.id).toBeDefined()
      else expect(zones(q.visuel.scene, q.visuel.menu ?? null).has(q.visuel.surligne), q.id).toBe(true)
    }
  })

  it('chaque étape des mises en situation correspond à une zone visible', () => {
    for (const q of QUESTIONS) {
      if (q.type !== 'situation') continue
      let menu: string | null = q.menuDepart ?? null
      for (const e of q.etapes) {
        const visibles = zones(q.scene, menu)
        for (const c of e.cibles) expect(visibles.has(c), `${q.id} : ${c}`).toBe(true)
        menu = e.ouvre ?? menu
      }
    }
  })
})

describe('tirage', () => {
  it('tire le nombre demandé, sans doublon', () => {
    const qs = tirerQuestions(2, 'tout', 10)
    expect(qs).toHaveLength(10)
    expect(new Set(qs.map((q) => q.id)).size).toBe(10)
    expect(qs.every((q) => q.niveau <= 3)).toBe(true)
  })

  it('mélange les réponses en suivant la bonne', () => {
    const q = QUESTIONS.find((x) => x.type === 'choix')
    if (q?.type !== 'choix') throw new Error()
    for (let i = 0; i < 20; i++) {
      const m = melangerChoix(q)
      expect(m.textes[m.bonne]).toBe(q.choix[q.bonne])
      expect(new Set(m.textes).size).toBe(4)
    }
  })
})
