import { describe, expect, it } from 'vitest'
import {
  choisirPhrases,
  cumuler,
  effacer,
  type EtatPhrase,
  memeCaractere,
  nouvellePhrase,
  precision,
  preparePhrase,
  type Regles,
  taper,
  vitesse
} from '../src/renderer/src/games/dactylo/engine'

const strict: Regles = { accents: true, majuscules: true, bloquer: true }
const libre: Regles = { accents: true, majuscules: true, bloquer: false }

function tout(e: EtatPhrase, texte: string, regles: Regles, t0 = 1000, pas = 100): EtatPhrase {
  let etat = e
  ;[...texte].forEach((c, i) => {
    etat = taper(etat, c, t0 + i * pas, regles).etat
  })
  return etat
}

describe('preparePhrase', () => {
  it('remplace les caractères absents du clavier AZERTY', () => {
    expect(preparePhrase('« Un vœu » – l’été…')).toBe('"Un voeu" - l\'été...')
    expect(preparePhrase('  deux  espaces  ')).toBe('deux espaces')
  })
})

describe('memeCaractere', () => {
  it('applique les réglages accents et majuscules', () => {
    expect(memeCaractere('e', 'é', strict)).toBe(false)
    expect(memeCaractere('e', 'é', { ...strict, accents: false })).toBe(true)
    expect(memeCaractere('a', 'A', strict)).toBe(false)
    expect(memeCaractere('a', 'A', { ...strict, majuscules: false })).toBe(true)
    expect(memeCaractere('E', 'é', { ...strict, accents: false, majuscules: false })).toBe(true)
  })
})

describe('taper', () => {
  it('termine la phrase quand tout est juste et mesure le temps', () => {
    const e = tout(nouvellePhrase('Été'), 'Été', strict)
    expect(e.fin).toBe(1200)
    expect(e.debut).toBe(1000)
    expect(e.frappes).toBe(3)
    expect(e.erreurs).toBe(0)
  })

  it('en mode bloquant, une erreur ne fait pas avancer', () => {
    let e = nouvellePhrase('ab')
    const r = taper(e, 'x', 0, strict)
    expect(r.resultat).toBe('erreur')
    e = r.etat
    expect(e.tape).toHaveLength(0)
    expect(e.erreursParTouche).toEqual({ a: 1 })
    e = tout(e, 'ab', strict)
    expect(e.fin).not.toBeNull()
    expect(e.frappes).toBe(3)
    expect(precision(e)).toBe(67)
  })

  it('en mode libre, il faut corriger avec Retour arrière', () => {
    let e = tout(nouvellePhrase('ab'), 'ax', libre)
    expect(e.fin).toBeNull()
    expect(taper(e, 'b', 0, libre).resultat).toBe('ignore')
    e = effacer(e)
    e = taper(e, 'b', 5000, libre).etat
    expect(e.fin).toBe(5000)
    expect(e.frappes).toBe(3)
    expect(e.erreurs).toBe(1)
  })

  it('garde le caractère attendu quand les accents sont ignorés', () => {
    const e = tout(nouvellePhrase('é'), 'e', { ...strict, accents: false })
    expect(e.tape[0]).toEqual({ char: 'é', ok: true })
    expect(e.fin).not.toBeNull()
  })
})

describe('statistiques', () => {
  it('cumule plusieurs phrases', () => {
    const a = tout(nouvellePhrase('abc'), 'abc', strict, 0, 1000) // 2 s
    const b = tout(nouvellePhrase('de'), 'de', strict, 10000, 1000) // 1 s
    const s = cumuler([a, b], 99999)
    expect(s).toMatchObject({ dureeMs: 3000, caracteres: 5, frappes: 5, erreurs: 0 })
    expect(vitesse(s)).toBe(100)
  })
})

describe('choisirPhrases', () => {
  it('tire le nombre demandé sans doublon', () => {
    const phrases = ['a', 'b', 'c', 'd']
    const choix = choisirPhrases(phrases, 3)
    expect(choix).toHaveLength(3)
    expect(new Set(choix).size).toBe(3)
    expect(choisirPhrases(phrases, 10)).toHaveLength(4)
  })
})
