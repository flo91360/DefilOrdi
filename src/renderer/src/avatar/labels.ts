import type { AvatarConfig } from '../../../shared/data'

// Libellés affichés dans l'éditeur de personnage.
export const LABELS: Record<string, string> = {
  personnage: 'Personnage',
  robot: 'Robot',
  courts: 'Courts',
  bataille: 'En bataille',
  longs: 'Longs',
  queue: 'Queue de cheval',
  boucles: 'Bouclés',
  chignon: 'Chignon',
  rase: 'Très courts',
  ronds: 'Ronds',
  joyeux: 'Joyeux',
  malicieux: 'Clin d’œil',
  sourire: 'Sourire',
  rire: 'Grand sourire',
  calme: 'Calme',
  tshirt: 'T-shirt',
  capuche: 'Sweat à capuche',
  chemise: 'Chemise',
  aucun: 'Aucun',
  lunettes: 'Lunettes',
  soleil: 'Lunettes de soleil',
  casque: 'Casque audio',
  casquette: 'Casquette',
  bandeau: 'Bandeau',
  carree: 'Carrée',
  ronde: 'Ronde',
  boule: 'Une antenne',
  double: 'Deux antennes',
  eclair: 'Éclair',
  aucune: 'Aucune',
  carres: 'Carrés',
  visiere: 'Visière'
}

export type AvatarKey = keyof AvatarConfig

export interface AvatarSection {
  key: AvatarKey
  title: string
  kind: 'choice' | 'color'
}

export const PERSONNAGE_SECTIONS: AvatarSection[] = [
  { key: 'peau', title: 'Couleur de peau', kind: 'color' },
  { key: 'coiffure', title: 'Coiffure', kind: 'choice' },
  { key: 'cheveux', title: 'Couleur des cheveux', kind: 'color' },
  { key: 'yeux', title: 'Yeux', kind: 'choice' },
  { key: 'bouche', title: 'Bouche', kind: 'choice' },
  { key: 'tenue', title: 'Vêtement', kind: 'choice' },
  { key: 'couleurTenue', title: 'Couleur du vêtement', kind: 'color' },
  { key: 'accessoire', title: 'Accessoire', kind: 'choice' }
]

export const ROBOT_SECTIONS: AvatarSection[] = [
  { key: 'couleurRobot', title: 'Couleur', kind: 'color' },
  { key: 'tete', title: 'Forme de la tête', kind: 'choice' },
  { key: 'antenne', title: 'Antenne', kind: 'choice' },
  { key: 'ecran', title: 'Yeux', kind: 'choice' },
  { key: 'couleurLed', title: 'Couleur des lumières', kind: 'color' }
]
