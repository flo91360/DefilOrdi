import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { construireBanque, melangerChoix, questionsDisponibles, tirerQuestions } from '../src/renderer/src/games/quiz/engine'
import { MENU_FOND, MENU_FOND_NOUVEAU, NOUVEAU_DOSSIER_FOND, NOUVEAUX_FICHIERS_FOND, NOUVEAUX_TYPES } from '../src/renderer/src/games/quiz/nouveau'
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
    for (const n of [1, 2, 3, 4]) expect(questionsDisponibles(QUESTIONS, n, 'tout').length).toBeGreaterThanOrEqual(10)
    for (const t of THEMES) expect(questionsDisponibles(QUESTIONS, 4, t.id).length).toBeGreaterThanOrEqual(8)
  })

  it('chaque visuel existe', () => {
    for (const q of QUESTIONS) {
      if (!q.visuel) continue
      if ('icone' in q.visuel) expect(ICONES[q.visuel.icone], q.id).toBeDefined()
      else expect(zones(q.visuel.scene, q.visuel.menu ?? null).has(q.visuel.surligne), q.id).toBe(true)
    }
  })

  it('chaque étape des mises en situation correspond à une zone visible', () => {
    // Explore tous les chemins possibles (clic gauche ou clic droit) : chaque
    // cible doit être visible dans au moins un chemin qui y mène.
    for (const q of QUESTIONS) {
      if (q.type !== 'situation') continue
      const vues = new Set<string>()
      const explorer = (i: number, menu: string | null, relais = 0): void => {
        if (i >= q.etapes.length) return
        const e = q.etapes[i]
        const visibles = zones(q.scene, menu)
        for (const c of e.cibles) {
          if (visibles.has(c.replace(/@droit$/, ''))) vues.add(`${i}:${c}`)
          explorer(i + 1, e.ouvrePar?.[c] ?? e.ouvre ?? menu)
        }
        // Une zone relais ouvre un sous-menu sans finir l'étape.
        for (const [c, m] of Object.entries(e.relais ?? {})) {
          if (!visibles.has(c.replace(/@droit$/, ''))) continue
          vues.add(`${i}:${c}`)
          if (relais < 3) explorer(i, m, relais + 1)
        }
      }
      explorer(0, q.menuDepart ?? null)
      q.etapes.forEach((e, i) =>
        [...e.cibles, ...Object.keys(e.relais ?? {})].forEach((c) => expect(vues.has(`${i}:${c}`), `${q.id} étape ${i + 1} : ${c}`).toBe(true))
      )
    }
  })

  it('les mises en situation à raccourci le déclarent sans le montrer dans l’énoncé', () => {
    const att = { 'txt-gras': 'Ctrl+G', 'txt-centrer': 'Ctrl+E', 'txt-annuler': 'Ctrl+Z', 'txt-enregistrer': 'Ctrl+S', 'txt-nouveau': 'Ctrl+N' }
    for (const [id, r] of Object.entries(att)) {
      const q = QUESTIONS.find((x) => x.id === id)
      if (q?.type !== 'situation') throw new Error(id)
      expect(q.raccourci).toBe(r)
      expect(q.question).not.toContain('Ctrl')
    }
  })

  it('la suppression se fait aussi par clic droit puis « Supprimer »', () => {
    const q = QUESTIONS.find((x) => x.id === 'win-supprimer')
    if (q?.type !== 'situation') throw new Error()
    const [e1, e2] = q.etapes
    expect(e1.cibles).toContain('fichier-brouillon')
    expect(e1.cibles).toContain('fichier-brouillon@droit')
    const menu = e1.ouvrePar?.['fichier-brouillon@droit'] ?? null
    expect(menu).not.toBeNull()
    expect(zones(q.scene, null).has('ctx-supprimer')).toBe(false)
    expect(zones(q.scene, menu).has('ctx-supprimer')).toBe(true)
    expect(e2.cibles).toEqual(expect.arrayContaining(['supprimer', 'ctx-supprimer']))
  })
})

describe('création par clic droit sur un emplacement vide', () => {
  it('le clic droit sur le fond ouvre « Nouveau », puis la liste des types', () => {
    for (const scene of ['explorateur', 'bureau'] as const) {
      expect(zones(scene, null).has('fond'), scene).toBe(true)
      expect(zones(scene, null).has('ctx-nouveau'), scene).toBe(false)
      const menu = zones(scene, MENU_FOND)
      expect(menu.has('ctx-nouveau'), scene).toBe(true)
      expect(menu.has(NOUVEAU_DOSSIER_FOND), scene).toBe(false)
      const sousMenu = zones(scene, MENU_FOND_NOUVEAU)
      for (const t of NOUVEAUX_TYPES) expect(sousMenu.has(t.id), `${scene} ${t.nom}`).toBe(true)
    }
    expect(NOUVEAUX_TYPES.map((t) => t.nom)).toEqual(['Dossier', 'Raccourci', 'Image', 'Document Word', 'PDF', 'Document PPT', 'Dossier compressé'])
    expect(NOUVEAUX_FICHIERS_FOND).toHaveLength(6)
    expect(NOUVEAUX_FICHIERS_FOND).not.toContain(NOUVEAU_DOSSIER_FOND)
  })

  it('le dossier se crée par le bouton « Nouveau » ou par clic droit → Nouveau → Dossier', () => {
    const q = QUESTIONS.find((x) => x.id === 'win-nouveau-dossier')
    if (q?.type !== 'situation') throw new Error()
    const [e1, e2] = q.etapes
    // parcours d'origine conservé
    expect(e1.cibles).toContain('nouveau')
    expect(e1.ouvre).toBe('nouveau')
    expect(e2.cibles).toContain('nouveau-dossier')
    // nouveau chemin
    expect(e1.cibles).toContain('fond@droit')
    expect(e1.ouvrePar?.['fond@droit']).toBe(MENU_FOND)
    expect(e2.relais?.['ctx-nouveau']).toBe(MENU_FOND_NOUVEAU)
    expect(e2.cibles).toContain(NOUVEAU_DOSSIER_FOND)
    // un type de fichier ne vaut pas création de dossier
    for (const f of NOUVEAUX_FICHIERS_FOND) expect(e2.cibles).not.toContain(f)
  })

  it('aucune question ne demande de créer un fichier par clic droit', () => {
    const situations = QUESTIONS.filter((x) => x.type === 'situation')
    expect(situations.some((x) => x.type === 'situation' && x.etapes.some((e) => e.cibles.some((c) => NOUVEAUX_FICHIERS_FOND.includes(c))))).toBe(false)
  })
})

describe('tirage', () => {
  it('tire le nombre demandé, sans doublon', () => {
    const qs = tirerQuestions(QUESTIONS, 2, 'tout', 10)
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

describe('questions de l’ergothérapeute', () => {
  it('ajoute ses questions et retire les questions désactivées', () => {
    const perso = {
      id: 'perso-1',
      type: 'choix' as const,
      theme: 'clavier' as const,
      niveau: 1,
      question: 'Combien de touches Maj y a-t-il ?',
      explication: 'Deux : une à gauche, une à droite.',
      icone: 'maj',
      reponse: true,
      choix: ['Deux', 'Une', 'Trois', 'Aucune'] as [string, string, string, string],
      bonne: 0
    }
    const banque = construireBanque([perso], ['mat-souris'])
    expect(banque.find((q) => q.id === 'mat-souris')).toBeUndefined()
    const q = banque.find((x) => x.id === 'perso-1')
    expect(q).toMatchObject({ type: 'choix', perso: true, visuel: { icone: 'maj' }, bonne: 0 })
    expect(banque.length).toBe(QUESTIONS.length)
  })
})
