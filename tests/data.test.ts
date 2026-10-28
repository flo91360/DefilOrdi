import { describe, expect, it } from 'vitest'
import { CLASSES, defaultAppData, defaultProgressionMemoire, looksLikeAppData, newProfile, normalizeAppData } from '../src/shared/data'
import { defaultPhrasesMemoire } from '../src/shared/phrases'

const profil = (id: string, prenom: string) => ({ ...newProfile(id, '2026-01-01T00:00:00.000Z', 'CM1'), prenom })

describe('normalizeAppData', () => {
  it('renvoie les valeurs par défaut pour une entrée invalide', () => {
    expect(normalizeAppData(null)).toEqual(defaultAppData())
    expect(normalizeAppData('texte')).toEqual(defaultAppData())
  })

  it('garde un profil valide tel quel', () => {
    const p = { ...profil('a1', 'Léa'), niveau: 3, classe: 'CE2' as const, age: 8 }
    const data = normalizeAppData({ version: 1, profiles: [p], settings: { codeErgo: '4321', volume: 0.5 } })
    expect(data.profiles).toEqual([p])
    expect(data.settings).toEqual({ codeErgo: '4321', volume: 0.5, relirePhrasesEnfants: true })
  })

  it('remplace les champs invalides et écarte les profils inutilisables', () => {
    const data = normalizeAppData({
      profiles: [
        { id: 'a', prenom: '  Tom  ', classe: '6ème', niveau: 9, couleurPrincipale: 'violet', avatar: { coiffure: 'inconnue', style: 'robot' } },
        { id: 'b', prenom: '   ', classe: 'CP' },
        { prenom: 'Sans id', classe: 'CP' },
        { id: 'a', prenom: 'Doublon', classe: 'CP' }
      ],
      settings: { codeErgo: '12', volume: 5 }
    })
    expect(data.profiles).toHaveLength(1)
    const tom = data.profiles[0]
    expect(tom.prenom).toBe('Tom')
    expect(tom.classe).toBe('6ème')
    expect(tom.age).toBeNull()
    expect(tom.niveau).toBe(1)
    expect(tom.couleurPrincipale).toBe(newProfile('x', '', 'CP').couleurPrincipale)
    expect(tom.avatar.style).toBe('robot')
    expect(tom.avatar.coiffure).toBe('courts')
    expect(data.settings).toEqual(defaultAppData().settings)
  })
})

describe('classe et âge du profil', () => {
  it('propose les classes du CP à la Terminale', () => {
    expect(CLASSES).toEqual(['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale'])
  })

  it('supprime les profils sans classe ou avec une classe inconnue, et leurs résultats', () => {
    const sansClasse = profil('a', 'Léa') as Record<string, unknown>
    delete sansClasse.classe
    const date = '2026-02-01T00:00:00.000Z'
    const data = normalizeAppData({
      profiles: [sansClasse, { ...profil('b', 'Tom'), classe: 'CE7' }, profil('c', 'Inès')],
      resultats: [
        { id: 'r1', profileId: 'a', date, frappes: 10, erreurs: 1 },
        { id: 'r2', profileId: 'c', date, frappes: 10, erreurs: 1 }
      ]
    })
    expect(data.profiles.map((p) => p.prenom)).toEqual(['Inès'])
    expect(data.resultats.map((r) => r.id)).toEqual(['r2'])
  })

  it('garde un âge de 6 à 18 ans, par année', () => {
    const ages = [5, 6, 12, 18, 19, 8.5, '10']
    const data = normalizeAppData({ profiles: ages.map((age, i) => ({ ...profil(`p${i}`, 'Léa'), age })) })
    expect(data.profiles.map((p) => p.age)).toEqual([null, 6, 12, 18, null, null, null])
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
    const p = profil('a1', 'Léa') as Record<string, unknown>
    delete p.dactylo
    const data = normalizeAppData({ version: 1, profiles: [p], settings: { codeErgo: '1234', volume: 0.5 } })
    expect(data.version).toBe(5)
    expect(data.listes.length).toBe(4)
    expect(data.resultats).toEqual([])
    expect(data.profiles[0].dactylo).toEqual(newProfile('x', '', 'CP').dactylo)
  })

  it('garde une liste vide si l’ergothérapeute a tout supprimé', () => {
    expect(normalizeAppData({ version: 2, profiles: [], listes: [] }).listes).toEqual([])
  })

  it('écarte les résultats d’un profil supprimé', () => {
    const p = profil('a1', 'Léa')
    const r = { id: 'r', profileId: 'a1', date: '2026-02-01T00:00:00.000Z', frappes: 10, erreurs: 1, erreursParTouche: { é: 1 } }
    const data = normalizeAppData({ profiles: [p], resultats: [r, { ...r, id: 'r2', profileId: 'autre' }] })
    expect(data.resultats.map((x) => x.id)).toEqual(['r'])
    expect(data.resultats[0]).toMatchObject({ jeu: 'dactylo', erreursParTouche: { é: 1 } })
  })
})

describe('migration vers la version 3', () => {
  it('ajoute les listes de mots et lit les résultats des nouveaux jeux', () => {
    const p = profil('a1', 'Léa')
    const date = '2026-02-01T00:00:00.000Z'
    const data = normalizeAppData({
      version: 2,
      profiles: [p],
      resultats: [
        { id: 'c', profileId: 'a1', date, jeu: 'couleurs', mode: 'inconnu', manches: 10, justes: 12, pieges: 7, piegesJustes: 5, dureeMs: 30000 },
        { id: 'm', profileId: 'a1', date, jeu: 'memoire', listeNom: 'Animaux', mots: 5, trouves: 4, erreurs: 2, dureeMs: 40000 }
      ]
    })
    expect(data.version).toBe(5)
    expect(data.mots.length).toBe(4)
    expect(data.resultats[0]).toMatchObject({ jeu: 'couleurs', mode: 'mot', manches: 10, justes: 10, pieges: 7, piegesJustes: 5, indices: 0 })
    expect(data.resultats[1]).toMatchObject({ jeu: 'memoire', mots: 5, trouves: 4, erreurs: 2 })
  })
})

describe('Mots à retenir : progression et phrases', () => {
  it('ajoute une progression vide aux anciens profils et garde une progression valide', () => {
    const ancien = profil('a', 'Léa') as Record<string, unknown>
    delete ancien.memoire
    const memoire = { progressionId: 'p1', palier: 8, reussites: 2, echecs: 1, listeId: 'mots-2' }
    const data = normalizeAppData({
      profiles: [ancien, { ...profil('b', 'Tom'), memoire }, { ...profil('c', 'Inès'), memoire: { ...memoire, palier: 9, reussites: -1 } }]
    })
    expect(data.profiles[0].memoire).toEqual(defaultProgressionMemoire())
    expect(data.profiles[1].memoire).toEqual(memoire)
    expect(data.profiles[2].memoire).toMatchObject({ palier: 3, reussites: 0, echecs: 1 })
  })

  it('remet les phrases d’origine aux anciennes sauvegardes et garde une liste vide', () => {
    expect(normalizeAppData({ profiles: [] }).phrasesMemoire).toEqual(defaultPhrasesMemoire())
    expect(normalizeAppData({ profiles: [], phrasesMemoire: [] }).phrasesMemoire).toEqual([])
    expect(normalizeAppData({ profiles: [], phrasesMemoire: ['  Une  phrase. ', '', 3] }).phrasesMemoire).toEqual(['Une phrase.'])
  })

  it('lit les anciennes parties et les parties avec progression', () => {
    const date = '2026-02-01T00:00:00.000Z'
    const base = { profileId: 'a1', date, jeu: 'memoire', listeNom: 'Animaux', mots: 5, trouves: 5, erreurs: 0, dureeMs: 1000 }
    const data = normalizeAppData({
      profiles: [profil('a1', 'Léa')],
      resultats: [
        { ...base, id: 'ancienne' },
        { ...base, id: 'nouvelle', progressionId: 'p1', palier: 8, phrase: 'Le chat dort.', reussie: false, palierSuivant: 8 }
      ]
    })
    expect(data.resultats[0]).toMatchObject({ progressionId: '', palier: 0, phrase: '', reussie: true, palierSuivant: 0 })
    expect(data.resultats[1]).toMatchObject({ progressionId: 'p1', palier: 8, phrase: 'Le chat dort.', reussie: false, palierSuivant: 8 })
  })
})

describe('questions du quiz de l’ergothérapeute', () => {
  it('garde les questions valides et écarte les incomplètes', () => {
    const base = { id: 'q1', type: 'vraifaux', theme: 'clavier', niveau: 2, question: ' La touche Entrée va à la ligne. ', explication: '', icone: '', reponse: true, choix: ['', '', '', ''], bonne: 0 }
    const data = normalizeAppData({
      profiles: [],
      questionsPerso: [base, { ...base, id: 'q2', type: 'choix', choix: ['a', 'b', '', 'd'] }, { ...base, id: 'q3', question: '  ' }],
      questionsMasquees: ['mat-souris', 42]
    })
    expect(data.questionsPerso.map((q) => q.id)).toEqual(['q1'])
    expect(data.questionsPerso[0].question).toBe('La touche Entrée va à la ligne.')
    expect(data.questionsMasquees).toEqual(['mat-souris'])
  })
})

describe('Chasse aux lettres', () => {
  it('garde l’aventure choisie et prend la fusée pour les anciennes parties', () => {
    const p = profil('a1', 'Léa')
    const base = { profileId: 'a1', date: '2026-02-01T00:00:00.000Z', jeu: 'espace', serieNom: 'Ligne du milieu', dureeMs: 60000, detruites: 12, manquees: 2, erreurs: 1, lettresRatees: { k: 2 } }
    const data = normalizeAppData({
      profiles: [p],
      resultats: [
        { ...base, id: 'ancienne' },
        { ...base, id: 'cowboy', theme: 'western' },
        { ...base, id: 'sousmarin', theme: 'ocean' },
        { ...base, id: 'inconnu', theme: 'jungle' }
      ]
    })
    expect(data.resultats.map((r) => (r.jeu === 'espace' ? r.theme : null))).toEqual(['espace', 'western', 'ocean', 'espace'])
  })
})

describe('Couleurs piégées : réglages du bouton Indice', () => {
  it('donne 3 indices et 2 propositions par défaut, y compris aux anciennes sauvegardes', () => {
    expect(normalizeAppData({ version: 4, profiles: [] }).couleurs).toEqual({ indicesParPartie: 3, propositionsDepart: 2 })
  })

  it('garde un réglage valide et corrige un réglage invalide', () => {
    expect(normalizeAppData({ profiles: [], couleurs: { indicesParPartie: 0, propositionsDepart: 4 } }).couleurs).toEqual({
      indicesParPartie: 0,
      propositionsDepart: 4
    })
    expect(normalizeAppData({ profiles: [], couleurs: { indicesParPartie: 7, propositionsDepart: 1 } }).couleurs).toEqual({
      indicesParPartie: 3,
      propositionsDepart: 2
    })
  })

  it('lit le nombre d’indices utilisés dans une partie', () => {
    const date = '2026-02-01T00:00:00.000Z'
    const data = normalizeAppData({
      profiles: [profil('a1', 'Léa')],
      resultats: [{ id: 'c', profileId: 'a1', date, jeu: 'couleurs', mode: 'couleur', manches: 10, justes: 8, pieges: 7, piegesJustes: 5, dureeMs: 1, indices: 2, minutes: 0 }]
    })
    expect(data.resultats[0]).toMatchObject({ jeu: 'couleurs', indices: 2 })
  })
})

describe('Chasse aux lettres : anciens résultats', () => {
  it('donne des valeurs par défaut (chrono) aux parties d’avant les nouveaux modes', () => {
    const date = '2026-02-01T00:00:00.000Z'
    const ancien = { id: 'e', profileId: 'a1', date, jeu: 'espace', theme: 'ocean', serieNom: 'Majuscules', dureeMs: 60000, detruites: 20, manquees: 2, erreurs: 1, lettresRatees: {} }
    const data = normalizeAppData({
      profiles: [profil('a1', 'Léa')],
      resultats: [ancien, { ...ancien, id: 'f', mode: 'pieges', pieges: 3, cadeaux: 1, palier: 2 }, { ...ancien, id: 'g', mode: 'inconnu' }]
    })
    expect(data.resultats[0]).toMatchObject({ mode: 'chrono', pieges: 0, cadeaux: 0, palier: 0 })
    expect(data.resultats[1]).toMatchObject({ mode: 'pieges', pieges: 3, cadeaux: 1, palier: 2 })
    expect(data.resultats[2]).toMatchObject({ mode: 'chrono' })
  })
})


describe('Police des lettres (Chasse aux lettres)', () => {
  it('un profil existant sans le champ reçoit la police par défaut', () => {
    const { policeLettres: _p, ...ancien } = profil('a', 'Tom')
    const data = normalizeAppData({ ...defaultAppData(), profiles: [ancien] })
    expect(data.profiles[0].policeLettres).toBe('verdana')
  })
  it('conserve une police valide et corrige une valeur inconnue', () => {
    const ok = normalizeAppData({ ...defaultAppData(), profiles: [{ ...profil('a', 'Tom'), policeLettres: 'comic' }] })
    expect(ok.profiles[0].policeLettres).toBe('comic')
    const ko = normalizeAppData({ ...defaultAppData(), profiles: [{ ...profil('b', 'Léa'), policeLettres: 'Papyrus' }] })
    expect(ko.profiles[0].policeLettres).toBe('verdana')
  })
})

describe('clavier à l’écran masqué par défaut', () => {
  it('est masqué pour un nouveau profil', () => {
    expect(newProfile('n', '', 'CP').dactylo.clavier).toBe(false)
  })
  it('masque le clavier des profils d’une ancienne version', () => {
    const p = { ...newProfile('x', '', 'CP'), prenom: 'Léa', dactylo: { ...newProfile('x', '', 'CP').dactylo, clavier: true } }
    expect(normalizeAppData({ version: 4, profiles: [p] }).profiles[0].dactylo.clavier).toBe(false)
  })
  it('garde le réglage de l’ergothérapeute une fois migré', () => {
    const p = { ...newProfile('x', '', 'CP'), prenom: 'Léa', dactylo: { ...newProfile('x', '', 'CP').dactylo, clavier: true } }
    expect(normalizeAppData({ version: 5, profiles: [p] }).profiles[0].dactylo.clavier).toBe(true)
  })
})

describe('médailles du profil', () => {
  it('valeur par défaut vide et doublons conservés', async () => {
    const { normalizeMedailles } = await import('../src/shared/data')
    expect(normalizeMedailles(undefined)).toEqual([])
    const d = '2026-01-01T10:00:00.000Z'
    expect(normalizeMedailles([{ niveau: 2, date: d }, { niveau: 2, date: d }, { niveau: 9, date: d }, { niveau: 1 }])).toHaveLength(2)
  })
})

describe('sauvegarde d’une autre version du logiciel', () => {
  it('ignore les parties d’un jeu inconnu au lieu d’en faire des parties Dactylo', async () => {
    const { DATA_VERSION } = await import('../src/shared/data')
    const d = normalizeAppData({
      version: DATA_VERSION + 1,
      profiles: [profil('p', 'Léo')],
      resultats: [
        { id: 'r1', profileId: 'p', jeu: 'nouveaujeu', date: '2026-10-01T10:00:00Z', dureeMs: 5000 },
        { id: 'r2', profileId: 'p', date: '2026-10-01T10:00:00Z', dureeMs: 5000, frappes: 10 }
      ]
    })
    expect(d.resultats.map((r) => [r.id, r.jeu])).toEqual([['r2', 'dactylo']])
  })

  it('reconnaît des données plus récentes ou plus anciennes que ce logiciel', async () => {
    const { DATA_VERSION, estPlusAncienne, estPlusRecente } = await import('../src/shared/data')
    expect(estPlusRecente({ version: DATA_VERSION + 1, profiles: [] })).toBe(true)
    expect(estPlusRecente({ version: DATA_VERSION, profiles: [] })).toBe(false)
    expect(estPlusAncienne({ version: DATA_VERSION - 1, profiles: [] })).toBe(true)
    expect(estPlusAncienne({ profiles: [] })).toBe(true)
    expect(estPlusAncienne({ version: DATA_VERSION, profiles: [] })).toBe(false)
  })
})

describe('relecture des phrases et parties arrêtées', () => {
  it('relit les phrases des enfants par défaut, y compris pour les anciennes sauvegardes', () => {
    expect(defaultAppData().settings.relirePhrasesEnfants).toBe(true)
    expect(normalizeAppData({ version: 5, profiles: [], settings: { codeErgo: '1234' } }).settings.relirePhrasesEnfants).toBe(true)
    expect(normalizeAppData({ version: 5, profiles: [], settings: { relirePhrasesEnfants: false } }).settings.relirePhrasesEnfants).toBe(false)
  })

  it('considère les anciennes parties comme terminées et garde une partie arrêtée', () => {
    const r = (id: string, extra: object) => ({ id, profileId: 'p', jeu: 'quiz', date: '2026-10-01T10:00:00Z', questions: 10, justes: 5, ...extra })
    const d = normalizeAppData({ version: 5, profiles: [profil('p', 'Léo')], resultats: [r('a', {}), r('b', { complete: false })] })
    expect(d.resultats.map((x) => x.complete)).toEqual([true, false])
  })
})

describe('vitesse de la Chasse aux lettres', () => {
  const profil = { id: 'p1', prenom: 'Léa', classe: CLASSES[0] }
  it('vaut null par défaut et reste bornée', () => {
    expect(newProfile('p', '2026-01-01', CLASSES[0]).vitesseChasse).toBeNull()
    expect(normalizeAppData({ profiles: [profil] }).profiles[0].vitesseChasse).toBeNull()
    expect(normalizeAppData({ profiles: [{ ...profil, vitesseChasse: 'vite' }] }).profiles[0].vitesseChasse).toBeNull()
    expect(normalizeAppData({ profiles: [{ ...profil, vitesseChasse: 1.2 }] }).profiles[0].vitesseChasse).toBe(1.2)
    expect(normalizeAppData({ profiles: [{ ...profil, vitesseChasse: 40 }] }).profiles[0].vitesseChasse).toBe(2.5)
  })
})
