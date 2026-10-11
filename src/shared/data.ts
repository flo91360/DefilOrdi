// Modèle des données sauvegardées sur le PC, partagé entre Electron et l'interface.
// Toute donnée lue (fichier, import de sauvegarde) passe par normalizeAppData :
// un champ absent ou invalide est remplacé par sa valeur par défaut.

import { defaultListes, type ListePhrases } from './phrases'

export type { ListePhrases }

export const DATA_VERSION = 2

export type AvatarStyle = 'personnage' | 'robot'

export interface AvatarConfig {
  style: AvatarStyle
  // Personnage
  peau: string
  coiffure: string
  cheveux: string
  yeux: string
  bouche: string
  tenue: string
  couleurTenue: string
  accessoire: string
  // Robot
  couleurRobot: string
  tete: string
  antenne: string
  ecran: string
  couleurLed: string
}

export interface Profile {
  id: string
  prenom: string
  creeLe: string
  avatar: AvatarConfig
  couleurPrincipale: string
  couleurSecondaire: string
  sonReussite: string
  sonEchec: string
  // Réglé par l'ergothérapeute : 1 (débutant) à 4 (expert)
  niveau: number
  dactylo: OptionsDactylo
}

// Réglages du jeu de dactylographie, propres à chaque enfant.
export interface OptionsDactylo {
  accents: boolean // é et e sont différents
  majuscules: boolean // A et a sont différents
  bloquer: boolean // une erreur n'avance pas : il faut taper la bonne lettre
  clavier: boolean // clavier affiché à l'écran avec la touche à taper
  sonErreur: boolean // son d'erreur à chaque faute
}

// Une partie de dactylographie terminée (ou arrêtée après au moins une phrase).
export interface ResultatDactylo {
  id: string
  profileId: string
  jeu: 'dactylo'
  date: string
  listeNom: string
  phrases: number
  dureeMs: number
  caracteres: number // caractères des phrases réussies
  frappes: number // caractères tapés, erreurs comprises (Retour arrière exclu)
  erreurs: number
  erreursParTouche: Record<string, number> // caractère attendu -> nombre d'erreurs
}

export interface Settings {
  codeErgo: string
  volume: number
}

export interface AppData {
  version: number
  profiles: Profile[]
  listes: ListePhrases[]
  resultats: ResultatDactylo[]
  settings: Settings
}

export const AVATAR_OPTIONS = {
  style: ['personnage', 'robot'],
  peau: ['#f9d9c3', '#f1c3a0', '#dfa47c', '#b97a52', '#8d5634', '#5c3920'],
  coiffure: ['courts', 'bataille', 'longs', 'queue', 'boucles', 'chignon', 'rase'],
  cheveux: ['#2b2220', '#5a3825', '#8a5a33', '#e2bc6e', '#c25a2c', '#4f7bd9', '#e26fa4', '#8c5ad8', '#3fae7a'],
  yeux: ['ronds', 'joyeux', 'malicieux'],
  bouche: ['sourire', 'rire', 'calme'],
  tenue: ['tshirt', 'capuche', 'chemise'],
  couleurTenue: ['#e2504c', '#f08a2c', '#f3c33c', '#3fae7a', '#2fa4c9', '#4f6bd9', '#8c5ad8', '#e26fa4', '#3b3f4a', '#f4f4f0'],
  accessoire: ['aucun', 'lunettes', 'soleil', 'casque', 'casquette', 'bandeau'],
  couleurRobot: ['#9aa4b4', '#4f8fd9', '#3fae7a', '#f08a2c', '#e2504c', '#8c5ad8', '#f3c33c', '#3b3f4a'],
  tete: ['carree', 'ronde'],
  antenne: ['boule', 'double', 'eclair', 'aucune'],
  ecran: ['ronds', 'carres', 'visiere'],
  couleurLed: ['#5ef0ff', '#7dff8a', '#ff7ad9', '#ffe066']
} as const

// Couleurs proposées comme « couleurs préférées »
export const COULEURS_PREFEREES = [
  '#e2504c', '#f08a2c', '#f3c33c', '#9bc53d', '#3fae7a', '#2fb5a5',
  '#2fa4c9', '#4f6bd9', '#8c5ad8', '#c45ad8', '#e26fa4', '#6b7280'
]

export const SONS_REUSSITE = ['carillon', 'piece', 'fanfare', 'bulles', 'etoile', 'aucun']
export const SONS_ECHEC = ['oups', 'boing', 'tambour', 'plouf', 'aucun']

export const NIVEAUX = [1, 2, 3, 4]

export function defaultAvatar(): AvatarConfig {
  return {
    style: 'personnage',
    peau: AVATAR_OPTIONS.peau[1],
    coiffure: 'courts',
    cheveux: AVATAR_OPTIONS.cheveux[1],
    yeux: 'ronds',
    bouche: 'sourire',
    tenue: 'tshirt',
    couleurTenue: AVATAR_OPTIONS.couleurTenue[5],
    accessoire: 'aucun',
    couleurRobot: AVATAR_OPTIONS.couleurRobot[1],
    tete: 'carree',
    antenne: 'boule',
    ecran: 'ronds',
    couleurLed: AVATAR_OPTIONS.couleurLed[0]
  }
}

export function newProfile(id: string, creeLe: string): Profile {
  return {
    id,
    prenom: '',
    creeLe,
    avatar: defaultAvatar(),
    couleurPrincipale: COULEURS_PREFEREES[7],
    couleurSecondaire: COULEURS_PREFEREES[2],
    sonReussite: SONS_REUSSITE[0],
    sonEchec: SONS_ECHEC[0],
    niveau: 1,
    dactylo: defaultOptionsDactylo()
  }
}

export function defaultOptionsDactylo(): OptionsDactylo {
  return { accents: true, majuscules: true, bloquer: true, clavier: true, sonErreur: true }
}

export function defaultAppData(): AppData {
  return {
    version: DATA_VERSION,
    profiles: [],
    listes: defaultListes(),
    resultats: [],
    settings: { codeErgo: '0000', volume: 0.7 }
  }
}

export const PRENOM_MAX = 20
export const NOM_LISTE_MAX = 40
export const PHRASE_MAX = 300

type Obj = Record<string, unknown>

function isObj(v: unknown): v is Obj {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function pick<T extends string>(v: unknown, allowed: readonly T[], fallback: T): T {
  return typeof v === 'string' && (allowed as readonly string[]).includes(v) ? (v as T) : fallback
}

function normalizeAvatar(v: unknown): AvatarConfig {
  const d = defaultAvatar()
  if (!isObj(v)) return d
  const out = { ...d }
  for (const key of Object.keys(AVATAR_OPTIONS) as (keyof typeof AVATAR_OPTIONS)[]) {
    out[key] = pick(v[key], AVATAR_OPTIONS[key] as readonly string[], d[key]) as never
  }
  return out
}

function normalizeProfile(v: unknown): Profile | null {
  if (!isObj(v) || typeof v.id !== 'string' || v.id === '') return null
  const d = newProfile(v.id, typeof v.creeLe === 'string' ? v.creeLe : new Date(0).toISOString())
  const prenom = typeof v.prenom === 'string' ? v.prenom.trim().slice(0, PRENOM_MAX) : ''
  if (prenom === '') return null
  return {
    ...d,
    prenom,
    avatar: normalizeAvatar(v.avatar),
    couleurPrincipale: pick(v.couleurPrincipale, COULEURS_PREFEREES, d.couleurPrincipale),
    couleurSecondaire: pick(v.couleurSecondaire, COULEURS_PREFEREES, d.couleurSecondaire),
    sonReussite: pick(v.sonReussite, SONS_REUSSITE, d.sonReussite),
    sonEchec: pick(v.sonEchec, SONS_ECHEC, d.sonEchec),
    niveau: typeof v.niveau === 'number' && NIVEAUX.includes(v.niveau) ? v.niveau : d.niveau,
    dactylo: normalizeOptions(v.dactylo)
  }
}

function normalizeOptions(v: unknown): OptionsDactylo {
  const d = defaultOptionsDactylo()
  if (!isObj(v)) return d
  const out = { ...d }
  for (const key of Object.keys(d) as (keyof OptionsDactylo)[]) {
    if (typeof v[key] === 'boolean') out[key] = v[key] as boolean
  }
  return out
}

function normalizeListe(v: unknown): ListePhrases | null {
  if (!isObj(v) || typeof v.id !== 'string' || v.id === '') return null
  const nom = typeof v.nom === 'string' ? v.nom.trim().slice(0, NOM_LISTE_MAX) : ''
  const phrases = (Array.isArray(v.phrases) ? v.phrases : [])
    .filter((p): p is string => typeof p === 'string')
    .map((p) => p.trim().slice(0, PHRASE_MAX))
    .filter((p) => p !== '')
  return {
    id: v.id,
    nom: nom || 'Sans nom',
    niveau: typeof v.niveau === 'number' && NIVEAUX.includes(v.niveau) ? v.niveau : 1,
    phrases
  }
}

function count(v: unknown): number {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.round(v) : 0
}

function normalizeResultat(v: unknown, profileIds: Set<string>): ResultatDactylo | null {
  if (!isObj(v) || typeof v.id !== 'string' || typeof v.profileId !== 'string') return null
  if (!profileIds.has(v.profileId) || typeof v.date !== 'string' || Number.isNaN(Date.parse(v.date))) return null
  const erreursParTouche: Record<string, number> = {}
  if (isObj(v.erreursParTouche)) {
    for (const [k, n] of Object.entries(v.erreursParTouche)) {
      if (k.length > 0 && k.length <= 2 && count(n) > 0) erreursParTouche[k] = count(n)
    }
  }
  return {
    id: v.id,
    profileId: v.profileId,
    jeu: 'dactylo',
    date: v.date,
    listeNom: typeof v.listeNom === 'string' ? v.listeNom.slice(0, NOM_LISTE_MAX) : '',
    phrases: count(v.phrases),
    dureeMs: count(v.dureeMs),
    caracteres: count(v.caracteres),
    frappes: count(v.frappes),
    erreurs: count(v.erreurs),
    erreursParTouche
  }
}

export function isValidCode(code: unknown): code is string {
  return typeof code === 'string' && /^\d{4}$/.test(code)
}

export function normalizeAppData(v: unknown): AppData {
  const d = defaultAppData()
  if (!isObj(v)) return d
  const seen = new Set<string>()
  const profiles: Profile[] = []
  for (const raw of Array.isArray(v.profiles) ? v.profiles : []) {
    const p = normalizeProfile(raw)
    if (p && !seen.has(p.id)) {
      seen.add(p.id)
      profiles.push(p)
    }
  }
  // Listes absentes (ancienne sauvegarde) : on remet celles d'origine.
  // Une liste vide est gardée telle quelle : l'ergothérapeute a tout supprimé.
  const listes = Array.isArray(v.listes)
    ? v.listes.map(normalizeListe).filter((l): l is ListePhrases => l !== null)
    : d.listes
  const resultats = (Array.isArray(v.resultats) ? v.resultats : [])
    .map((r) => normalizeResultat(r, seen))
    .filter((r): r is ResultatDactylo => r !== null)
  const s = isObj(v.settings) ? v.settings : {}
  const volume = typeof s.volume === 'number' && s.volume >= 0 && s.volume <= 1 ? s.volume : d.settings.volume
  return {
    version: DATA_VERSION,
    profiles,
    listes,
    resultats,
    settings: {
      codeErgo: isValidCode(s.codeErgo) ? s.codeErgo : d.settings.codeErgo,
      volume
    }
  }
}

// Une sauvegarde importée doit au minimum ressembler à un fichier DefilOrdi.
export function looksLikeAppData(v: unknown): boolean {
  return isObj(v) && typeof v.version === 'number' && Array.isArray(v.profiles)
}
