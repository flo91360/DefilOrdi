import { describe, expect, it } from 'vitest'
import { normaliserReponse } from '../src/renderer/src/games/commun'
import { COULEURS, estJuste, estPiege, genererManches } from '../src/renderer/src/games/couleurs/engine'
import { choisirMots, proposer } from '../src/renderer/src/games/memoire/engine'

describe('normaliserReponse', () => {
  it('ignore majuscules, accents et espaces', () => {
    expect(normaliserReponse('  Zèbre ')).toBe('zebre')
  })
})

describe('Couleurs piégées', () => {
  const rouge = COULEURS[0]
  const bleu = COULEURS[1]

  it('vérifie la réponse selon la consigne', () => {
    expect(estJuste({ mot: rouge, encre: bleu, consigne: 'mot' }, 'Rouge')).toBe(true)
    expect(estJuste({ mot: rouge, encre: bleu, consigne: 'mot' }, 'bleu')).toBe(false)
    expect(estJuste({ mot: rouge, encre: bleu, consigne: 'couleur' }, 'bleu ')).toBe(true)
  })

  it('génère des manches variées avec une majorité de pièges', () => {
    const manches = genererManches(200, 'couleur', COULEURS.slice(0, 4))
    expect(manches).toHaveLength(200)
    const pieges = manches.filter(estPiege).length
    expect(pieges).toBeGreaterThan(110)
    expect(pieges).toBeLessThan(180)
    for (let i = 1; i < manches.length; i++) {
      const [a, b] = [manches[i - 1], manches[i]]
      expect(a.mot.nom === b.mot.nom && a.encre.nom === b.encre.nom).toBe(false)
    }
    expect(manches.every((m) => m.consigne === 'couleur')).toBe(true)
  })

  it('le mode mélange alterne les consignes', () => {
    const consignes = new Set(genererManches(50, 'melange', COULEURS).map((m) => m.consigne))
    expect(consignes).toEqual(new Set(['mot', 'couleur']))
  })
})

describe('Mots à retenir', () => {
  it('choisit des mots sans doublon', () => {
    const mots = choisirMots(['chat', 'Chat', 'lune', 'pomme', ' '], 10)
    expect(mots).toHaveLength(3)
  })

  it('reconnaît les mots trouvés, déjà trouvés ou absents', () => {
    const mots = ['zèbre', 'lapin']
    expect(proposer(mots, [false, false], 'ZEBRE')).toEqual({ type: 'trouve', index: 0 })
    expect(proposer(mots, [true, false], 'zèbre')).toEqual({ type: 'deja', index: 0 })
    expect(proposer(mots, [true, false], 'tigre')).toEqual({ type: 'absent' })
    expect(proposer(mots, [true, false], '  ')).toEqual({ type: 'vide' })
  })
})
