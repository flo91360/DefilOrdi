import { describe, expect, it } from 'vitest'
import {
  avancerProgression,
  enGras,
  formatLimite,
  lettreEnCours,
  lettresDuNiveau,
  lettresHesitees,
  NIVEAUX_KLAVICOEUR,
  nouvellePartie,
  partieFinie,
  placer,
  RANGEES_KLAVICOEUR,
  zoneDe
} from '../src/renderer/src/games/klavicoeur/engine'
import { GROUPE_KLAVICOEUR } from '../src/renderer/src/screens/stats/klavicoeur'
import { resumePartie } from '../src/renderer/src/screens/stats/parJeu'
import { calculerBilan } from '../src/renderer/src/screens/stats/calculBilan'
import { defaultProgressionKlavicoeur, newProfile, normalizeAppData, type ResultatKlavicoeur } from '../src/shared/data'

describe('Klavicoeur : clavier et code couleur', () => {
  it('a les trois rangées demandées, sans chiffres', () => {
    expect(RANGEES_KLAVICOEUR.map((r) => r.join(''))).toEqual(['AZERTYUIOP', 'QSDFGHJKLM', 'WXCVBN'])
  })

  it('colore chaque lettre selon la main', () => {
    const par = (zone: string) =>
      RANGEES_KLAVICOEUR.flat()
        .filter((l) => zoneDe(l) === zone)
        .sort()
        .join('')
    expect(par('gauche')).toBe([...'AZERQSDFWXC'].sort().join(''))
    expect(par('droite')).toBe([...'UIOPJKLMNB'].sort().join(''))
    expect(par('milieu')).toBe([...'TGVYH'].sort().join(''))
    expect(zoneDe('B')).toBe('droite')
  })

  it('met seulement T, G et V en gras', () => {
    expect(RANGEES_KLAVICOEUR.flat().filter(enGras).sort()).toEqual(['G', 'T', 'V'])
  })
})

describe('Klavicoeur : niveaux', () => {
  it('suit la progression des 11 niveaux', () => {
    expect(NIVEAUX_KLAVICOEUR.map((n) => [n.numero, n.rangees, n.tempsLimite])).toEqual([
      [1, [0], 0],
      [2, [0], 90],
      [3, [1], 0],
      [4, [1], 90],
      [5, [2], 0],
      [6, [2], 90],
      [7, [0, 1], 180],
      [8, [1, 2], 180],
      [9, [0, 1, 2], 240],
      [10, [0, 1, 2], 180],
      [11, [0, 1, 2], 120]
    ])
    expect(lettresDuNiveau(8)).toHaveLength(16)
    expect(lettresDuNiveau(11)).toHaveLength(26)
  })

  it('écrit les limites de temps simplement', () => {
    expect(formatLimite(90)).toBe('1 min 30')
    expect(formatLimite(180)).toBe('3 min')
    expect(formatLimite(0)).toBe('Sans limite de temps')
  })
})

describe('Klavicoeur : partie', () => {
  it('mélange les lettres du niveau', () => {
    const p = nouvellePartie(5, () => 0.3)
    expect([...p.pioche].sort()).toEqual(['B', 'C', 'N', 'V', 'W', 'X'])
  })

  it('met de côté une lettre mal placée, la compte comme hésitation et la repropose à la fin', () => {
    let etat = { ...nouvellePartie(5), pioche: ['W', 'X', 'C'] }
    let r = placer(etat, 'C') // W posé sur le C : mis de côté
    expect(r.juste).toBe(false)
    etat = r.etat
    expect(etat.deCote).toEqual(['W'])
    expect(etat.hesitations).toBe(1)
    expect(lettreEnCours(etat)).toBe('X')
    etat = placer(etat, 'X').etat
    etat = placer(etat, 'C').etat
    // Toutes les lettres proposées : le W revient.
    expect(etat.rattrapage).toBe(true)
    expect(lettreEnCours(etat)).toBe('W')
    r = placer(etat, 'X') // emplacement déjà rempli : ignoré
    expect(r.etat).toBe(etat)
    etat = placer(etat, 'V').etat // encore faux
    expect(etat.hesitations).toBe(2)
    expect(etat.hesitationsParLettre).toEqual({ W: 2 })
    expect(lettreEnCours(etat)).toBe('W')
    etat = placer(etat, 'W').etat
    expect(partieFinie(etat)).toBe(true)
    expect(etat.placees.sort()).toEqual(['C', 'W', 'X'])
    expect(lettresHesitees(etat.hesitationsParLettre)).toEqual([['W', 2]])
  })
})

describe('Klavicoeur : progression', () => {
  it('débloque le niveau suivant quand le niveau est validé', () => {
    const a = avancerProgression(defaultProgressionKlavicoeur(), 1, true)
    expect(a.progression).toEqual({ debloque: 2, niveau: 2, echecs: 0 })
    expect(a.changement).toBe('debloque')
    // Rejouer un niveau déjà réussi ne débloque rien de plus.
    const b = avancerProgression({ debloque: 5, niveau: 5, echecs: 0 }, 2, true)
    expect(b.progression).toEqual({ debloque: 5, niveau: 3, echecs: 0 })
    expect(b.changement).toBe('suivant')
    expect(avancerProgression({ debloque: 11, niveau: 11, echecs: 0 }, 11, true).progression.niveau).toBe(11)
  })

  it('fait rejouer après un temps dépassé, puis redescend au deuxième', () => {
    const p1 = avancerProgression({ debloque: 4, niveau: 4, echecs: 0 }, 4, false)
    expect(p1.progression).toEqual({ debloque: 4, niveau: 4, echecs: 1 })
    expect(p1.changement).toBe('rejoue')
    const p2 = avancerProgression(p1.progression, 4, false)
    expect(p2.progression).toEqual({ debloque: 4, niveau: 3, echecs: 0 })
    expect(p2.changement).toBe('descend')
  })

  it('une réussite remet les échecs à zéro', () => {
    const p = avancerProgression({ debloque: 4, niveau: 4, echecs: 1 }, 4, true)
    expect(p.progression.echecs).toBe(0)
  })
})

const partie = (jour: string, niveau: number, hesitations: number, dureeMs: number): ResultatKlavicoeur => ({
  id: `k-${jour}`,
  profileId: 'p',
  jeu: 'klavicoeur',
  date: `${jour}T12:00:00.000Z`,
  complete: true,
  niveau,
  tempsLimite: 90,
  dureeMs,
  lettres: 10,
  placees: 10,
  hesitations,
  hesitationsParLettre: hesitations > 0 ? { A: hesitations } : {},
  reussi: true,
  tempsDepasse: false,
  niveauSuivant: niveau + 1
})

describe('Klavicoeur : données et bilan', () => {
  it('garde la progression du profil et les parties', () => {
    const p = { ...newProfile('p', '2026-01-01T00:00:00.000Z', 'CM1'), prenom: 'Léa', klavicoeur: { debloque: 6, niveau: 5, echecs: 1 } }
    const data = normalizeAppData({ version: 5, profiles: [p], resultats: [partie('2026-09-01', 2, 3, 60000)] })
    expect(data.profiles[0].klavicoeur).toEqual({ debloque: 6, niveau: 5, echecs: 1 })
    expect(data.resultats).toEqual([partie('2026-09-01', 2, 3, 60000)])
  })

  it('remet une progression invalide ou absente au niveau 1', () => {
    const p = { ...newProfile('p', '2026-01-01T00:00:00.000Z', 'CM1'), prenom: 'Léa' } as Record<string, unknown>
    delete p.klavicoeur
    expect(normalizeAppData({ version: 5, profiles: [p] }).profiles[0].klavicoeur).toEqual(defaultProgressionKlavicoeur())
    const q = { ...p, klavicoeur: { debloque: 3, niveau: 9, echecs: 7 } }
    expect(normalizeAppData({ version: 5, profiles: [q] }).profiles[0].klavicoeur).toEqual({ debloque: 3, niveau: 3, echecs: 1 })
  })

  it('montre le temps, les hésitations et le niveau dans le bilan', () => {
    const resultats = [partie('2026-09-01', 2, 4, 80000), partie('2026-09-02', 2, 1, 50000)]
    expect(resumePartie(resultats[0])).toBe('niveau 2, 4 hésitations')
    const bilan = calculerBilan(resultats, '2026-09-01', '2026-09-30')
    const jeu = bilan.jeux.find((j) => j.jeu === 'klavicoeur')
    expect(jeu?.groupes.map((g) => g.nom)).toEqual([GROUPE_KLAVICOEUR(resultats[0])])
    expect(jeu?.groupes[0].nom).toContain('Niveau 2')
    expect(jeu?.groupes[0].lignes.map((l) => [l.nom, l.debut, l.fin, l.progres])).toEqual([
      ['Temps', 80, 50, true],
      ['Hésitations', 4, 1, true]
    ])
  })
})
