import type { JeuId } from '../../../shared/data'

// Liste unique des jeux : nom et description, et ordre d'affichage (Hub,
// onglets des statistiques, bilan). Un jeu ajouté à l'union Resultat
// (src/shared/data.ts) doit figurer ici : sinon le typecheck échoue, ici et
// dans chaque `switch` qui se termine par `jamais(...)` (écran du jeu dans
// App.tsx, résumé et statistiques dans screens/stats/).
export interface InfoJeu {
  titre: string
  description: string
}

export const JEUX: Record<JeuId, InfoJeu> = {
  espace: {
    titre: 'Chasse aux lettres',
    description: 'Fusée, cow-boy ou sous-marin : attrape les lettres avant qu’elles ne tombent.'
  },
  memoire: {
    titre: 'Mots à retenir',
    description: 'Mémorise une liste de mots, puis retape-les de tête.'
  },
  couleurs: {
    titre: 'Couleurs piégées',
    description: 'Le mot ou sa couleur ? Ne te laisse pas piéger !'
  },
  petitbac: {
    titre: 'Petit bac',
    description: 'Une lettre au hasard : trouve un mot pour chaque catégorie.'
  },
  klavicoeur: {
    titre: 'Klavicoeur',
    description: 'Le clavier est caché : place chaque lettre à sa place avec la souris.'
  },
  dactylo: {
    titre: 'Dactylo',
    description: 'Tape les phrases le plus juste et le plus vite possible.'
  },
  quiz: {
    titre: 'Quiz de l’ordinateur',
    description: 'Vrai ou faux, QCM et mises en situation sur de vrais écrans.'
  }
}

// Ordre d'affichage : celui des clés de JEUX.
export const ORDRE_JEUX = Object.keys(JEUX) as JeuId[]

export function nomJeu(jeu: JeuId): string {
  return JEUX[jeu].titre
}

// Fin d'un `switch` qui traite chaque jeu : le typecheck signale un cas oublié.
export function jamais(valeur: never): never {
  throw new Error(`Cas non prévu : ${String(valeur)}`)
}
