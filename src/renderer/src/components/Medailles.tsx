import type { Medaille } from '../../../shared/data'
import { NOMS_MEDAILLES } from '../games/dactylo/seuils'

const COULEURS: Record<number, { fond: string; bord: string }> = {
  1: { fond: '#8b5a3c', bord: '#5e3a22' }, // chocolat
  2: { fond: '#cd7f32', bord: '#8f5520' }, // bronze
  3: { fond: '#c8ced6', bord: '#8c95a1' }, // argent
  4: { fond: '#f3c33c', bord: '#c18f00' } // or
}

export function MedailleIcone({ niveau, size = 48 }: { niveau: number; size?: number }) {
  const c = COULEURS[niveau] ?? COULEURS[1]
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label={NOMS_MEDAILLES[niveau] ?? 'Médaille'}>
      <path d="M14 2h8l4 14h-8z" fill="#4f6bd9" />
      <path d="M34 2h-8l-4 14h8z" fill="#e2504c" />
      <circle cx="24" cy="30" r="15" fill={c.fond} stroke={c.bord} strokeWidth="3" />
      <text x="24" y="36" textAnchor="middle" fontSize="18" fontWeight="700" fill={c.bord}>
        {niveau}
      </text>
    </svg>
  )
}

export function CoffreBouton({ nombre, onClick }: { nombre: number; onClick: () => void }) {
  return (
    <button className="coffre-bouton" onClick={onClick} aria-label={`Mon coffre à médailles (${nombre})`} title="Mon coffre à médailles">
      <svg width="64" height="56" viewBox="0 0 64 56" aria-hidden="true">
        <path d="M6 24a26 20 0 0 1 52 0z" fill="#a8672f" stroke="#6b3f17" strokeWidth="3" />
        <rect x="6" y="24" width="52" height="26" rx="3" fill="#c77d3a" stroke="#6b3f17" strokeWidth="3" />
        <rect x="27" y="20" width="10" height="14" rx="2" fill="#f3c33c" stroke="#a37400" strokeWidth="2" />
        <rect x="6" y="36" width="52" height="4" fill="#6b3f17" opacity=".35" />
      </svg>
      <span className="coffre-nombre">{nombre}</span>
    </button>
  )
}

export function dateFr(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Liste en lecture seule, de la plus récente à la plus ancienne.
export function ListeMedailles({ medailles, vide }: { medailles: Medaille[]; vide: string }) {
  if (medailles.length === 0) return <p className="empty">{vide}</p>
  const triees = medailles.map((m, i) => ({ m, i })).sort((a, b) => b.m.date.localeCompare(a.m.date) || b.i - a.i)
  return (
    <ul className="medailles-liste">
      {triees.map(({ m, i }) => (
        <li key={i} className="medaille-ligne">
          <MedailleIcone niveau={m.niveau} size={44} />
          <span>
            <strong>{NOMS_MEDAILLES[m.niveau]}</strong>
            <span className="muted"> · {dateFr(m.date)}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}
