import type { CSSProperties } from 'react'
import type { Profile } from '../../shared/data'
import { inkOf, lighten, textOn } from './color'

// Variables CSS qui colorent l'interface avec les couleurs préférées de l'enfant.
export function themeStyle(p: Pick<Profile, 'couleurPrincipale' | 'couleurSecondaire'>): CSSProperties {
  return {
    '--accent': p.couleurPrincipale,
    '--accent-soft': lighten(p.couleurPrincipale, 0.82),
    '--accent-ink': inkOf(p.couleurPrincipale),
    '--on-accent': textOn(p.couleurPrincipale),
    '--accent-2': p.couleurSecondaire,
    '--accent-2-soft': lighten(p.couleurSecondaire, 0.75),
    '--accent-2-ink': inkOf(p.couleurSecondaire)
  } as CSSProperties
}
