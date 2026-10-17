import { describe, expect, it } from 'vitest'
import { defaultAppData, defaultOptionsDactylo, normalizeAppData } from '../src/shared/data'
import { Dictionnaire } from '../src/shared/orthographe'
import { defaultListes, listesAvecPhrasesEnfants } from '../src/shared/phrases'
import { estTapable, texteRegle, verifierRegles } from '../src/shared/regles'

const dico = new Dictionnaire(defaultListes().flatMap((l) => l.phrases))

describe('règles par niveau', () => {
  it('niveau 1 : 6 mots, sans accent, majuscule ni ponctuation', () => {
    expect(verifierRegles('le chat dort', 1)).toEqual([])
    expect(verifierRegles('le chat dort sur le grand tapis rouge', 1)).toHaveLength(1)
    expect(verifierRegles('Le chat dort', 1).length).toBeGreaterThan(0)
    expect(verifierRegles('le chat dort.', 1).length).toBeGreaterThan(0)
    expect(verifierRegles("j'ai un chat", 1).length).toBeGreaterThan(0)
    expect(verifierRegles('le chat dormait à la maison', 1).length).toBeGreaterThan(0)
  })

  it('niveau 2 : 10 mots, majuscule au début, un seul signe', () => {
    expect(verifierRegles("Le chat dort sur le canapé de l'école.", 2)).toEqual([])
    expect(verifierRegles('Le chat, noir, dort.', 2).length).toBeGreaterThan(0)
    expect(verifierRegles('Le Chat dort.', 2).length).toBeGreaterThan(0)
    expect(verifierRegles('un deux trois quatre cinq six sept huit neuf dix onze', 2)).toHaveLength(1)
  })

  it('niveau 3 : 14 mots, quelques signes', () => {
    expect(verifierRegles('Paul a 3 chats, deux chiens et un lapin.', 3)).toEqual([])
    expect(verifierRegles('Oh ! Quoi ? Non ; si, oui.', 3).length).toBeGreaterThan(0)
    expect(verifierRegles(Array(15).fill('mot').join(' '), 3)).toHaveLength(1)
  })

  it('niveau 4 : pas de maximum de mots', () => {
    expect(verifierRegles(Array(40).fill('Mot,').join(' '), 4)).toEqual([])
    expect(texteRegle(4)).toContain('pas de maximum')
    expect(texteRegle(1)).toContain('6 mots au maximum')
  })

  it('refuse un caractère absent du clavier AZERTY', () => {
    expect(estTapable('é')).toBe(true)
    expect(estTapable('€')).toBe(true)
    expect(estTapable('☺')).toBe(false)
    expect(verifierRegles('Un smiley ☺', 4).length).toBeGreaterThan(0)
  })
})

describe('correcteur hors ligne', () => {
  it('accepte des mots connus, avec pluriel et verbes', () => {
    expect(dico.inconnus('le chat dort')).toEqual([])
    expect(dico.inconnus('les chats mangent des pommes')).toEqual([])
    expect(dico.inconnus("Le facteur apporte une lettre à l'école.")).toEqual([])
  })

  it('signale une faute ou un mot inconnu', () => {
    expect(dico.inconnus('le chta dort')).toEqual(['chta'])
    expect(dico.inconnus('le zorglub dort')).toEqual(['zorglub'])
  })

  it('exige les accents sauf au niveau 1', () => {
    expect(dico.inconnus('ecole', true)).toEqual(['ecole'])
    expect(dico.inconnus('ecole', false)).toEqual([])
  })

  it('connaît les mots des listes de l’ergothérapeute', () => {
    expect(new Dictionnaire(['Mon dinosaure préféré adore zorglub']).inconnus('zorglub')).toEqual([])
  })
})

describe('données', () => {
  it('l’affichage des erreurs est actif par défaut', () => {
    expect(defaultOptionsDactylo().afficherErreurs).toBe(true)
    const d = normalizeAppData({ profiles: [{ id: 'a', prenom: 'Léa', classe: 'CP', dactylo: { accents: false } }] })
    expect(d.profiles[0].dactylo.afficherErreurs).toBe(true)
    const d2 = normalizeAppData({ profiles: [{ id: 'a', prenom: 'Léa', classe: 'CP', dactylo: { afficherErreurs: false } }] })
    expect(d2.profiles[0].dactylo.afficherErreurs).toBe(false)
  })

  it('normalise les phrases des enfants', () => {
    expect(defaultAppData().phrasesEnfants).toEqual([])
    const d = normalizeAppData({
      phrasesEnfants: [{ id: 'p', texte: '  le  chat  ', niveau: 1, statut: 'a_verifier' }, { id: '', texte: 'x' }, { id: 'q', texte: '  ' }]
    })
    expect(d.phrasesEnfants).toHaveLength(1)
    expect(d.phrasesEnfants[0]).toMatchObject({ texte: 'le chat', statut: 'a_verifier', niveau: 1 })
  })

  it('ajoute les phrases validées aux listes du même niveau seulement', () => {
    const listes = listesAvecPhrasesEnfants(defaultListes(), [
      { texte: 'ma phrase', niveau: 1, statut: 'valide' },
      { texte: 'en attente', niveau: 1, statut: 'a_verifier' }
    ])
    expect(listes[0].phrases).toContain('ma phrase')
    expect(listes[0].phrases).not.toContain('en attente')
    expect(listes[1].phrases).not.toContain('ma phrase')
  })
})
