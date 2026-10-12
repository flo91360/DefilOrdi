// Logique du quiz : tirage des questions, mélange des réponses, correction.

import { melanger } from '../commun'
import { QUESTIONS } from './questions'
import type { Question, QuestionChoix, ThemeId } from './types'

// Les questions proposées vont jusqu'au niveau de l'enfant + 1, pour qu'il y
// en ait assez même au niveau 1.
export function questionsDisponibles(niveau: number, theme: ThemeId | 'tout', banque: Question[] = QUESTIONS): Question[] {
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

export function tirerQuestions(niveau: number, theme: ThemeId | 'tout', n: number, random: () => number = Math.random): Question[] {
  return melanger(questionsDisponibles(niveau, theme), random).slice(0, n)
}

export function trouverQuestion(id: string): Question | undefined {
  return QUESTIONS.find((q) => q.id === id)
}
