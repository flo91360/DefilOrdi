import { describe, expect, it } from 'vitest'
import { COULEURS_PREFEREES } from '../src/shared/data'
import { contraste, textOn } from '../src/renderer/src/color'

describe('Texte sur les couleurs préférées', () => {
  it('choisit le texte le plus lisible, au moins 4:1 sur chaque couleur proposée', () => {
    for (const c of COULEURS_PREFEREES) {
      const autre = textOn(c) === '#ffffff' ? '#1f2330' : '#ffffff'
      expect(contraste(c, textOn(c)), c).toBeGreaterThanOrEqual(contraste(c, autre))
      expect(contraste(c, textOn(c)), c).toBeGreaterThanOrEqual(4)
    }
  })

  it('garde du texte foncé sur l’orange et du blanc sur le bleu', () => {
    expect(textOn('#f08a2c')).toBe('#1f2330')
    expect(textOn('#4f6bd9')).toBe('#ffffff')
  })
})
