// « Petit bac » : une lettre est tirée au sort et l'enfant écrit, pour chaque
// catégorie, un mot qui commence par cette lettre. Seule la première lettre est
// vérifiée automatiquement : à la fin, l'adulte (ou l'enfant) refuse les mots
// qui ne vont pas dans leur catégorie.

import { melanger, normaliserReponse } from '../commun'

export const NOMBRES_CATEGORIES = [3, 4, 5, 6, 8, 10] as const

// Temps pour remplir la grille, en secondes (0 = sans limite).
export const TEMPS: readonly number[] = [0, 60, 120, 180, 300]

export function nombreParNiveau(niveau: number): number {
  return { 1: 3, 2: 4, 3: 5, 4: 6 }[niveau] ?? 4
}

export function tempsParNiveau(niveau: number): number {
  return { 1: 0, 2: 300, 3: 180, 4: 120 }[niveau] ?? 0
}

export function formatTemps(secondes: number): string {
  return secondes === 0 ? 'Sans limite' : `${Math.round(secondes / 60)} min`
}

// Nombres de catégories proposés à l'enfant : jamais plus que la liste de
// l'ergothérapeute, qui peut être prise en entier si elle est courte.
export function nombresPossibles(total: number): number[] {
  const n: number[] = NOMBRES_CATEGORIES.filter((x) => x < total)
  if (total > 0 && total <= NOMBRES_CATEGORIES[NOMBRES_CATEGORIES.length - 1]) n.push(total)
  return n
}

// Le plus grand nombre possible qui ne dépasse pas celui du niveau.
export function nombreConseille(niveau: number, possibles: number[]): number {
  const voulu = nombreParNiveau(niveau)
  return [...possibles].reverse().find((n) => n <= voulu) ?? possibles[0] ?? 0
}

// Jamais deux fois de suite la même lettre, s'il y a le choix.
export function tirerLettre(lettres: string[], precedente: string | null, random: () => number = Math.random): string {
  const choix = lettres.length > 1 ? lettres.filter((l) => l !== precedente) : lettres
  return choix[Math.floor(random() * choix.length)]
}

// Catégories de la partie, dans l'ordre de la liste de l'ergothérapeute.
export function choisirCategories(categories: string[], n: number, random: () => number = Math.random): string[] {
  const gardees = new Set(melanger(categories, random).slice(0, n))
  return categories.filter((c) => gardees.has(c))
}

// « la banane » compte pour B : un article au début est ignoré.
const ARTICLE = /^(l'|le |la |les |un |une |des |du |d')/

function simplifier(mot: string): string {
  return normaliserReponse(mot).replace(/[’`]/g, "'").replace(/œ/g, 'oe').replace(/æ/g, 'ae')
}

const premiereLettre = (s: string) => s.match(/[a-z]/)?.[0] ?? ''

export type EtatReponse = 'vide' | 'court' | 'lettre' | 'ok'

// 'lettre' : le mot ne commence pas par la lettre tirée.
export function etatReponse(mot: string, lettre: string): EtatReponse {
  const m = simplifier(mot)
  if (m === '') return 'vide'
  const sansArticle = m.replace(ARTICLE, '')
  if ((sansArticle.match(/[a-z]/g) ?? []).length < 2) return 'court'
  const l = lettre.toLowerCase()
  return premiereLettre(m) === l || premiereLettre(sansArticle) === l ? 'ok' : 'lettre'
}

export function texteEtat(etat: EtatReponse, lettre: string): string {
  if (etat === 'vide') return 'Pas de réponse'
  if (etat === 'court') return 'Trop court'
  if (etat === 'lettre') return `Ne commence pas par ${lettre}`
  return 'Accepté'
}
