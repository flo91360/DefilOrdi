import { describe, expect, it } from 'vitest'
import { statutPhrase } from '../src/renderer/src/games/dactylo/PhrasePerso'

describe('phrases des enfants', () => {
  it('une phrase refusée par le correcteur est toujours à vérifier, avec ses remarques', () => {
    expect(statutPhrase(['Ta phrase a 6 mots'], false)).toEqual({ statut: 'a_verifier', motifs: ['Ta phrase a 6 mots'] })
    expect(statutPhrase(['Ta phrase a 6 mots'], true)).toEqual({ statut: 'a_verifier', motifs: ['Ta phrase a 6 mots'] })
  })

  it('une phrase acceptée attend l’ergothérapeute avec la relecture, sinon elle est partagée tout de suite', () => {
    expect(statutPhrase([], true)).toEqual({ statut: 'a_verifier', motifs: [] })
    expect(statutPhrase([], false)).toEqual({ statut: 'valide', motifs: [] })
  })
})
