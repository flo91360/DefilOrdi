// « Lettres de l'espace » : des lettres tombent du haut de l'écran ; taper la
// bonne touche tire un laser qui détruit la lettre la plus basse portant ce
// caractère. Une lettre qui touche le sol est « manquée » (pas de game over :
// la partie dure le temps choisi).
//
// Les positions sont en proportions de l'écran (0 à 1) pour que la logique ne
// dépende pas de la taille de la fenêtre.

export interface Serie {
  id: string
  nom: string
  lettres: string
  niveau: number // niveau conseillé
  majuscules?: boolean // distinguer a et A
}

export const SERIES: Serie[] = [
  { id: 'milieu', nom: 'Rangée du milieu', lettres: 'qsdfghjklm', niveau: 1 },
  { id: 'haut', nom: 'Rangée du haut', lettres: 'azertyuiop', niveau: 1 },
  { id: 'bas', nom: 'Rangée du bas', lettres: 'wxcvbn', niveau: 2 },
  { id: 'tout', nom: 'Toutes les lettres', lettres: 'abcdefghijklmnopqrstuvwxyz', niveau: 3 },
  { id: 'accents', nom: 'Lettres accentuées', lettres: 'éèàçù', niveau: 3 },
  { id: 'majuscules', nom: 'Majuscules', lettres: 'AZERTYUIOPQSDFGHJKLMWXCVBN', niveau: 4, majuscules: true }
]

export const DUREES = [60, 120, 180] as const

export interface Reglages {
  serie: Serie
  dureeS: number
  niveau: number
}

export interface Lettre {
  id: number
  char: string
  x: number // 0 (gauche) à 1 (droite)
  y: number // 0 (haut) à 1 (sol)
  vitesse: number // fraction de la hauteur par seconde
}

export interface Etat {
  temps: number // secondes écoulées
  lettres: Lettre[]
  prochaine: number // instant de la prochaine apparition
  compteur: number
  detruites: number
  manquees: number
  erreurs: number
  lettresRatees: Record<string, number> // lettres tombées au sol + touches tapées par erreur alors qu'elle était visée
}

export type Evenement =
  | { type: 'detruite'; lettre: Lettre }
  | { type: 'sol'; lettre: Lettre }
  | { type: 'erreur'; touche: string }

// Durée de chute et intervalle d'apparition au départ, selon le niveau.
const CHUTE_S: Record<number, number> = { 1: 10, 2: 8, 3: 6.5, 4: 5.5 }
const INTERVALLE_S: Record<number, number> = { 1: 2.4, 2: 1.9, 3: 1.5, 4: 1.2 }
const MAX_A_L_ECRAN = 7

export function nouvelEtat(): Etat {
  return { temps: 0, lettres: [], prochaine: 0.6, compteur: 0, detruites: 0, manquees: 0, erreurs: 0, lettresRatees: {} }
}

// Le jeu accélère doucement : jusqu'à 35 % plus vite à la fin de la partie.
function acceleration(e: Etat, r: Reglages): number {
  return 1 + 0.35 * Math.min(1, e.temps / r.dureeS)
}

export function estTerminee(e: Etat, r: Reglages): boolean {
  return e.temps >= r.dureeS
}

function choisirLettre(e: Etat, r: Reglages, random: () => number): string {
  const visibles = new Set(e.lettres.map((l) => l.char))
  const libres = [...r.serie.lettres].filter((c) => !visibles.has(c))
  const pool = libres.length > 0 ? libres : [...r.serie.lettres]
  return pool[Math.floor(random() * pool.length)]
}

function choisirX(e: Etat, random: () => number): number {
  // Éviter de faire apparaître une lettre juste au-dessus d'une autre encore haute.
  for (let essai = 0; essai < 8; essai++) {
    const x = 0.08 + random() * 0.84
    if (e.lettres.every((l) => l.y > 0.3 || Math.abs(l.x - x) > 0.12)) return x
  }
  return 0.08 + random() * 0.84
}

export function avancer(e: Etat, dt: number, r: Reglages, random: () => number = Math.random): { etat: Etat; evenements: Evenement[] } {
  if (estTerminee(e, r)) return { etat: e, evenements: [] }
  const evenements: Evenement[] = []
  const temps = Math.min(r.dureeS, e.temps + dt)
  const acc = acceleration(e, r)
  let lettres: Lettre[] = []
  let manquees = e.manquees
  const lettresRatees = { ...e.lettresRatees }
  for (const l of e.lettres) {
    const y = l.y + l.vitesse * dt
    if (y >= 1) {
      manquees++
      lettresRatees[l.char] = (lettresRatees[l.char] ?? 0) + 1
      evenements.push({ type: 'sol', lettre: l })
    } else lettres.push({ ...l, y })
  }
  let etat: Etat = { ...e, temps, lettres, manquees, lettresRatees }
  let prochaine = e.prochaine
  let compteur = e.compteur
  // Le temps restant doit laisser à la lettre le temps de tomber à moitié.
  const chute = (CHUTE_S[r.niveau] ?? 8) / acc
  while (temps >= prochaine && lettres.length < MAX_A_L_ECRAN && r.dureeS - temps > chute / 2) {
    const lettre: Lettre = { id: ++compteur, char: choisirLettre(etat, r, random), x: choisirX(etat, random), y: 0, vitesse: 1 / chute }
    lettres = [...lettres, lettre]
    etat = { ...etat, lettres }
    prochaine += (INTERVALLE_S[r.niveau] ?? 2) / acc
  }
  if (temps >= prochaine) prochaine = temps + 0.3 // écran plein : on réessaie bientôt
  return { etat: { ...etat, prochaine, compteur }, evenements }
}

export function correspond(touche: string, char: string, r: Reglages): boolean {
  if (r.serie.majuscules) return touche === char
  return touche.toLocaleLowerCase('fr') === char.toLocaleLowerCase('fr')
}

// L'enfant tape une touche : on vise la lettre correspondante la plus basse.
// Sans lettre à l'écran, la touche est ignorée.
export function tirer(e: Etat, touche: string, r: Reglages): { etat: Etat; evenement: Evenement | null } {
  if (e.lettres.length === 0) return { etat: e, evenement: null }
  const cibles = e.lettres.filter((l) => correspond(touche, l.char, r))
  if (cibles.length === 0) {
    // Erreur : on la compte sur la lettre qui était la plus proche du sol.
    const visee = [...e.lettres].sort((a, b) => b.y - a.y)[0]
    const lettresRatees = visee ? { ...e.lettresRatees, [visee.char]: (e.lettresRatees[visee.char] ?? 0) + 1 } : e.lettresRatees
    return { etat: { ...e, erreurs: e.erreurs + 1, lettresRatees }, evenement: { type: 'erreur', touche } }
  }
  const cible = cibles.reduce((a, b) => (b.y > a.y ? b : a))
  return {
    etat: { ...e, lettres: e.lettres.filter((l) => l.id !== cible.id), detruites: e.detruites + 1 },
    evenement: { type: 'detruite', lettre: cible }
  }
}

// Lettres détruites par minute de jeu.
export function cadence(detruites: number, dureeMs: number): number {
  return dureeMs < 1000 ? 0 : Math.round((detruites * 60000) / dureeMs)
}
