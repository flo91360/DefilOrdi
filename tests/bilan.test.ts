import { describe, expect, it } from 'vitest'
import type { Resultat, ResultatDactylo, ResultatQuiz } from '../src/shared/data'
import { JEUX, nomJeu, ORDRE_JEUX } from '../src/renderer/src/games/jeux'
import { calculerBilan, jourLocal } from '../src/renderer/src/screens/stats/bilan'
import { csvComplet, partiesDe, resumePartie } from '../src/renderer/src/screens/stats/parJeu'
import { newProfile } from '../src/shared/data'

// Midi UTC : même jour local quel que soit le fuseau du PC de test (à 12 h près).
const date = (jour: string) => `${jour}T12:00:00.000Z`

const dactylo = (jour: string, frappes: number): ResultatDactylo => ({
  id: `d-${jour}`,
  profileId: 'p',
  jeu: 'dactylo',
  date: date(jour),
  listeNom: 'Liste',
  phrases: 5,
  dureeMs: 60000,
  caracteres: frappes,
  frappes,
  erreurs: 0,
  erreursParTouche: {}
})

const quiz = (jour: string, justes: number): ResultatQuiz => ({
  id: `q-${jour}`,
  profileId: 'p',
  jeu: 'quiz',
  date: date(jour),
  themeNom: 'Le matériel',
  dureeMs: 30000,
  questions: 10,
  justes,
  ratees: []
})

describe('liste des jeux', () => {
  it('donne un nom à chaque jeu, dans l’ordre du Hub', () => {
    expect(ORDRE_JEUX).toEqual(['espace', 'memoire', 'couleurs', 'petitbac', 'dactylo', 'quiz'])
    for (const j of ORDRE_JEUX) expect(nomJeu(j)).toBe(JEUX[j].titre)
  })

  it('résume une partie de chaque jeu', () => {
    expect(resumePartie(dactylo('2026-09-01', 120))).toBe('120 frappes/min')
    expect(resumePartie(quiz('2026-09-01', 7))).toBe('7/10 bonnes réponses')
  })
})

describe('bilan imprimable', () => {
  const resultats: Resultat[] = [
    dactylo('2026-09-01', 100),
    dactylo('2026-09-02', 120),
    dactylo('2026-09-03', 140),
    dactylo('2026-09-04', 160),
    dactylo('2026-09-05', 180),
    dactylo('2026-09-06', 200),
    dactylo('2026-09-07', 220),
    quiz('2026-09-07', 6)
  ]

  it('compare la moyenne des 3 premières et des 3 dernières parties de la période', () => {
    const b = calculerBilan(resultats, '2026-09-01', '2026-09-30')
    expect(b.parties).toBe(8)
    expect(b.jours).toBe(7)
    expect(b.jeux.map((j) => j.jeu)).toEqual(['dactylo', 'quiz'])
    const vitesse = b.jeux[0].lignes[0]
    expect(vitesse).toMatchObject({ nom: 'Vitesse', debut: 120, fin: 200, meilleur: 220, progres: true })
  })

  it('ne parle pas d’évolution avec une seule partie', () => {
    const b = calculerBilan(resultats, '2026-09-01', '2026-09-30')
    expect(b.jeux[1].lignes[0]).toMatchObject({ debut: 60, fin: 60, progres: null })
  })

  it('ne garde que les parties de la période, bornes comprises', () => {
    const b = calculerBilan(resultats, '2026-09-02', '2026-09-03')
    expect(b.parties).toBe(2)
    expect(b.jeux[0].lignes[0]).toMatchObject({ debut: 120, fin: 140 })
    expect(calculerBilan(resultats, '2026-10-01', '2026-10-31').jeux).toEqual([])
  })

  it('compte les médailles gagnées dans la période', () => {
    const medailles = [{ niveau: 1, date: date('2026-09-02') }, { niveau: 2, date: date('2026-10-02') }]
    expect(calculerBilan(resultats, '2026-09-01', '2026-09-30', medailles).medailles).toBe(1)
  })

  it('traite un temps plus court comme un progrès', () => {
    const couleurs = (jour: string, dureeMs: number): Resultat => ({
      id: jour, profileId: 'p', jeu: 'couleurs', date: date(jour), mode: 'mot', manches: 10, justes: 10,
      dureeMs, piegesJustes: 0, pieges: 0, indices: 0, minutes: 0
    })
    const b = calculerBilan([couleurs('2026-09-01', 30000), couleurs('2026-09-02', 20000)], '2026-09-01', '2026-09-30')
    const temps = b.jeux[0].lignes.find((l) => l.unite === 's')!
    expect(temps).toMatchObject({ debut: 3, fin: 2, meilleur: 2, progres: true })
  })

  it('date les parties au jour local', () => {
    expect(jourLocal(new Date(2026, 8, 5, 23, 30))).toBe('2026-09-05')
  })
})

describe('export complet', () => {
  it('met un bloc par jeu joué, avec ses colonnes', () => {
    const profil = { ...newProfile('p', date('2026-01-01'), 'CM1'), prenom: 'Léo' }
    const csv = csvComplet(profil, [dactylo('2026-09-01', 100), quiz('2026-09-02', 7)], new Date(2026, 9, 19))
    const blocs = csv.split('\r\n\r\n')
    expect(blocs[0]).toBe('"Statistiques de Léo (CM1), exportées le 19/10/2026"')
    expect(blocs[1].split('\r\n')[0]).toBe('"Dactylo"')
    expect(blocs[1]).toContain('"Frappes/min"')
    expect(blocs[2].split('\r\n')[0]).toBe('"Quiz de l’ordinateur"')
    expect(blocs).toHaveLength(3)
    expect(partiesDe('quiz', [dactylo('2026-09-01', 1), quiz('2026-09-02', 7)])).toHaveLength(1)
  })
})
