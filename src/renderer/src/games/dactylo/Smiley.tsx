import { type Smiley, TEXTES_SMILEY } from './seuils'

const COULEURS: Record<Exclude<Smiley, 'etoile'>, string> = {
  rouge: '#e2504c',
  orange: '#f08a2c',
  vert: '#3fae7a'
}

// Smiley coloré : toujours souriant, même en rouge, pour rester encourageant.
// La grande réussite est une étoile jaune.
export function SmileyIcone({ smiley, quoi, size = 30 }: { smiley: Smiley; quoi: string; size?: number }) {
  const titre = `${quoi} : ${TEXTES_SMILEY[smiley]}`
  if (smiley === 'etoile') {
    return (
      <span className="smiley smiley-etoile" role="img" aria-label={titre} title={titre} style={{ fontSize: size * 0.9 }}>
        🌟
      </span>
    )
  }
  const sourire = smiley === 'rouge' ? 'M11 22 Q16 24.5 21 22' : smiley === 'orange' ? 'M10.5 21 Q16 25.5 21.5 21' : 'M9.5 19.5 Q16 27 22.5 19.5'
  return (
    <svg className={`smiley smiley-${smiley}`} width={size} height={size} viewBox="0 0 32 32" role="img" aria-label={titre}>
      <title>{titre}</title>
      <circle cx="16" cy="16" r="15" fill={COULEURS[smiley]} />
      <circle cx="11" cy="13" r="2.2" fill="#2b2220" />
      <circle cx="21" cy="13" r="2.2" fill="#2b2220" />
      <path d={sourire} stroke="#2b2220" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>
  )
}
