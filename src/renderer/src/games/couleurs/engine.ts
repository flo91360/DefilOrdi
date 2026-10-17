// « Couleurs piégées » (effet Stroop) : un nom de couleur est écrit dans une
// autre couleur. Selon la consigne, l'enfant tape le mot écrit ou la couleur
// de l'encre.

import type { ModeCouleurs } from '../../../../shared/data'
import { normaliserReponse } from '../commun'

export interface Couleur {
  nom: string
  hex: string // lisible sur le fond sombre de la carte
}

// Dans l'ordre où elles s'ajoutent quand le niveau augmente.
export const COULEURS: Couleur[] = [
  { nom: 'rouge', hex: '#ff5a52' },
  { nom: 'bleu', hex: '#4f8bff' },
  { nom: 'vert', hex: '#3fcf6b' },
  { nom: 'jaune', hex: '#ffd43b' },
  { nom: 'orange', hex: '#ff922b' },
  { nom: 'violet', hex: '#b07cff' },
  { nom: 'rose', hex: '#ff7ac6' },
  { nom: 'blanc', hex: '#ffffff' }
]

export function couleursPourNiveau(niveau: number): Couleur[] {
  const n = { 1: 4, 2: 5, 3: 6, 4: 8 }[niveau] ?? 4
  return COULEURS.slice(0, n)
}

export type Consigne = 'mot' | 'couleur'

export interface Manche {
  mot: Couleur
  encre: Couleur
  consigne: Consigne
}

export function estPiege(m: Manche): boolean {
  return m.mot.nom !== m.encre.nom
}

export function reponseAttendue(m: Manche): string {
  return m.consigne === 'mot' ? m.mot.nom : m.encre.nom
}

export function estJuste(m: Manche, reponse: string): boolean {
  return normaliserReponse(reponse) === reponseAttendue(m)
}

// Environ 7 manches sur 10 sont des pièges (mot et encre différents).
// Deux manches qui se suivent ne sont jamais identiques.
export function genererManches(
  n: number,
  mode: ModeCouleurs,
  couleurs: Couleur[],
  random: () => number = Math.random
): Manche[] {
  const pickC = () => couleurs[Math.floor(random() * couleurs.length)]
  const out: Manche[] = []
  while (out.length < n) {
    const mot = pickC()
    let encre = mot
    if (random() < 0.7) {
      while (encre.nom === mot.nom) encre = pickC()
    }
    const consigne: Consigne = mode === 'melange' ? (random() < 0.5 ? 'mot' : 'couleur') : mode
    const m = { mot, encre, consigne }
    const prev = out[out.length - 1]
    if (prev && prev.mot.nom === m.mot.nom && prev.encre.nom === m.encre.nom) continue
    out.push(m)
  }
  return out
}

// ---------- Bouton Indice ----------
// L'indice affiche quelques couleurs, dont toujours la bonne réponse ; le mot
// piège peut en faire partie. L'enfant tape toujours sa réponse au clavier.

// Inutile quand la réponse attendue est le mot déjà écrit à l'écran.
export function indiceUtile(m: Manche): boolean {
  return reponseAttendue(m) !== m.mot.nom
}

// Le premier indice de la partie montre `depart` propositions, chaque indice
// suivant une de plus, sans dépasser 4.
export function nbPropositions(depart: number, indicesDejaUtilises: number): number {
  return Math.min(4, Math.max(2, depart) + Math.max(0, indicesDejaUtilises))
}

export function propositionsIndice(
  m: Manche,
  n: number,
  couleurs: Couleur[],
  random: () => number = Math.random
): string[] {
  const bonne = reponseAttendue(m)
  const autres = couleurs.map((c) => c.nom).filter((nom, i, t) => nom !== bonne && t.indexOf(nom) === i)
  melanger(autres, random)
  const out = [bonne, ...autres.slice(0, Math.max(1, Math.min(4, n)) - 1)]
  return melanger(out, random)
}

function melanger<T>(t: T[], random: () => number): T[] {
  for (let i = t.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[t[i], t[j]] = [t[j], t[i]]
  }
  return t
}

// ---------- Mode entraînement à la souris ----------
// Pour les manches « couleur de l'encre », l'enfant clique sur une couleur au
// lieu de la taper. Le type de clic qui valide est choisi avant la partie ;
// les autres types de clic sont ignorés.

export type ClicValidation = 'gauche' | 'droit' | 'double'

export const CLICS_VALIDATION: { id: ClicValidation; titre: string }[] = [
  { id: 'gauche', titre: 'Clic gauche' },
  { id: 'droit', titre: 'Clic droit' },
  { id: 'double', titre: 'Double clic' }
]

// Vrai si la manche se répond à la souris dans le mode entraînement.
export function reponseALaSouris(m: Manche, entrainement: boolean): boolean {
  return entrainement && m.consigne === 'couleur'
}

// Un clic gauche est un `click` (bouton 0), un clic droit un `contextmenu`,
// un double clic un `dblclick`.
export function clicValide(choisi: ClicValidation, evenement: 'click' | 'contextmenu' | 'dblclick'): boolean {
  return (
    (choisi === 'gauche' && evenement === 'click') ||
    (choisi === 'droit' && evenement === 'contextmenu') ||
    (choisi === 'double' && evenement === 'dblclick')
  )
}
