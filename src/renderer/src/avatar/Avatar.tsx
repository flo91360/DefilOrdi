import { useId } from 'react'
import type { AvatarConfig } from '../../../shared/data'
import { darken, lighten } from '../color'

// Personnage dessiné en SVG par calques (fond, cheveux arrière, corps, tête,
// visage, cheveux avant, accessoire). Repère : carré de 200 × 200.

interface Props {
  config: AvatarConfig
  fond: string
  size?: number | string
  title?: string
  // Recadre sur le visage (vignettes de choix)
  zoom?: boolean
}

export function Avatar({ config, fond, size = 160, title, zoom }: Props) {
  const clip = useId()
  return (
    <svg
      viewBox={zoom ? '24 12 152 152' : '0 0 200 200'}
      width={size}
      height={size}
      {...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true })}
    >
      <defs>
        <clipPath id={clip}>
          <circle cx="100" cy="100" r="100" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect width="200" height="200" fill={lighten(fond, 0.55)} />
        <circle cx="100" cy="210" r="120" fill={lighten(fond, 0.35)} />
        {config.style === 'robot' ? <Robot c={config} /> : <Personnage c={config} />}
      </g>
    </svg>
  )
}

const INK = '#2a2433'

function Personnage({ c }: { c: AvatarConfig }) {
  const skinShade = darken(c.peau, 0.12)
  return (
    <g>
      <HairBack c={c} />
      <Body c={c} />
      <rect x="88" y="112" width="24" height="34" rx="8" fill={skinShade} />
      <circle cx="62" cy="94" r="9" fill={c.peau} />
      <circle cx="138" cy="94" r="9" fill={c.peau} />
      <ellipse cx="100" cy="88" rx="38" ry="42" fill={c.peau} />
      <Face c={c} />
      <HairFront c={c} />
      <Accessory c={c} />
    </g>
  )
}

function Body({ c }: { c: AvatarConfig }) {
  const col = c.couleurTenue
  const shade = darken(col, 0.18)
  const torso = 'M28 205 C28 162 58 140 100 140 C142 140 172 162 172 205 Z'
  if (c.tenue === 'capuche') {
    return (
      <g>
        <path d={torso} fill={col} />
        <path d="M66 146 C70 128 84 124 100 132 C116 124 130 128 134 146 C122 156 78 156 66 146 Z" fill={shade} />
        <path d="M80 146 C86 140 114 140 120 146 C112 152 88 152 80 146 Z" fill={darken(col, 0.35)} />
        <path d="M92 150 L90 176 M108 150 L110 176" stroke={lighten(col, 0.6)} strokeWidth="3" strokeLinecap="round" />
        <path d="M70 205 C74 186 126 186 130 205" fill="none" stroke={shade} strokeWidth="3" />
      </g>
    )
  }
  if (c.tenue === 'chemise') {
    return (
      <g>
        <path d={torso} fill={col} />
        <path d="M100 142 L100 205" stroke={shade} strokeWidth="2" />
        {[160, 176, 192].map((y) => (
          <circle key={y} cx="100" cy={y} r="2.5" fill={shade} />
        ))}
        <path d="M84 138 L100 156 L92 164 L76 146 Z" fill="#ffffff" stroke={darken('#ffffff', 0.15)} strokeWidth="1.5" />
        <path d="M116 138 L100 156 L108 164 L124 146 Z" fill="#ffffff" stroke={darken('#ffffff', 0.15)} strokeWidth="1.5" />
      </g>
    )
  }
  return (
    <g>
      <path d={torso} fill={col} />
      <path d="M84 141 C88 154 112 154 116 141" fill="none" stroke={shade} strokeWidth="4" strokeLinecap="round" />
    </g>
  )
}

function Face({ c }: { c: AvatarConfig }) {
  const brow = darken(c.cheveux, 0.1)
  return (
    <g>
      <path d="M78 79 Q86 74 94 78 M106 78 Q114 74 122 79" fill="none" stroke={brow} strokeWidth="3.5" strokeLinecap="round" />
      <Eyes kind={c.yeux} />
      <circle cx="76" cy="106" r="7" fill="#ff7b7b" opacity="0.28" />
      <circle cx="124" cy="106" r="7" fill="#ff7b7b" opacity="0.28" />
      <path d="M97 101 Q100 104 103 101" fill="none" stroke={darken(c.peau, 0.3)} strokeWidth="2.5" strokeLinecap="round" />
      <Mouth kind={c.bouche} />
    </g>
  )
}

function Eye({ x }: { x: number }) {
  return (
    <g>
      <ellipse cx={x} cy="91" rx="5" ry="6" fill={INK} />
      <circle cx={x + 1.8} cy="88.6" r="1.8" fill="#ffffff" />
    </g>
  )
}

function ClosedEye({ x }: { x: number }) {
  return <path d={`M${x - 6} 93 Q${x} 85 ${x + 6} 93`} fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
}

function Eyes({ kind }: { kind: string }) {
  if (kind === 'joyeux') {
    return (
      <g>
        <ClosedEye x={86} />
        <ClosedEye x={114} />
      </g>
    )
  }
  if (kind === 'malicieux') {
    return (
      <g>
        <Eye x={86} />
        <path d="M108 91 Q114 95 120 91" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      </g>
    )
  }
  return (
    <g>
      <Eye x={86} />
      <Eye x={114} />
    </g>
  )
}

function Mouth({ kind }: { kind: string }) {
  if (kind === 'rire') {
    return (
      <g>
        <path d="M86 110 Q100 132 114 110 Z" fill="#7a2e3a" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M93 121 Q100 116 107 121 Q100 127 93 121 Z" fill="#f08a96" />
      </g>
    )
  }
  if (kind === 'calme') {
    return <path d="M93 114 Q100 117 107 114" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
  }
  return <path d="M88 111 Q100 122 112 111" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
}

function HairBack({ c }: { c: AvatarConfig }) {
  const col = darken(c.cheveux, 0.08)
  switch (c.coiffure) {
    case 'longs':
      return <path d="M56 90 C52 48 76 36 100 36 C124 36 148 48 144 90 L150 150 C132 160 68 160 50 150 Z" fill={col} />
    case 'queue':
      return <path d="M128 52 C162 50 170 96 156 140 C150 120 146 100 136 84 Z" fill={col} />
    case 'boucles':
      return (
        <g fill={col}>
          {[
            [58, 70, 22], [72, 48, 22], [100, 38, 24], [128, 48, 22], [142, 70, 22],
            [52, 98, 18], [148, 98, 18], [56, 122, 15], [144, 122, 15]
          ].map(([x, y, r]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
          ))}
        </g>
      )
    case 'chignon':
      return <circle cx="100" cy="38" r="17" fill={col} />
    default:
      return null
  }
}

function HairFront({ c }: { c: AvatarConfig }) {
  const col = c.cheveux
  switch (c.coiffure) {
    case 'courts':
      return <path d="M61 86 C56 50 80 40 100 40 C122 40 146 50 139 86 C134 72 124 62 112 60 C104 66 88 68 74 66 C68 72 63 78 61 86 Z" fill={col} />
    case 'bataille':
      return (
        <path
          d="M60 86 C56 56 66 44 76 40 L78 32 L88 38 L96 28 L104 37 L114 29 L120 40 L130 36 L130 46 C142 54 144 70 140 86 C134 74 126 66 118 64 L112 70 L104 62 L96 70 L88 63 L80 70 C72 72 64 78 60 86 Z"
          fill={col}
        />
      )
    case 'longs':
      return <path d="M60 92 C56 52 78 40 100 40 C122 40 144 52 140 92 C136 76 128 62 116 56 C106 66 86 70 70 70 C64 76 62 84 60 92 Z" fill={col} />
    case 'queue':
      return <path d="M61 86 C56 50 80 40 100 40 C122 40 146 50 139 86 C134 70 120 58 100 58 C82 58 66 70 61 86 Z" fill={col} />
    case 'boucles':
      return (
        <g fill={col}>
          {[[72, 62, 12], [86, 56, 12], [100, 54, 12], [114, 56, 12], [128, 62, 12], [64, 74, 10], [136, 74, 10]].map(([x, y, r]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
          ))}
        </g>
      )
    case 'chignon':
      return <path d="M61 88 C56 52 80 42 100 42 C122 42 146 52 139 88 C134 72 120 60 100 60 C82 60 66 72 61 88 Z" fill={col} />
    case 'rase':
      return <path d="M63 80 C62 54 80 46 100 46 C122 46 140 54 137 80 C128 66 116 60 100 60 C84 60 70 66 63 80 Z" fill={col} opacity="0.35" />
    default:
      return null
  }
}

function Accessory({ c }: { c: AvatarConfig }) {
  const frame = '#2f3442'
  switch (c.accessoire) {
    case 'lunettes':
      return (
        <g fill="none" stroke={frame} strokeWidth="3">
          <circle cx="86" cy="91" r="11" />
          <circle cx="114" cy="91" r="11" />
          <path d="M97 90 Q100 87 103 90 M75 89 L64 86 M125 89 L136 86" />
        </g>
      )
    case 'soleil':
      return (
        <g>
          <rect x="72" y="83" width="25" height="16" rx="7" fill="#1f2330" />
          <rect x="103" y="83" width="25" height="16" rx="7" fill="#1f2330" />
          <path d="M97 89 Q100 86 103 89 M72 88 L63 85 M128 88 L137 85" fill="none" stroke="#1f2330" strokeWidth="3" />
          <path d="M77 87 L84 87 M108 87 L115 87" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        </g>
      )
    case 'casque': {
      const col = darken(c.couleurTenue, 0.1)
      return (
        <g>
          <path d="M58 94 C54 34 146 34 142 94" fill="none" stroke="#2f3442" strokeWidth="8" strokeLinecap="round" />
          <rect x="48" y="80" width="18" height="30" rx="8" fill={col} stroke="#2f3442" strokeWidth="3" />
          <rect x="134" y="80" width="18" height="30" rx="8" fill={col} stroke="#2f3442" strokeWidth="3" />
        </g>
      )
    }
    case 'casquette': {
      const col = c.couleurTenue
      return (
        <g>
          <path d="M60 74 C60 40 140 40 140 74 Z" fill={col} />
          <path d="M60 74 C80 66 132 64 160 76 C150 84 120 80 60 78 Z" fill={darken(col, 0.2)} />
          <circle cx="100" cy="44" r="4" fill={darken(col, 0.25)} />
        </g>
      )
    }
    case 'bandeau':
      return <path d="M61 70 C80 58 120 58 139 70 L139 79 C120 68 80 68 61 79 Z" fill={c.couleurTenue} stroke={darken(c.couleurTenue, 0.2)} strokeWidth="1.5" />
    default:
      return null
  }
}

function Robot({ c }: { c: AvatarConfig }) {
  const body = c.couleurRobot
  const shade = darken(body, 0.2)
  const led = c.couleurLed
  const ronde = c.tete === 'ronde'
  return (
    <g>
      <path d="M38 205 L42 166 Q44 148 62 148 L138 148 Q156 148 158 166 L162 205 Z" fill={body} />
      <rect x="76" y="162" width="48" height="30" rx="6" fill={darken(body, 0.35)} />
      <circle cx="88" cy="177" r="5" fill={led} />
      <circle cx="100" cy="177" r="5" fill={lighten(led, 0.3)} opacity="0.7" />
      <circle cx="112" cy="177" r="5" fill={led} opacity="0.45" />
      <rect x="88" y="126" width="24" height="26" fill={darken(body, 0.3)} />
      <path d="M88 134 H112 M88 142 H112" stroke={darken(body, 0.45)} strokeWidth="3" />
      <Antenna kind={c.antenne} body={body} led={led} top={ronde ? 46 : 48} />
      <rect x="40" y="78" width="14" height="28" rx="5" fill={shade} />
      <rect x="146" y="78" width="14" height="28" rx="5" fill={shade} />
      <rect x="50" y="46" width="100" height="86" rx={ronde ? 43 : 18} fill={body} />
      <rect x="50" y="46" width="100" height="86" rx={ronde ? 43 : 18} fill="none" stroke={shade} strokeWidth="3" />
      <rect x="62" y="62" width="76" height="54" rx={ronde ? 26 : 12} fill="#1b2030" />
      <RobotEyes kind={c.ecran} led={led} />
      <path d="M86 104 Q100 112 114 104" fill="none" stroke={led} strokeWidth="3.5" strokeLinecap="round" />
    </g>
  )
}

function RobotEyes({ kind, led }: { kind: string; led: string }) {
  if (kind === 'carres') {
    return (
      <g fill={led}>
        <rect x="76" y="78" width="14" height="14" rx="2" />
        <rect x="110" y="78" width="14" height="14" rx="2" />
      </g>
    )
  }
  if (kind === 'visiere') {
    return (
      <g>
        <rect x="70" y="80" width="60" height="12" rx="6" fill={led} opacity="0.35" />
        <rect x="80" y="82" width="40" height="8" rx="4" fill={led} />
      </g>
    )
  }
  return (
    <g>
      <circle cx="83" cy="86" r="10" fill={led} opacity="0.25" />
      <circle cx="117" cy="86" r="10" fill={led} opacity="0.25" />
      <circle cx="83" cy="86" r="6" fill={led} />
      <circle cx="117" cy="86" r="6" fill={led} />
    </g>
  )
}

function Antenna({ kind, body, led, top }: { kind: string; body: string; led: string; top: number }) {
  const stem = darken(body, 0.35)
  if (kind === 'double') {
    return (
      <g>
        <path d={`M82 ${top + 4} L72 ${top - 22} M118 ${top + 4} L128 ${top - 22}`} stroke={stem} strokeWidth="4" strokeLinecap="round" />
        <circle cx="72" cy={top - 24} r="6" fill={led} />
        <circle cx="128" cy={top - 24} r="6" fill={led} />
      </g>
    )
  }
  if (kind === 'eclair') {
    return (
      <path
        d={`M104 ${top + 2} L96 ${top - 14} L106 ${top - 14} L98 ${top - 32}`}
        fill="none"
        stroke={led}
        strokeWidth="5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    )
  }
  if (kind === 'aucune') return null
  return (
    <g>
      <path d={`M100 ${top + 2} L100 ${top - 20}`} stroke={stem} strokeWidth="4" strokeLinecap="round" />
      <circle cx="100" cy={top - 24} r="8" fill={led} />
    </g>
  )
}
