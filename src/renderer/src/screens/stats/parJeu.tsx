// Ce qui dépend du jeu dans les statistiques : chaque `switch` traite tous les
// jeux et se termine par `jamais(...)`, pour qu'un jeu oublié soit signalé
// par le typecheck.
import type { JeuId, Profile, QuestionPerso, Resultat } from '../../../../shared/data'
import { jamais, nomJeu, ORDRE_JEUX } from '../../games/jeux'
import { vitesse } from '../../games/dactylo/engine'
import { type Indicateur, versCsv } from './commun'
import { COLONNES_COULEURS, INDICATEURS_COULEURS, StatsCouleurs } from './couleurs'
import { COLONNES_DACTYLO, INDICATEURS_DACTYLO, StatsDactylo } from './dactylo'
import { COLONNES_ESPACE, INDICATEURS_ESPACE, StatsEspace } from './espace'
import { colonnesMemoire, INDICATEURS_MEMOIRE, resumerProgressions, StatsMemoire } from './memoire'
import { COLONNES_PETITBAC, INDICATEURS_PETITBAC, StatsPetitBac } from './petitbac'
import { COLONNES_QUIZ, INDICATEURS_QUIZ, StatsQuiz } from './quiz'

export type ResultatDe<J extends JeuId> = Extract<Resultat, { jeu: J }>

export function partiesDe<J extends JeuId>(jeu: J, resultats: Resultat[]): ResultatDe<J>[] {
  return resultats.filter((r): r is ResultatDe<J> => r.jeu === jeu)
}

// Résumé d'une partie en quelques mots (liste des patients).
export function resumePartie(r: Resultat): string {
  switch (r.jeu) {
    case 'dactylo':
      return `${vitesse(r)} frappes/min`
    case 'couleurs':
      return `${r.justes}/${r.manches} justes`
    case 'memoire':
      return `${r.trouves}/${r.mots} mots`
    case 'quiz':
      return `${r.justes}/${r.questions} bonnes réponses`
    case 'petitbac':
      return `${r.justes}/${r.categories} mots (lettre ${r.lettre})`
    case 'espace':
      return `${r.detruites} lettres attrapées`
    default:
      return jamais(r)
  }
}

// Tableau (CSV) des parties d'un jeu, dans l'ordre chronologique.
export function csvDuJeu(jeu: JeuId, resultats: Resultat[], profile: Profile): string {
  switch (jeu) {
    case 'dactylo':
      return versCsv(partiesDe(jeu, resultats), COLONNES_DACTYLO)
    case 'couleurs':
      return versCsv(partiesDe(jeu, resultats), COLONNES_COULEURS)
    case 'memoire': {
      const parties = partiesDe(jeu, resultats)
      return versCsv(parties, colonnesMemoire(resumerProgressions(parties, profile)))
    }
    case 'espace':
      return versCsv(partiesDe(jeu, resultats), COLONNES_ESPACE)
    case 'quiz':
      return versCsv(partiesDe(jeu, resultats), COLONNES_QUIZ)
    case 'petitbac':
      return versCsv(partiesDe(jeu, resultats), COLONNES_PETITBAC)
    default:
      return jamais(jeu)
  }
}

// Mesures du bilan imprimable, pour un jeu.
export function indicateursDu(jeu: JeuId): Indicateur<Resultat>[] {
  const tous = <R extends Resultat>(liste: Indicateur<R>[]) => liste as unknown as Indicateur<Resultat>[]
  switch (jeu) {
    case 'dactylo':
      return tous(INDICATEURS_DACTYLO)
    case 'couleurs':
      return tous(INDICATEURS_COULEURS)
    case 'memoire':
      return tous(INDICATEURS_MEMOIRE)
    case 'espace':
      return tous(INDICATEURS_ESPACE)
    case 'quiz':
      return tous(INDICATEURS_QUIZ)
    case 'petitbac':
      return tous(INDICATEURS_PETITBAC)
    default:
      return jamais(jeu)
  }
}

// Statistiques détaillées d'un jeu (onglet de l'écran Statistiques).
export function StatsDuJeu({
  jeu,
  resultats,
  profile,
  questionsPerso,
  onSupprimer
}: {
  jeu: JeuId
  resultats: Resultat[]
  profile: Profile
  questionsPerso: QuestionPerso[]
  onSupprimer: (r: Resultat) => void
}) {
  switch (jeu) {
    case 'dactylo':
      return <StatsDactylo parties={partiesDe(jeu, resultats)} onSupprimer={onSupprimer} />
    case 'couleurs':
      return <StatsCouleurs parties={partiesDe(jeu, resultats)} onSupprimer={onSupprimer} />
    case 'memoire':
      return <StatsMemoire parties={partiesDe(jeu, resultats)} profile={profile} onSupprimer={onSupprimer} />
    case 'espace':
      return <StatsEspace parties={partiesDe(jeu, resultats)} onSupprimer={onSupprimer} />
    case 'quiz':
      return <StatsQuiz parties={partiesDe(jeu, resultats)} questionsPerso={questionsPerso} onSupprimer={onSupprimer} />
    case 'petitbac':
      return <StatsPetitBac parties={partiesDe(jeu, resultats)} onSupprimer={onSupprimer} />
    default:
      return jamais(jeu)
  }
}

// Toutes les parties d'un enfant dans un seul tableau : un bloc par jeu
// (titre, puis ses colonnes), séparés par une ligne vide.
export function csvComplet(profile: Profile, resultats: Resultat[], aujourdhui = new Date()): string {
  const blocs = ORDRE_JEUX.filter((jeu) => resultats.some((r) => r.jeu === jeu)).map(
    (jeu) => `"${nomJeu(jeu)}"\r\n${csvDuJeu(jeu, resultats, profile)}`
  )
  const entete = `"Statistiques de ${profile.prenom.replace(/"/g, '""')} (${profile.classe}), exportées le ${aujourdhui.toLocaleDateString('fr-FR')}"`
  return [entete, ...blocs].join('\r\n\r\n')
}
