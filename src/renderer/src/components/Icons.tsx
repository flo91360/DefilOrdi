// Petites icônes au trait, en SVG, qui prennent la couleur du texte.
import type { ReactNode } from 'react'

function Icon({ children, size = 22 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

type P = { size?: number }

export const IconLock = ({ size }: P) => (
  <Icon size={size}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </Icon>
)

export const IconPlus = ({ size }: P) => (
  <Icon size={size}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
)

export const IconBack = ({ size }: P) => (
  <Icon size={size}>
    <path d="M15 6l-6 6 6 6" />
  </Icon>
)

export const IconNext = ({ size }: P) => (
  <Icon size={size}>
    <path d="M9 6l6 6-6 6" />
  </Icon>
)

export const IconPencil = ({ size }: P) => (
  <Icon size={size}>
    <path d="M4 20h4L19 9l-4-4L4 16v4z" />
    <path d="M13.5 6.5l4 4" />
  </Icon>
)

export const IconUsers = ({ size }: P) => (
  <Icon size={size}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5" />
    <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c1.8.8 3 2.5 3.5 5.2" />
  </Icon>
)

export const IconFullscreen = ({ size }: P) => (
  <Icon size={size}>
    <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
  </Icon>
)

export const IconSpeaker = ({ size }: P) => (
  <Icon size={size}>
    <path d="M4 10v4h4l5 4V6L8 10H4z" />
    <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
  </Icon>
)

export const IconTrash = ({ size }: P) => (
  <Icon size={size}>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
  </Icon>
)

export const IconCheck = ({ size }: P) => (
  <Icon size={size}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Icon>
)

export const IconFolder = ({ size }: P) => (
  <Icon size={size}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
  </Icon>
)

export const IconDownload = ({ size }: P) => (
  <Icon size={size}>
    <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
  </Icon>
)

export const IconUpload = ({ size }: P) => (
  <Icon size={size}>
    <path d="M12 15V4M7 9l5-5 5 5M5 20h14" />
  </Icon>
)

export const IconChart = ({ size }: P) => (
  <Icon size={size}>
    <path d="M4 20V4M4 20h16" />
    <path d="M7 15l4-4 3 3 5-6" />
  </Icon>
)

export const IconSettings = ({ size }: P) => (
  <Icon size={size}>
    <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="10" cy="17" r="2" />
  </Icon>
)

// Illustrations des jeux (plus grandes, en couleur pleine).
export function GameArt({ game }: { game: string }) {
  switch (game) {
    case 'dactylo':
      return (
        <svg viewBox="0 0 120 80" aria-hidden="true">
          <rect x="6" y="18" width="108" height="56" rx="10" fill="var(--tile-ink)" opacity="0.9" />
          {[0, 1, 2].map((row) =>
            Array.from({ length: 9 - row }, (_, i) => (
              <rect
                key={`${row}-${i}`}
                x={14 + row * 5 + i * 11}
                y={26 + row * 13}
                width="8"
                height="9"
                rx="2"
                fill="#ffffff"
                opacity={row === 1 && i === 3 ? 1 : 0.75}
              />
            ))
          )}
          <rect x="34" y="63" width="52" height="6" rx="3" fill="#ffffff" opacity="0.75" />
          <rect x="44" y="4" width="34" height="10" rx="5" fill="var(--tile-ink)" opacity="0.5" />
        </svg>
      )
    case 'memoire':
      return (
        <svg viewBox="0 0 120 80" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${16 + i * 30} ${12 + (i % 2) * 8}) rotate(${-8 + i * 8} 22 28)`}>
              <rect width="40" height="54" rx="7" fill="#ffffff" stroke="var(--tile-ink)" strokeWidth="3" />
              <rect x="8" y="14" width="24" height="5" rx="2.5" fill="var(--tile-ink)" opacity="0.8" />
              <rect x="8" y="25" width="18" height="5" rx="2.5" fill="var(--tile-ink)" opacity="0.5" />
              <rect x="8" y="36" width="21" height="5" rx="2.5" fill="var(--tile-ink)" opacity="0.5" />
            </g>
          ))}
        </svg>
      )
    case 'couleurs':
      return (
        <svg viewBox="0 0 120 80" aria-hidden="true">
          <text x="10" y="34" fontSize="24" fontWeight="900" fill="#2f8fd9" fontFamily="inherit">
            ROUGE
          </text>
          <text x="34" y="66" fontSize="24" fontWeight="900" fill="#e2504c" fontFamily="inherit">
            BLEU
          </text>
        </svg>
      )
    case 'espace':
      return (
        <svg viewBox="0 0 120 80" aria-hidden="true">
          {/* fusée */}
          <path d="M22 14 Q30 24 28 44 L16 44 Q14 24 22 14 Z" fill="#ffffff" stroke="var(--tile-ink)" strokeWidth="2.5" />
          <path d="M22 14 Q27 19 27.5 24 L16.5 24 Q17 19 22 14 Z" fill="var(--tile-ink)" />
          <circle cx="22" cy="31" r="3.5" fill="#7dd3fc" stroke="var(--tile-ink)" strokeWidth="1.5" />
          <path d="M18 44 L22 54 L26 44 Z" fill="#ffb347" />
          {/* bouteille */}
          <rect x="56" y="10" width="6" height="5" rx="1" fill="#b07a42" />
          <path d="M55 15 h8 v8 q8 3 8 9 v20 q0 3 -3 3 h-18 q-3 0 -3 -3 v-20 q0 -6 8 -9 z" fill="#2f9e44" opacity="0.9" stroke="var(--tile-ink)" strokeWidth="2" />
          <rect x="51" y="35" width="16" height="12" rx="2" fill="#f7ecd2" />
          <text x="59" y="45" textAnchor="middle" fontSize="10" fontWeight="900" fill="#3b2412" fontFamily="inherit">K</text>
          {/* poisson */}
          <path d="M86 52 l-8 -7 l0 14 z" fill="#ff6b00" />
          <ellipse cx="96" cy="52" rx="13" ry="9" fill="#ff8c2b" stroke="var(--tile-ink)" strokeWidth="2" />
          <rect x="91" y="43" width="4" height="18" fill="#ffffff" />
          <circle cx="103" cy="50" r="2" fill="#111827" />
          <circle cx="104" cy="30" r="3" fill="none" stroke="var(--tile-ink)" strokeWidth="1.5" />
          <circle cx="98" cy="22" r="2" fill="none" stroke="var(--tile-ink)" strokeWidth="1.5" />
          <path d="M8 70 H112" stroke="var(--tile-ink)" strokeWidth="2" strokeDasharray="4 5" opacity="0.5" />
        </svg>
      )
    case 'quiz':
      return (
        <svg viewBox="0 0 120 80" aria-hidden="true">
          <rect x="14" y="8" width="64" height="44" rx="10" fill="var(--tile-ink)" />
          <path d="M30 52l-6 14 18-14" fill="var(--tile-ink)" />
          <text x="46" y="42" textAnchor="middle" fontSize="32" fontWeight="900" fill="#ffffff" fontFamily="inherit">
            ?
          </text>
          <rect x="70" y="30" width="40" height="40" rx="8" fill="#ffffff" stroke="var(--tile-ink)" strokeWidth="3" />
          <path d="M79 50l7 7 14-15" fill="none" stroke="var(--tile-ink)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'petitbac':
      return (
        <svg viewBox="0 0 120 80" aria-hidden="true">
          <rect x="44" y="6" width="70" height="68" rx="8" fill="#ffffff" stroke="var(--tile-ink)" strokeWidth="3" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x="51" y={15 + i * 14} width="18" height="5" rx="2.5" fill="var(--tile-ink)" opacity="0.8" />
              <path d={`M74 ${21 + i * 14} H${i === 3 ? 92 : 106}`} stroke="var(--tile-ink)" strokeWidth="2" opacity="0.35" />
            </g>
          ))}
          <path d="M96 13l3 3 6-6M96 41l3 3 6-6" fill="none" stroke="var(--tile-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="22" cy="40" r="19" fill="var(--tile-ink)" />
          <text x="22" y="50" textAnchor="middle" fontSize="28" fontWeight="900" fill="#ffffff" fontFamily="inherit">
            B
          </text>
        </svg>
      )
    default:
      return null
  }
}
