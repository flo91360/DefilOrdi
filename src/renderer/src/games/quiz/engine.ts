// Logique du quiz : banque de questions, tirage, mélange des réponses.

import type { QuestionPerso } from '../../../../shared/data'
import { melanger } from '../commun'
import { QUESTIONS } from './questions'
import type { Question, QuestionChoix, ThemeId } from './types'

export function versQuestion(p: QuestionPerso): Question {
  const base = {
    id: p.id,
    theme: p.theme,
    niveau: p.niveau,
    question: p.question,
    explication: p.explication,
    visuel: p.icone ? { icone: p.icone } : undefined,
    perso: true
  }
  return p.type === 'vraifaux' ? { ...base, type: 'vraifaux', reponse: p.reponse } : { ...base, type: 'choix', choix: p.choix, bonne: p.bonne }
}

// Questions fournies (sauf celles désactivées) + questions de l'ergothérapeute.
export function construireBanque(perso: QuestionPerso[], masquees: string[]): Question[] {
  const off = new Set(masquees)
  return [...QUESTIONS.filter((q) => !off.has(q.id)), ...perso.map(versQuestion)]
}

// Les questions proposées vont jusqu'au niveau de l'enfant + 1, pour qu'il y
// en ait assez même au niveau 1.
export function questionsDisponibles(banque: Question[], niveau: number, theme: ThemeId | 'tout'): Question[] {
  return banque.filter((q) => q.niveau <= niveau + 1 && (theme === 'tout' || q.theme === theme))
}

// Une question à choix dont les réponses sont remises dans un ordre au hasard.
export interface ChoixMelange {
  textes: string[]
  bonne: number
}

export function melangerChoix(q: QuestionChoix, random: () => number = Math.random): ChoixMelange {
  const ordre = melanger([0, 1, 2, 3], random)
  return { textes: ordre.map((i) => q.choix[i]), bonne: ordre.indexOf(q.bonne) }
}

export function tirerQuestions(
  banque: Question[],
  niveau: number,
  theme: ThemeId | 'tout',
  n: number,
  random: () => number = Math.random
): Question[] {
  return melanger(questionsDisponibles(banque, niveau, theme), random).slice(0, n)
}
