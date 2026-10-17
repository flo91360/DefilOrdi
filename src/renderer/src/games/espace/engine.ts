// « Chasse aux lettres » : des lettres tombent du haut de l'écran ; taper la
// bonne touche attrape (laser, tir ou rayon selon l'aventure) la lettre la plus
// basse portant ce caractère. Une lettre qui touche le sol est « manquée ».
// Trois modes :
// - chrono : la partie dure le temps choisi, rien ne s'arrête avant ;
// - vies : pas de durée, 3 vies ; une faute ou une lettre tombée en retire une ;
// - pieges : comme vies, avec des pièges à ne pas taper (en taper un retire une
//   vie) et des cadeaux à taper pour gagner une vie.
// Dans tous les modes, 8 lettres réussies d'affilée sans erreur font monter
// d'un palier : d'abord la vitesse, puis deux lettres à la fois.
//
// Les positions sont en proportions de l'écran (0 à 1) pour que la logique ne
// dépende pas de la taille de la fenêtre.

export interface Serie {
  id: string
  nom: string
  lettres: string
  niveau: number // niveau conseillé
  majuscules?: boolean // distinguer a et A (et toute lettre exacte)
}

const MINUSCULES = 'abcdefghijklmnopqrstuvwxyz'
const MAJUSCULES = MINUSCULES.toLocaleUpperCase('fr')
const ACCENTS = 'éèàçù'

export const SERIES: Serie[] = [
  { id: 'milieu', nom: 'Rangée du milieu', lettres: 'qsdfghjklm', niveau: 1 },
  { id: 'haut', nom: 'Rangée du haut', lettres: 'azertyuiop', niveau: 1 },
  { id: 'bas', nom: 'Rangée du bas', lettres: 'wxcvbn', niveau: 2 },
  { id: 'tout', nom: 'Toutes les lettres', lettres: 'abcdefghijklmnopqrstuvwxyz', niveau: 3 },
  { id: 'accents', nom: 'Lettres accentuées', lettres: 'éèàçù', niveau: 3 },
  { id: 'majuscules', nom: 'Majuscules', lettres: 'AZERTYUIOPQSDFGHJKLMWXCVBN', niveau: 4, majuscules: true },
  { id: 'mixte', nom: 'Minuscules et majuscules', lettres: MINUSCULES + MAJUSCULES, niveau: 5, majuscules: true },
  { id: 'majuscules-accents', nom: 'Majuscules et accents', lettres: MAJUSCULES + ACCENTS, niveau: 6, majuscules: true },
  { id: 'melange', nom: 'Tout mélangé', lettres: MINUSCULES + MAJUSCULES + ACCENTS, niveau: 7, majuscules: true }
]

export const DUREES = [60, 120, 180] as const

export type ModeChasse = 'chrono' | 'vies' | 'pieges'
export const MODES: ModeChasse[] = ['chrono', 'vies', 'pieges']
export const NOMS_MODES: Record<ModeChasse, string> = { chrono: 'Chrono', vies: '3 vies', pieges: 'Pièges et cadeaux' }

export const VIES_DEPART = 3
export const VIES_MAX = 5 // les cadeaux ne font pas dépasser ce nombre
export const REUSSITES_PAR_PALIER = 8
const PALIER_MAX_CHRONO = 2 // vitesse puis deux lettres ; ensuite le chrono n'évolue plus
const MAX_SIMULTANEES = 3

export interface Reglages {
  serie: Serie
  dureeS: number
  niveau: number
  mode?: ModeChasse // chrono par défaut
}

export type TypeLettre = 'piege' | 'cadeau' // absent = lettre normale

export interface Lettre {
  id: number
  char: string
  x: number // 0 (gauche) à 1 (droite)
  y: number // 0 (haut) à 1 (sol)
  vitesse: number // fraction de la hauteur par seconde
  type?: TypeLettre
}

export interface Etat {
  temps: number // secondes écoulées
  lettres: Lettre[]
  prochaine: number // instant de la prochaine apparition
  compteur: number
  detruites: number
  manquees: number
  erreurs: number
  vies: number // modes à vies seulement
  serieReussie: number // lettres réussies d'affilée sans erreur, depuis le dernier palier ou la dernière erreur
  palier: number // 0 au départ ; chaque palier rend le jeu plus difficile
  pieges: number // pièges tapés
  cadeaux: number // cadeaux récupérés
  lettresRatees: Record<string, number> // lettres tombées au sol + touches tapées par erreur alors qu'elle était visée
}

export type Evenement =
  | { type: 'detruite'; lettre: Lettre }
  | { type: 'sol'; lettre: Lettre }
  | { type: 'piege'; lettre: Lettre }
  | { type: 'cadeau'; lettre: Lettre }
  | { type: 'passe'; lettre: Lettre } // un piège ou un cadeau est tombé : sans conséquence
  | { type: 'erreur'; touche: string }

// Durée de chute et intervalle d'apparition au départ, selon le niveau.
const CHUTE_S: Record<number, number> = { 1: 10, 2: 8, 3: 6.5, 4: 5.5 }
const INTERVALLE_S: Record<number, number> = { 1: 2.4, 2: 1.9, 3: 1.5, 4: 1.2 }
const MAX_A_L_ECRAN = 7

export const modeDe = (r: Reglages): ModeChasse => r.mode ?? 'chrono'
export const aDesVies = (r: Reglages) => modeDe(r) !== 'chrono'

export function nouvelEtat(): Etat {
  return {
    temps: 0,
    lettres: [],
    prochaine: 0.6,
    compteur: 0,
    detruites: 0,
    manquees: 0,
    erreurs: 0,
    vies: VIES_DEPART,
    serieReussie: 0,
    palier: 0,
    pieges: 0,
    cadeaux: 0,
    lettresRatees: {}
  }
}

// Nombre d'accélérations et de lettres simultanées à un palier donné :
// palier 1 = plus vite, 2 = deux lettres à la fois, 3 = encore plus vite, etc.
export const accelerations = (palier: number) => Math.ceil(palier / 2)
export const simultanees = (palier: number) => Math.min(MAX_SIMULTANEES, 1 + Math.floor(palier / 2))

// Le chrono accélère doucement (jusqu'à 35 % à la fin) ; les modes à vies
// n'ont pas de durée : seuls les paliers accélèrent le jeu.
function acceleration(e: Etat, r: Reglages): number {
  const palier = 1 + Math.min(1.4, 0.15 * accelerations(e.palier))
  if (aDesVies(r)) return palier
  return palier * (1 + 0.35 * Math.min(1, e.temps / r.dureeS))
}

export function estTerminee(e: Etat, r: Reglages): boolean {
  return aDesVies(r) ? e.vies <= 0 : e.temps >= r.dureeS
}

// Progression après une lettre réussie.
function reussite(e: Etat, r: Reglages): Pick<Etat, 'serieReussie' | 'palier'> {
  const serie = e.serieReussie + 1
  if (serie >= REUSSITES_PAR_PALIER && (aDesVies(r) || e.palier < PALIER_MAX_CHRONO)) return { serieReussie: 0, palier: e.palier + 1 }
  return { serieReussie: Math.min(serie, REUSSITES_PAR_PALIER - 1), palier: e.palier }
}

// Une erreur (faute ou lettre tombée) : la série d'affilée repart de zéro et,
// dans les modes à vies, une vie est perdue. Le palier atteint est conservé.
function erreur(e: Etat, r: Reglages): Pick<Etat, 'serieReussie' | 'vies'> {
  return { serieReussie: 0, vies: aDesVies(r) ? Math.max(0, e.vies - 1) : e.vies }
}

function choisirLettre(e: Etat, r: Reglages, random: () => number): string {
  const visibles = new Set(e.lettres.map((l) => l.char))
  const libres = [...r.serie.lettres].filter((c) => !visibles.has(c))
  const pool = libres.length > 0 ? libres : [...r.serie.lettres]
  return pool[Math.floor(random() * pool.length)]
}

// Mode « Pièges et cadeaux » : de temps en temps, une lettre est un piège (à ne
// pas taper) ou, si une vie manque, un cadeau (à taper pour la regagner).
function choisirType(e: Etat, random: () => number): TypeLettre | undefined {
  const x = random()
  const probaPiege = Math.min(0.35, 0.18 + 0.02 * e.palier)
  if (x < probaPiege) return 'piege'
  if (x < probaPiege + 0.1 && e.vies < VIES_MAX && !e.lettres.some((l) => l.type === 'cadeau')) return 'cadeau'
  return undefined
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
  const temps = aDesVies(r) ? e.temps + dt : Math.min(r.dureeS, e.temps + dt)
  const acc = acceleration(e, r)
  let lettres: Lettre[] = []
  let manquees = e.manquees
  let serieReussie = e.serieReussie
  let vies = e.vies
  const lettresRatees = { ...e.lettresRatees }
  for (const l of e.lettres) {
    const y = l.y + l.vitesse * dt
    if (y < 1) lettres.push({ ...l, y })
    else if (l.type) evenements.push({ type: 'passe', lettre: l })
    else {
      manquees++
      lettresRatees[l.char] = (lettresRatees[l.char] ?? 0) + 1
      const apres = erreur({ ...e, serieReussie, vies }, r)
      serieReussie = apres.serieReussie
      vies = apres.vies
      evenements.push({ type: 'sol', lettre: l })
    }
  }
  let etat: Etat = { ...e, temps, lettres, manquees, lettresRatees, serieReussie, vies }
  if (estTerminee(etat, r) && aDesVies(r)) return { etat, evenements }
  let prochaine = e.prochaine
  let compteur = e.compteur
  // Le temps restant doit laisser à la lettre le temps de tomber à moitié.
  const chute = (CHUTE_S[r.niveau] ?? 8) / acc
  const encoreDuTemps = () => aDesVies(r) || r.dureeS - temps > chute / 2
  if (temps >= prochaine && lettres.length < MAX_A_L_ECRAN && encoreDuTemps()) {
    // Au palier « deux lettres », elles apparaissent ensemble.
    const nb = Math.min(simultanees(e.palier), MAX_A_L_ECRAN - lettres.length)
    for (let i = 0; i < nb; i++) {
      const type = modeDe(r) === 'pieges' ? choisirType(etat, random) : undefined
      const lettre: Lettre = { id: ++compteur, char: choisirLettre(etat, r, random), x: choisirX(etat, random), y: 0, vitesse: 1 / chute }
      if (type) lettre.type = type
      lettres = [...lettres, lettre]
      etat = { ...etat, lettres }
    }
    // Quand elles viennent par deux, on laisse un peu plus de temps avant la suite.
    prochaine += ((INTERVALLE_S[r.niveau] ?? 2) * (1 + 0.5 * (nb - 1))) / acc
  }
  if (temps >= prochaine) prochaine = temps + 0.3 // écran plein : on réessaie bientôt
  return { etat: { ...etat, prochaine, compteur }, evenements }
}

export function correspond(touche: string, char: string, r: Reglages): boolean {
  if (r.serie.majuscules) return touche === char
  return touche.toLocaleLowerCase('fr') === char.toLocaleLowerCase('fr')
}

// L'enfant tape une touche : on vise la lettre normale correspondante la plus
// basse ; à défaut, un cadeau ou un piège portant ce caractère.
// Sans lettre à l'écran, la touche est ignorée.
export function tirer(e: Etat, touche: string, r: Reglages): { etat: Etat; evenement: Evenement | null } {
  if (e.lettres.length === 0 || estTerminee(e, r)) return { etat: e, evenement: null }
  const correspondantes = e.lettres.filter((l) => correspond(touche, l.char, r))
  const plusBasse = (ls: Lettre[]) => ls.reduce((a, b) => (b.y > a.y ? b : a))
  const normales = correspondantes.filter((l) => !l.type)
  if (normales.length > 0) {
    const cible = plusBasse(normales)
    return {
      etat: { ...e, lettres: e.lettres.filter((l) => l.id !== cible.id), detruites: e.detruites + 1, ...reussite(e, r) },
      evenement: { type: 'detruite', lettre: cible }
    }
  }
  const cadeaux = correspondantes.filter((l) => l.type === 'cadeau')
  if (cadeaux.length > 0) {
    const cible = plusBasse(cadeaux)
    return {
      etat: { ...e, lettres: e.lettres.filter((l) => l.id !== cible.id), cadeaux: e.cadeaux + 1, vies: Math.min(VIES_MAX, e.vies + 1) },
      evenement: { type: 'cadeau', lettre: cible }
    }
  }
  if (correspondantes.length > 0) {
    const cible = plusBasse(correspondantes)
    return {
      etat: { ...e, lettres: e.lettres.filter((l) => l.id !== cible.id), pieges: e.pieges + 1, ...erreur(e, r) },
      evenement: { type: 'piege', lettre: cible }
    }
  }
  // Erreur : on la compte sur la lettre normale qui était la plus proche du sol.
  const visee = [...e.lettres].filter((l) => !l.type).sort((a, b) => b.y - a.y)[0]
  const lettresRatees = visee ? { ...e.lettresRatees, [visee.char]: (e.lettresRatees[visee.char] ?? 0) + 1 } : e.lettresRatees
  return { etat: { ...e, erreurs: e.erreurs + 1, lettresRatees, ...erreur(e, r) }, evenement: { type: 'erreur', touche } }
}

// Lettres détruites par minute de jeu.
export function cadence(detruites: number, dureeMs: number): number {
  return dureeMs < 1000 ? 0 : Math.round((detruites * 60000) / dureeMs)
}

// Mesure servant aux records : lettres par minute en chrono, lettres attrapées
// dans les modes à vies (leur durée n'est pas fixe).
export function mesureRecord(mode: ModeChasse, detruites: number, dureeMs: number): number {
  return mode === 'chrono' ? cadence(detruites, dureeMs) : detruites
}
