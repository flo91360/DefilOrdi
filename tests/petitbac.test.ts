import { describe, expect, it } from 'vitest'
import { defaultPetitBac, newProfile, normalizeAppData } from '../src/shared/data'
import {
  choisirCategories,
  etatReponse,
  nombreConseille,
  nombresPossibles,
  tirerLettre
} from '../src/renderer/src/games/petitbac/engine'

describe('Petit bac : vérification des réponses', () => {
  it('accepte un mot qui commence par la lettre, sans tenir compte des accents ni des majuscules', () => {
    expect(etatReponse('baleine', 'B')).toBe('ok')
    expect(etatReponse('  Éléphant ', 'E')).toBe('ok')
    expect(etatReponse('œuf', 'O')).toBe('ok')
  })

  it('ignore un article au début', () => {
    expect(etatReponse('la banane', 'B')).toBe('ok')
    expect(etatReponse("l'ours", 'O')).toBe('ok')
    expect(etatReponse('l’ours', 'O')).toBe('ok')
    expect(etatReponse('Le Mans', 'L')).toBe('ok')
    expect(etatReponse('Le Mans', 'M')).toBe('ok')
  })

  it('signale une case vide, un mot trop court ou une mauvaise lettre', () => {
    expect(etatReponse('   ', 'B')).toBe('vide')
    expect(etatReponse('b', 'B')).toBe('court')
    expect(etatReponse('la b', 'B')).toBe('court')
    expect(etatReponse('pomme', 'B')).toBe('lettre')
  })
})

describe('Petit bac : tirage', () => {
  it('ne tire jamais deux fois de suite la même lettre s’il y a le choix', () => {
    for (let i = 0; i < 50; i++) expect(tirerLettre(['A', 'B'], 'A')).toBe('B')
    expect(tirerLettre(['C'], 'C')).toBe('C')
  })

  it('choisit des catégories différentes, dans l’ordre de la liste', () => {
    const liste = ['Prénom', 'Animal', 'Pays', 'Métier', 'Sport']
    const choisies = choisirCategories(liste, 3)
    expect(choisies).toHaveLength(3)
    expect(new Set(choisies).size).toBe(3)
    expect(choisies).toEqual(liste.filter((c) => choisies.includes(c)))
    expect(choisirCategories(liste, 10)).toEqual(liste)
  })

  it('propose un nombre de catégories adapté à la liste et au niveau', () => {
    expect(nombresPossibles(12)).toEqual([3, 4, 5, 6, 8, 10])
    expect(nombresPossibles(7)).toEqual([3, 4, 5, 6, 7])
    expect(nombresPossibles(2)).toEqual([2])
    expect(nombresPossibles(0)).toEqual([])
    expect(nombreConseille(4, nombresPossibles(12))).toBe(6)
    expect(nombreConseille(4, nombresPossibles(5))).toBe(5)
    expect(nombreConseille(1, nombresPossibles(2))).toBe(2)
  })
})

describe('Petit bac : données', () => {
  it('met les catégories et lettres d’origine dans une ancienne sauvegarde', () => {
    const data = normalizeAppData({ version: 3, profiles: [] })
    expect(data.petitBac).toEqual(defaultPetitBac())
    expect(data.petitBac.lettres).not.toContain('W')
  })

  it('nettoie les réglages de l’ergothérapeute', () => {
    const data = normalizeAppData({
      profiles: [],
      petitBac: { categories: ['  Animal ', 'animal', '', 'Fruit   rouge', 42], lettres: ['b', 'A', 'É', 'AB', 'A', 7] }
    })
    expect(data.petitBac).toEqual({ categories: ['Animal', 'Fruit rouge'], lettres: ['A', 'B'] })
  })

  it('garde des listes vides si l’ergothérapeute a tout retiré', () => {
    expect(normalizeAppData({ profiles: [], petitBac: { categories: [], lettres: [] } }).petitBac).toEqual({ categories: [], lettres: [] })
  })

  it('lit les résultats du petit bac', () => {
    const p = { ...newProfile('a1', '2026-01-01T00:00:00.000Z', 'CM1'), prenom: 'Léa' }
    const data = normalizeAppData({
      profiles: [p],
      resultats: [
        {
          id: 'pb',
          profileId: 'a1',
          date: '2026-10-13T10:00:00.000Z',
          jeu: 'petitbac',
          lettre: 'z9',
          tempsLimite: 120,
          dureeMs: 95000,
          categories: 3,
          justes: 5,
          reponses: [{ categorie: 'Animal', mot: 'baleine', valide: true }, { categorie: 'Pays', mot: '', valide: 'oui' }, null]
        }
      ]
    })
    expect(data.resultats[0]).toEqual({
      id: 'pb',
      profileId: 'a1',
      date: '2026-10-13T10:00:00.000Z',
      complete: true,
      jeu: 'petitbac',
      lettre: 'A',
      tempsLimite: 120,
      dureeMs: 95000,
      categories: 3,
      justes: 3,
      reponses: [
        { categorie: 'Animal', mot: 'baleine', valide: true },
        { categorie: 'Pays', mot: '', valide: false }
      ]
    })
  })
})
