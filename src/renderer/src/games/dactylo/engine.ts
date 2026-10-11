// Logique du jeu de dactylographie, sans interface (testée dans tests/engine.test.ts).
//
// Règles de comptage :
// - une frappe = un caractère inséré, erreurs comprises ; « ^ puis e » donne
//   « ê » et compte pour une seule frappe ; Retour arrière ne compte pas ;
// - la précision = caractères corrects au moment de la frappe / frappes :
//   corriger une erreur ne l'efface pas des statistiques ;
// - le chronomètre d'une phrase part à la première frappe et s'arrête quand
//   la phrase est entièrement juste ; les pauses entre phrases ne comptent pas.

import type { OptionsDactylo } from '../../../../shared/data'

export type Regles = Pick<OptionsDactylo, 'accents' | 'majuscules' | 'bloquer'>

// Remplace les caractères typographiques qu'on ne trouve pas sur un clavier
// AZERTY (apostrophe courbe, guillemets, œ…) par leur équivalent tapable.
export function preparePhrase(raw: string): string {
  return raw
    .replace(/[’‘`´]/g, "'")
    .replace(/«\s*/g, '"')
    .replace(/\s*»/g, '"')
    .replace(/[“”„]/g, '"')
    .replace(/[\u00a0\u202f\u2009]/g, ' ')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/œ/g, 'oe')
    .replace(/Œ/g, 'Oe')
    .replace(/æ/g, 'ae')
    .replace(/Æ/g, 'Ae')
    .replace(/\s+/g, ' ')
    .trim()
}

function sansAccent(c: string): string {
  return c.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function memeCaractere(tape: string, attendu: string, regles: Regles): boolean {
  // É, È, À, Ç… ne se tapent pas simplement sur un clavier Windows :
  // la majuscule sans accent est toujours acceptée.
  if (attendu !== attendu.toLocaleLowerCase('fr') && tape === sansAccent(attendu)) return true
  let a = tape
  let b = attendu
  if (!regles.accents) {
    a = sansAccent(a)
    b = sansAccent(b)
  }
  if (!regles.majuscules) {
    a = a.toLocaleLowerCase('fr')
    b = b.toLocaleLowerCase('fr')
  }
  return a === b
}

export interface Lettre {
  char: string
  ok: boolean
}

export interface EtatPhrase {
  cible: string
  tape: Lettre[]
  frappes: number
  erreurs: number
  erreursParTouche: Record<string, number>
  debut: number | null
  fin: number | null
}

export function nouvellePhrase(cible: string): EtatPhrase {
  return { cible, tape: [], frappes: 0, erreurs: 0, erreursParTouche: {}, debut: null, fin: null }
}

export function estTerminee(e: EtatPhrase): boolean {
  return e.fin !== null
}

export type Resultat = 'juste' | 'erreur' | 'ignore'

export function taper(e: EtatPhrase, ch: string, now: number, regles: Regles): { etat: EtatPhrase; resultat: Resultat } {
  const cible = [...e.cible]
  if (e.fin !== null || ch === '\n' || ch === '\r' || ch === '\t') return { etat: e, resultat: 'ignore' }
  if (e.tape.length >= cible.length) return { etat: e, resultat: 'ignore' }
  const attendu = cible[e.tape.length]
  const ok = memeCaractere(ch, attendu, regles)
  const debut = e.debut ?? now
  const erreursParTouche = ok
    ? e.erreursParTouche
    : { ...e.erreursParTouche, [attendu]: (e.erreursParTouche[attendu] ?? 0) + 1 }
  const base = { ...e, debut, frappes: e.frappes + 1, erreurs: e.erreurs + (ok ? 0 : 1), erreursParTouche }

  if (!ok && regles.bloquer) return { etat: base, resultat: 'erreur' }

  // On garde le caractère attendu quand il est accepté (accents/majuscules
  // ignorés) pour que la phrase s'affiche correctement.
  const tape = [...e.tape, { char: ok ? attendu : ch, ok }]
  const complete = tape.length === cible.length && tape.every((l) => l.ok)
  return { etat: { ...base, tape, fin: complete ? now : null }, resultat: ok ? 'juste' : 'erreur' }
}

export function effacer(e: EtatPhrase): EtatPhrase {
  if (e.fin !== null || e.tape.length === 0) return e
  return { ...e, tape: e.tape.slice(0, -1) }
}

export function dureePhrase(e: EtatPhrase, now: number): number {
  if (e.debut === null) return 0
  return (e.fin ?? now) - e.debut
}

export interface Stats {
  dureeMs: number
  caracteres: number
  frappes: number
  erreurs: number
}

// Frappes justes par minute.
export function vitesse(s: Pick<Stats, 'dureeMs' | 'frappes' | 'erreurs'>): number {
  if (s.dureeMs < 1000) return 0
  return Math.round(((s.frappes - s.erreurs) * 60000) / s.dureeMs)
}

// Mots par minute, avec la convention habituelle d'un mot = 5 caractères.
export function motsParMinute(s: Pick<Stats, 'dureeMs' | 'caracteres'>): number {
  if (s.dureeMs < 1000) return 0
  return Math.round((s.caracteres * 60000) / s.dureeMs / 5)
}

export function precision(s: Pick<Stats, 'frappes' | 'erreurs'>): number {
  if (s.frappes === 0) return 100
  return Math.round(((s.frappes - s.erreurs) / s.frappes) * 100)
}

export function cumuler(phrases: EtatPhrase[], now: number): Stats & { erreursParTouche: Record<string, number> } {
  const erreursParTouche: Record<string, number> = {}
  let dureeMs = 0
  let caracteres = 0
  let frappes = 0
  let erreurs = 0
  for (const p of phrases) {
    dureeMs += dureePhrase(p, now)
    if (p.fin !== null) caracteres += [...p.cible].length
    frappes += p.frappes
    erreurs += p.erreurs
    for (const [k, n] of Object.entries(p.erreursParTouche)) erreursParTouche[k] = (erreursParTouche[k] ?? 0) + n
  }
  return { dureeMs, caracteres, frappes, erreurs, erreursParTouche }
}

// Tire n phrases au hasard, sans doublon, en gardant l'ordre de la liste mélangé.
export function choisirPhrases(phrases: string[], n: number, random: () => number = Math.random): string[] {
  const pool = phrases.map(preparePhrase).filter((p) => p !== '')
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, n)
}

export function formatDuree(ms: number): string {
  const total = Math.floor(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
