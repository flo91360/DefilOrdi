import { describe, expect, it } from 'vitest'
import { normaliserReponse } from '../src/renderer/src/games/commun'
import {
  COULEURS,
  estJuste,
  estPiege,
  genererManches,
  indiceUtile,
  nbPropositions,
  propositionsIndice
} from '../src/renderer/src/games/couleurs/engine'
import {
  avancerProgression,
  choisirMots,
  choisirPhrase,
  departProgression,
  estPhrase,
  motsDePhrase,
  proposer,
  verifierPhrase
} from '../src/renderer/src/games/memoire/engine'
import { PALIER_PHRASE } from '../src/shared/data'
import { defaultPhrasesMemoire } from '../src/shared/phrases'

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

  it('l’indice ne sert que si la réponse n’est pas le mot écrit', () => {
    expect(indiceUtile({ mot: rouge, encre: bleu, consigne: 'couleur' })).toBe(true)
    expect(indiceUtile({ mot: rouge, encre: bleu, consigne: 'mot' })).toBe(false)
    expect(indiceUtile({ mot: rouge, encre: rouge, consigne: 'couleur' })).toBe(false)
  })

  it('chaque indice montre une proposition de plus, 4 au plus', () => {
    expect([0, 1, 2].map((i) => nbPropositions(2, i))).toEqual([2, 3, 4])
    expect([0, 1, 2].map((i) => nbPropositions(3, i))).toEqual([3, 4, 4])
    expect(nbPropositions(4, 0)).toBe(4)
  })

  it('les propositions contiennent toujours la bonne réponse, sans doublon', () => {
    const couleurs = COULEURS.slice(0, 4)
    let piegeVu = false
    for (let i = 0; i < 200; i++) {
      const [mot, encre] = [couleurs[i % 4], couleurs[(i + 1 + (i % 3)) % 4]]
      const n = 2 + (i % 3)
      const p = propositionsIndice({ mot, encre, consigne: 'couleur' }, n, couleurs)
      expect(p).toHaveLength(n)
      expect(p).toContain(encre.nom)
      expect(new Set(p).size).toBe(n)
      if (p.includes(mot.nom)) piegeVu = true
    }
    expect(piegeVu).toBe(true)
  })

  it('ne propose pas plus de couleurs que le jeu n’en contient', () => {
    const p = propositionsIndice({ mot: rouge, encre: bleu, consigne: 'couleur' }, 4, [rouge, bleu])
    expect(p.sort()).toEqual(['bleu', 'rouge'])
  })
})

describe('Mots à retenir', () => {
  it('choisit des mots sans doublon', () => {
    const mots = choisirMots(['chat', 'Chat', 'lune', 'pomme', ' '], 10)
    expect(mots).toHaveLength(3)
  })

  it('reconnaît les mots trouvés, déjà trouvés ou absents', () => {
    const mots = ['zèbre', 'lapin']
    expect(proposer(mots, [false, false], 'ZEBRE', 5)).toEqual({ type: 'trouve', index: 0 })
    expect(proposer(mots, [true, false], 'zèbre', 5)).toEqual({ type: 'deja', index: 0 })
    expect(proposer(mots, [true, false], 'tigre', 5)).toEqual({ type: 'absent' })
    expect(proposer(mots, [true, false], '  ', 5)).toEqual({ type: 'vide' })
  })

  it('moins de 5 mots : aucune tolérance ; de 5 à 7 : accents et majuscules tolérés', () => {
    const mots = ['zèbre', 'lapin']
    expect(proposer(mots, [false, false], ' zèbre ', 3)).toEqual({ type: 'trouve', index: 0 })
    expect(proposer(mots, [false, false], 'zebre', 3)).toEqual({ type: 'absent' })
    expect(proposer(mots, [false, false], 'Lapin', 4)).toEqual({ type: 'absent' })
    expect(proposer(mots, [false, false], 'ZEBRE', 5)).toEqual({ type: 'trouve', index: 0 })
    expect(proposer(mots, [false, false], 'Lapin', 7)).toEqual({ type: 'trouve', index: 1 })
  })
})

describe('Mots à retenir : difficulté progressive', () => {
  const jouer = (depart: number, parties: boolean[]) => {
    let e = departProgression(depart)
    const changements: (string | null)[] = []
    for (const ok of parties) {
      const r = avancerProgression(e, ok)
      changements.push(r.changement)
      e = { palier: r.palier, reussites: r.reussites, echecs: r.echecs }
    }
    return { ...e, changements }
  }

  it('trois réussites consécutives font monter d’un mot, quel que soit le départ', () => {
    expect(jouer(3, [true, true])).toMatchObject({ palier: 3, reussites: 2 })
    expect(jouer(3, [true, true, true])).toMatchObject({ palier: 4, reussites: 0, echecs: 0, changements: [null, null, 'monte'] })
    expect(jouer(5, [true, true, true])).toMatchObject({ palier: 6 })
    expect(jouer(3, Array(9).fill(true))).toMatchObject({ palier: 6 })
  })

  it('après 7 mots vient la phrase, qui remplace le palier à 8 mots', () => {
    const e = jouer(7, [true, true, true])
    expect(e.palier).toBe(PALIER_PHRASE)
    expect(estPhrase(e.palier)).toBe(true)
    // On reste à la phrase même après d'autres réussites.
    expect(jouer(PALIER_PHRASE, Array(6).fill(true)).palier).toBe(PALIER_PHRASE)
  })

  it('un échec rejoue au même palier, deux échecs consécutifs font redescendre', () => {
    expect(jouer(5, [false])).toMatchObject({ palier: 5, echecs: 1, changements: [null] })
    expect(jouer(5, [false, false])).toMatchObject({ palier: 4, echecs: 0, reussites: 0, changements: [null, 'descend'] })
    // Sous le palier de départ si besoin, jamais sous 3.
    expect(jouer(5, [false, false, false, false])).toMatchObject({ palier: 3 })
    expect(jouer(5, Array(10).fill(false))).toMatchObject({ palier: 3, echecs: 0 })
    expect(jouer(PALIER_PHRASE, [false, false]).palier).toBe(7)
  })

  it('une réussite efface l’échec précédent, un échec efface les réussites', () => {
    expect(jouer(5, [false, true, false])).toMatchObject({ palier: 5, echecs: 1 })
    expect(jouer(5, [true, true, false, true, true])).toMatchObject({ palier: 5, reussites: 2 })
  })

  it('les compteurs repartent à zéro à chaque changement de palier', () => {
    // 2 réussites puis montée : un seul échec au nouveau palier ne redescend pas.
    expect(jouer(4, [true, true, true, false])).toMatchObject({ palier: 5, echecs: 1, reussites: 0 })
    // Après une descente, il faut de nouveau 3 réussites pour remonter.
    expect(jouer(5, [false, false, true, true])).toMatchObject({ palier: 4, reussites: 2 })
    expect(jouer(5, [false, false, true, true, true])).toMatchObject({ palier: 5, reussites: 0 })
  })
})

describe('Mots à retenir : palier phrase', () => {
  it('les phrases fournies font environ 10 mots', () => {
    for (const p of defaultPhrasesMemoire()) {
      const n = motsDePhrase(p).length
      expect(n).toBeGreaterThanOrEqual(9)
      expect(n).toBeLessThanOrEqual(12)
    }
  })

  it('découpe la phrase sans compter la ponctuation isolée', () => {
    expect(motsDePhrase('Quelle surprise ! Le colis est arrivé.')).toEqual(['Quelle', 'surprise', 'Le', 'colis', 'est', 'arrivé.'])
  })

  it('tolère accents, majuscules et ponctuation, mais exige tous les mots dans l’ordre', () => {
    const mots = motsDePhrase('Le chien du voisin aboie très fort, quand le facteur passe.')
    expect(verifierPhrase(mots, 'le chien du voisin aboie tres fort quand le facteur passe').reussie).toBe(true)
    expect(verifierPhrase(mots, 'LE CHIEN DU VOISIN ABOIE TRÈS FORT ; QUAND LE FACTEUR PASSE !').reussie).toBe(true)
    // Ordre différent
    const inverse = verifierPhrase(mots, 'le chien du voisin aboie très fort quand passe le facteur')
    expect(inverse.reussie).toBe(false)
    expect(inverse.trouves.filter(Boolean)).toHaveLength(10)
    // Mot oublié : les suivants restent bien placés
    const oubli = verifierPhrase(mots, 'le chien du voisin aboie fort quand le facteur passe')
    expect(oubli.reussie).toBe(false)
    expect(oubli.trouves).toEqual([true, true, true, true, true, false, true, true, true, true, true])
    // Mot en trop
    const trop = verifierPhrase(mots, 'le gros chien du voisin aboie très fort quand le facteur passe')
    expect(trop.reussie).toBe(false)
    expect(trop.enTrop).toBe(1)
  })

  it('choisit une phrase de la liste, ou une phrase d’origine si la liste est vide', () => {
    expect(choisirPhrase(['Une seule phrase pour ce test.'], () => 0)).toBe('Une seule phrase pour ce test.')
    expect(defaultPhrasesMemoire()).toContain(choisirPhrase([], () => 0))
  })
})
