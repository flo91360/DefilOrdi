// Les trois aventures du jeu « Chasse aux lettres ». La logique est la même
// (des lettres tombent, il faut les taper) ; seuls le décor, les sons et
// les mots changent.

import type { ThemeChasse } from '../../../../shared/data'
import type { Couleurs, SceneTheme } from './scenes/base'
import { Ocean } from './scenes/Ocean'
import { Spatial } from './scenes/Spatial'
import { Western } from './scenes/Western'

export interface ThemeJeu {
  id: ThemeChasse
  nom: string
  description: string
  consigne: string
  objets: string // ce qui tombe, au pluriel
  compteur: string // libellé du compteur de réussites
  tombees: string // libellé du compteur des objets ratés
  reussites: (n: number) => string // « 12 météorites détruites »
  parfait: string // message de fin quand rien n'est tombé
  sons: { toucher: string[]; rater: string; sol: string }
  classe: string // classe CSS de l'écran de jeu
  creer: (c: Couleurs) => SceneTheme
}

const pluriel = (n: number, singulier: string, plurielTexte: string) => (n > 1 ? plurielTexte : singulier)

export const THEMES_JEU: ThemeJeu[] = [
  {
    id: 'espace',
    nom: 'Mission spatiale',
    description: 'Pilote ta fusée et pulvérise les météorites au laser avant qu’elles ne touchent la planète.',
    consigne: 'Tape la lettre de la météorite pour tirer dessus au laser.',
    objets: 'météorites',
    compteur: 'Détruites',
    tombees: 'Tombées',
    reussites: (n) => pluriel(n, 'météorite détruite', 'météorites détruites'),
    parfait: 'Aucune météorite n’a touché la planète !',
    sons: { toucher: ['laser', 'explosion'], rater: 'pfft', sol: 'impact' },
    classe: 'theme-espace',
    creer: (c) => new Spatial(c)
  },
  {
    id: 'western',
    nom: 'Stand de tir',
    description: 'Deviens un cow-boy et casse les bouteilles en verre avant qu’elles n’arrivent sur le comptoir.',
    consigne: 'Tape la lettre de la bouteille pour tirer dessus avec ton revolver.',
    objets: 'bouteilles',
    compteur: 'Cassées',
    tombees: 'Ratées',
    reussites: (n) => pluriel(n, 'bouteille cassée', 'bouteilles cassées'),
    parfait: 'Aucune bouteille n’est arrivée sur le comptoir !',
    sons: { toucher: ['tir'], rater: 'ricochet', sol: 'clonk' },
    classe: 'theme-western',
    creer: (c) => new Western(c)
  },
  {
    id: 'ocean',
    nom: 'Plongée sous-marine',
    description: 'Avec ton sous-marin, récupère les poissons, coquillages et trésors avant qu’ils ne s’enfoncent dans le sable.',
    consigne: 'Tape la lettre de l’objet pour l’attraper avec le rayon de ton sous-marin.',
    objets: 'trésors',
    compteur: 'Trésors',
    tombees: 'Perdus',
    reussites: (n) => pluriel(n, 'trésor récupéré', 'trésors récupérés'),
    parfait: 'Aucun trésor perdu dans le sable !',
    sons: { toucher: ['aspire'], rater: 'bloup', sol: 'sable' },
    classe: 'theme-ocean',
    creer: (c) => new Ocean(c)
  }
]

export function themeJeu(id: ThemeChasse): ThemeJeu {
  return THEMES_JEU.find((t) => t.id === id) ?? THEMES_JEU[0]
}
