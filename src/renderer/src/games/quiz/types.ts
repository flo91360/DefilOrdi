// Types des questions du quiz « L'ordinateur et moi ».

import type { ThemeQuiz } from '../../../../shared/data'

export type ThemeId = ThemeQuiz

export const THEMES: { id: ThemeId; nom: string }[] = [
  { id: 'materiel', nom: 'Le matériel' },
  { id: 'windows', nom: 'Windows et les fichiers' },
  { id: 'internet', nom: 'Internet et sécurité' },
  { id: 'bureautique', nom: 'Traitement de texte' },
  { id: 'clavier', nom: 'Raccourcis clavier' }
]

export type SceneId = 'bureau' | 'texte' | 'navigateur' | 'explorateur'

// Illustration affichée avec la question : une icône, ou un morceau d'écran
// avec un élément entouré.
export type Visuel = { icone: string } | { scene: SceneId; menu?: string; surligne: string }

interface Base {
  id: string
  theme: ThemeId
  niveau: number // 1 à 4
  question: string
  explication: string // affichée après la réponse
  visuel?: Visuel
  perso?: boolean // écrite par l'ergothérapeute
}

export interface QuestionVraiFaux extends Base {
  type: 'vraifaux'
  reponse: boolean
}

export interface QuestionChoix extends Base {
  type: 'choix'
  choix: [string, string, string, string]
  bonne: number // index de la bonne réponse dans `choix`
}

// Une étape : cliquer sur une des zones `cibles` ; `ouvre` est le menu qui
// s'affiche ensuite. Une cible « id@droit » est un clic droit sur la zone `id` (l'écran évolue au fil des étapes).
export interface Etape {
  cibles: string[]
  ouvre?: string
  // menu à afficher selon la zone choisie, quand elle diffère de `ouvre`
  // (ex. clic droit : « fichier@droit » ouvre le menu contextuel)
  ouvrePar?: Record<string, string>
  aide: string // indice donné après deux erreurs
}

export interface QuestionSituation extends Base {
  type: 'situation'
  scene: SceneId
  menuDepart?: string
  etapes: Etape[]
}

export type Question = QuestionVraiFaux | QuestionChoix | QuestionSituation
