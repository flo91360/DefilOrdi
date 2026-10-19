import { describe, expect, it } from 'vitest'
import { pucesReprises } from '../scripts/sections.mjs'

describe('Description des changements', () => {
  it('repère les puces reprises de la version déjà publiée', () => {
    const publiee = '- Quiz : nouveau thème.\n- Petit bac : catégories modifiables.'
    expect(pucesReprises(publiee, '- Dactylo : nouvelle option.')).toEqual([])
    expect(pucesReprises(publiee, '- Dactylo : nouvelle option.\n-  Quiz :  nouveau thème.')).toEqual(['Quiz : nouveau thème.'])
    expect(pucesReprises(undefined, '- Dactylo : nouvelle option.')).toEqual([])
    const interne = '- Améliorations internes, sans changement visible.'
    expect(pucesReprises(interne, interne)).toEqual([])
  })
})
