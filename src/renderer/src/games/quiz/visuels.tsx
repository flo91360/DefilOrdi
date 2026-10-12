import type { ReactNode } from 'react'
import type { SceneId, Visuel } from './types'
import { SceneCadre } from './scenes/commun'
import { Bureau } from './scenes/Bureau'
import { Explorateur } from './scenes/Explorateur'
import { Navigateur } from './scenes/Navigateur'
import { TraitementTexte } from './scenes/TraitementTexte'

export function Ecran({ scene, menu }: { scene: SceneId; menu: string | null }) {
  switch (scene) {
    case 'bureau':
      return <Bureau menu={menu} />
    case 'texte':
      return <TraitementTexte menu={menu} />
    case 'navigateur':
      return <Navigateur menu={menu} />
    case 'explorateur':
      return <Explorateur menu={menu} />
  }
}

export function AfficherVisuel({ visuel }: { visuel: Visuel }) {
  if ('icone' in visuel) return <div className="visuel-icone">{ICONES[visuel.icone] ?? null}</div>
  return (
    <div className="visuel-scene">
      <SceneCadre interactive={false} surligne={visuel.surligne}>
        <Ecran scene={visuel.scene} menu={visuel.menu ?? null} />
      </SceneCadre>
    </div>
  )
}

// Icônes dessinées pour le quiz (inspirées des pictogrammes courants, sans
// reproduire de logo de marque).
const S = (children: ReactNode) => (
  <svg viewBox="0 0 120 120" width="160" height="160" aria-hidden="true">
    {children}
  </svg>
)

const appli = (lettre: string, fond: string, page = '#ffffff') =>
  S(
    <>
      <rect x="34" y="18" width="70" height="84" rx="8" fill={page} stroke={fond} strokeWidth="3" />
      <path d="M48 40h42M48 54h42M48 68h42M48 82h30" stroke={fond} strokeWidth="5" strokeLinecap="round" opacity="0.5" />
      <rect x="14" y="34" width="52" height="52" rx="8" fill={fond} />
      <text x="40" y="72" textAnchor="middle" fontSize="38" fontWeight="900" fill="#ffffff" fontFamily="Nunito, sans-serif">
        {lettre}
      </text>
    </>
  )

export const ICONES: Record<string, ReactNode> = {
  usb: S(
    <>
      <rect x="44" y="10" width="32" height="26" rx="3" fill="#cfd5de" stroke="#6b7280" strokeWidth="3" />
      <rect x="52" y="17" width="6" height="6" fill="#6b7280" />
      <rect x="63" y="17" width="6" height="6" fill="#6b7280" />
      <rect x="36" y="34" width="48" height="76" rx="12" fill="#4f6bd9" />
      <circle cx="60" cy="88" r="6" fill="#ffffff" opacity="0.6" />
    </>
  ),
  wifi: S(
    <g fill="none" stroke="#2563eb" strokeWidth="10" strokeLinecap="round">
      <path d="M14 48a66 66 0 0 1 92 0" />
      <path d="M30 66a42 42 0 0 1 60 0" />
      <path d="M45 83a20 20 0 0 1 30 0" />
      <circle cx="60" cy="98" r="4" fill="#2563eb" />
    </g>
  ),
  bluetooth: S(
    <>
      <rect x="28" y="10" width="64" height="100" rx="32" fill="#2563eb" />
      <path d="M44 42l32 30-16 14V34l16 14-32 30" fill="none" stroke="#ffffff" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" />
    </>
  ),
  cadenas: S(
    <>
      <path d="M38 54V40a22 22 0 0 1 44 0v14" fill="none" stroke="#374151" strokeWidth="10" />
      <rect x="26" y="52" width="68" height="56" rx="10" fill="#16a34a" />
      <circle cx="60" cy="76" r="7" fill="#ffffff" />
      <rect x="57" y="78" width="6" height="16" rx="3" fill="#ffffff" />
    </>
  ),
  corbeille: S(
    <>
      <rect x="22" y="22" width="76" height="12" rx="4" fill="#6b7280" />
      <rect x="48" y="12" width="24" height="12" rx="3" fill="none" stroke="#6b7280" strokeWidth="5" />
      <path d="M30 38h60l-6 70H36z" fill="#9ca3af" />
      <path d="M48 50v46M60 50v46M72 50v46" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
    </>
  ),
  imprimante: S(
    <>
      <rect x="34" y="12" width="52" height="30" fill="#ffffff" stroke="#374151" strokeWidth="4" />
      <rect x="14" y="40" width="92" height="44" rx="8" fill="#6b7280" />
      <circle cx="92" cy="54" r="4" fill="#4ade80" />
      <rect x="32" y="70" width="56" height="40" fill="#ffffff" stroke="#374151" strokeWidth="4" />
      <path d="M42 84h36M42 96h26" stroke="#9ca3af" strokeWidth="4" />
    </>
  ),
  disquette: S(
    <>
      <path d="M16 16h72l16 16v72H16z" fill="#2b579a" />
      <rect x="34" y="16" width="44" height="30" fill="#e5e7eb" />
      <rect x="64" y="22" width="8" height="18" fill="#2b579a" />
      <rect x="30" y="64" width="60" height="40" rx="3" fill="#ffffff" />
    </>
  ),
  dossier: S(
    <>
      <path d="M10 28h36l10 10h54v62H10z" fill="#e8a800" />
      <path d="M10 46h100v54H10z" fill="#ffd45a" />
    </>
  ),
  pdf: S(
    <>
      <path d="M24 10h52l22 22v78H24z" fill="#ffffff" stroke="#b91c1c" strokeWidth="4" />
      <path d="M76 10v22h22" fill="none" stroke="#b91c1c" strokeWidth="4" />
      <rect x="14" y="56" width="66" height="32" rx="5" fill="#dc2626" />
      <text x="47" y="80" textAnchor="middle" fontSize="22" fontWeight="900" fill="#ffffff" fontFamily="Nunito, sans-serif">
        PDF
      </text>
    </>
  ),
  texte: appli('W', '#2b579a'),
  tableur: appli('X', '#1d7044'),
  presentation: appli('P', '#c4441c'),
  navigateur: S(
    <>
      <circle cx="60" cy="60" r="46" fill="#2f80ed" />
      <ellipse cx="60" cy="60" rx="20" ry="46" fill="none" stroke="#ffffff" strokeWidth="4" />
      <path d="M14 60h92M22 36h76M22 84h76" stroke="#ffffff" strokeWidth="4" />
    </>
  ),
  souris: S(
    <>
      <rect x="32" y="14" width="56" height="92" rx="28" fill="#e5e7eb" stroke="#374151" strokeWidth="4" />
      <path d="M60 14v34M32 48h56" stroke="#374151" strokeWidth="4" />
      <rect x="56" y="24" width="8" height="16" rx="4" fill="#374151" />
    </>
  ),
  'ctrl-c': touches(['Ctrl', 'C']),
  'ctrl-v': touches(['Ctrl', 'V']),
  'ctrl-z': touches(['Ctrl', 'Z']),
  'ctrl-s': touches(['Ctrl', 'S']),
  'alt-tab': touches(['Alt', 'Tab']),
  maj: touches(['⇧ Maj']),
  'verr-maj': touches(['Verr. maj']),
  echap: touches(['Échap']),
  entree: touches(['Entrée ↵']),
  retour: touches(['⌫']),
  'windows-d': touches(['⊞', 'D']),
  'ctrl-p': touches(['Ctrl', 'P']),
  webcam: S(
    <>
      <circle cx="60" cy="52" r="38" fill="#374151" />
      <circle cx="60" cy="52" r="18" fill="#111827" stroke="#6b7280" strokeWidth="5" />
      <circle cx="54" cy="46" r="5" fill="#9ca3af" />
      <path d="M44 88l-8 22h48l-8-22" fill="#6b7280" />
    </>
  ),
  'unite-centrale': S(
    <>
      <rect x="34" y="8" width="52" height="104" rx="6" fill="#4b5563" />
      <circle cx="60" cy="28" r="8" fill="none" stroke="#a5f3fc" strokeWidth="3" />
      <rect x="44" y="50" width="32" height="5" rx="2" fill="#9ca3af" />
      <rect x="44" y="62" width="32" height="5" rx="2" fill="#9ca3af" />
      <rect x="44" y="90" width="12" height="6" rx="1" fill="#1f2937" />
      <rect x="64" y="90" width="12" height="6" rx="1" fill="#1f2937" />
    </>
  ),
  arobase: S(
    <text x="60" y="88" textAnchor="middle" fontSize="96" fontWeight="900" fill="#4f6bd9" fontFamily="Nunito, sans-serif">
      @
    </text>
  ),
  'mot-de-passe': S(
    <>
      <rect x="10" y="40" width="100" height="40" rx="10" fill="#ffffff" stroke="#374151" strokeWidth="4" />
      {[26, 42, 58, 74, 90].map((x) => (
        <circle key={x} cx={x} cy="60" r="6" fill="#374151" />
      ))}
    </>
  ),
  hameconnage: S(
    <>
      <rect x="8" y="22" width="104" height="72" rx="8" fill="#ffffff" stroke="#374151" strokeWidth="4" />
      <path d="M8 30l52 34 52-34" fill="none" stroke="#374151" strokeWidth="4" />
      <path d="M86 6v40a10 10 0 1 1-10-10" fill="none" stroke="#dc2626" strokeWidth="6" strokeLinecap="round" />
    </>
  )
}

function touches(noms: string[]) {
  const largeurs = noms.map((n) => Math.max(34, n.length * 13 + 16))
  const total = largeurs.reduce((a, b) => a + b, 0) + (noms.length - 1) * 26
  let x = 0
  return (
    <svg viewBox={`-6 0 ${total + 12} 70`} width={Math.min(320, total * 1.6)} height="112" aria-hidden="true">
      {noms.map((n, i) => {
        const w = largeurs[i]
        const g = (
          <g key={n}>
            <rect x={x} y="8" width={w} height="52" rx="9" fill="#e4e1d9" />
            <rect x={x} y="4" width={w} height="50" rx="9" fill="#ffffff" stroke="#cfcabd" strokeWidth="2" />
            <text x={x + w / 2} y="36" textAnchor="middle" fontSize="18" fontWeight="900" fill="#1f2330" fontFamily="Nunito, sans-serif">
              {n}
            </text>
            {i < noms.length - 1 && (
              <text x={x + w + 13} y="38" textAnchor="middle" fontSize="22" fontWeight="900" fill="#5b6070" fontFamily="Nunito, sans-serif">
                +
              </text>
            )}
          </g>
        )
        x += w + 26
        return g
      })}
    </svg>
  )
}
