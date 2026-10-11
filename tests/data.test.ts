import { describe, expect, it } from 'vitest'
import { defaultAppData, looksLikeAppData, newProfile, normalizeAppData } from '../src/shared/data'

describe('normalizeAppData', () => {
  it('renvoie les valeurs par défaut pour une entrée invalide', () => {
    expect(normalizeAppData(null)).toEqual(defaultAppData())
    expect(normalizeAppData('texte')).toEqual(defaultAppData())
  })

  it('garde un profil valide tel quel', () => {
    const p = { ...newProfile('a1', '2026-01-01T00:00:00.000Z'), prenom: 'Léa', niveau: 3 }
    const data = normalizeAppData({ version: 1, profiles: [p], settings: { codeErgo: '4321', volume: 0.5 } })
    expect(data.profiles).toEqual([p])
    expect(data.settings).toEqual({ codeErgo: '4321', volume: 0.5 })
  })

  it('remplace les champs invalides et écarte les profils inutilisables', () => {
    const data = normalizeAppData({
      profiles: [
        { id: 'a', prenom: '  Tom  ', niveau: 9, couleurPrincipale: 'violet', avatar: { coiffure: 'inconnue', style: 'robot' } },
        { id: 'b', prenom: '   ' },
        { prenom: 'Sans id' },
        { id: 'a', prenom: 'Doublon' }
      ],
      settings: { codeErgo: '12', volume: 5 }
    })
    expect(data.profiles).toHaveLength(1)
    const tom = data.profiles[0]
    expect(tom.prenom).toBe('Tom')
    expect(tom.niveau).toBe(1)
    expect(tom.couleurPrincipale).toBe(newProfile('x', '').couleurPrincipale)
    expect(tom.avatar.style).toBe('robot')
    expect(tom.avatar.coiffure).toBe('courts')
    expect(data.settings).toEqual(defaultAppData().settings)
  })
})

describe('looksLikeAppData', () => {
  it('reconnaît une sauvegarde DefilOrdi', () => {
    expect(looksLikeAppData(defaultAppData())).toBe(true)
    expect(looksLikeAppData({ autre: 'chose' })).toBe(false)
    expect(looksLikeAppData([])).toBe(false)
  })
})

describe('migration des données de la version 1', () => {
  it('ajoute les listes d’origine, les réglages Dactylo et un historique vide', () => {
    const p = { ...newProfile('a1', '2026-01-01T00:00:00.000Z'), prenom: 'Léa' } as Record<string, unknown>
    delete p.dactylo
    const data = normalizeAppData({ version: 1, profiles: [p], settings: { codeErgo: '1234', volume: 0.5 } })
    expect(data.version).toBe(2)
    expect(data.listes.length).toBe(4)
    expect(data.resultats).toEqual([])
    expect(data.profiles[0].dactylo).toEqual(newProfile('x', '').dactylo)
  })

  it('garde une liste vide si l’ergothérapeute a tout supprimé', () => {
    expect(normalizeAppData({ version: 2, profiles: [], listes: [] }).listes).toEqual([])
  })

  it('écarte les résultats d’un profil supprimé', () => {
    const p = { ...newProfile('a1', '2026-01-01T00:00:00.000Z'), prenom: 'Léa' }
    const r = { id: 'r', profileId: 'a1', date: '2026-02-01T00:00:00.000Z', frappes: 10, erreurs: 1, erreursParTouche: { é: 1 } }
    const data = normalizeAppData({ profiles: [p], resultats: [r, { ...r, id: 'r2', profileId: 'autre' }] })
    expect(data.resultats.map((x) => x.id)).toEqual(['r'])
    expect(data.resultats[0].erreursParTouche).toEqual({ é: 1 })
  })
})
