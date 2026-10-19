import { useEffect, useRef, useState } from 'react'

// Courbe simple d'une seule série (une mesure = un graphique), avec
// réticule et info-bulle au survol.

export interface Point {
  label: string // texte de l'info-bulle (ex. date)
  axe: string // texte court sous l'axe (ex. 12/10)
  y: number
}

interface Props {
  titre: string
  points: Point[]
  unite?: string
  min?: number
  max?: number
  couleur?: string
}

const H = 200
const M = { haut: 16, droite: 16, bas: 28, gauche: 44 }

function graduations(min: number, max: number): number[] {
  const brut = (max - min) / 4
  const p = 10 ** Math.floor(Math.log10(brut || 1))
  const pas = [1, 2, 2.5, 5, 10].map((m) => m * p).find((x) => x >= brut) ?? brut
  const out: number[] = []
  for (let v = Math.ceil(min / pas) * pas; v <= max + 1e-9; v += pas) out.push(Math.round(v * 100) / 100)
  return out
}

export function LineChart({ titre, points, unite = '', min, max, couleur = 'var(--accent)' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(480)
  const [survol, setSurvol] = useState<number | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setW(Math.max(240, e.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const ys = points.map((p) => p.y)
  let bas = min ?? Math.min(...ys)
  let haut = max ?? Math.max(...ys)
  if (min === undefined) bas = Math.max(0, bas - (haut - bas) * 0.15 - 1)
  if (max === undefined) haut = haut + (haut - bas) * 0.15 + 1
  const ticks = graduations(bas, haut)
  bas = Math.min(bas, ticks[0] ?? bas)
  haut = Math.max(haut, ticks[ticks.length - 1] ?? haut)

  const largeur = w - M.gauche - M.droite
  const hauteur = H - M.haut - M.bas
  const x = (i: number) => M.gauche + (points.length === 1 ? largeur / 2 : (i / (points.length - 1)) * largeur)
  const y = (v: number) => M.haut + hauteur - ((v - bas) / (haut - bas || 1)) * hauteur
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.y).toFixed(1)}`).join(' ')

  // Quelques repères de date sous l'axe, sans chevauchement.
  const pasLabel = Math.max(1, Math.ceil(points.length / Math.max(2, Math.floor(largeur / 70))))
  const labels = points.map((_, i) => i).filter((i) => i % pasLabel === 0 || i === points.length - 1)
  const labelsAffiches = labels.filter((i, k) => !(k === labels.length - 2 && points.length - 1 - i < pasLabel / 2))

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - r.left
    let best = 0
    points.forEach((_, i) => {
      if (Math.abs(x(i) - px) < Math.abs(x(best) - px)) best = i
    })
    setSurvol(best)
  }

  const p = survol !== null ? points[survol] : null

  return (
    <figure className="chart" ref={ref}>
      <figcaption className="chart-title">{titre}</figcaption>
      <div className="chart-plot">
        <svg width={w} height={H} viewBox={`0 0 ${w} ${H}`} onMouseMove={onMove} onMouseLeave={() => setSurvol(null)} role="img" aria-label={titre}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={M.gauche} x2={w - M.droite} y1={y(t)} y2={y(t)} className="chart-grid" />
              <text x={M.gauche - 8} y={y(t)} className="chart-tick" textAnchor="end" dominantBaseline="middle">
                {t}
                {unite}
              </text>
            </g>
          ))}
          {labelsAffiches.map((i) => (
            <text key={i} x={x(i)} y={H - 8} className="chart-tick" textAnchor="middle">
              {points[i].axe}
            </text>
          ))}
          {survol !== null && <line x1={x(survol)} x2={x(survol)} y1={M.haut} y2={M.haut + hauteur} className="chart-crosshair" />}
          <path d={d} fill="none" stroke={couleur} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          {points.map((pt, i) => (
            <circle
              key={i}
              cx={x(i)}
              cy={y(pt.y)}
              r={survol === i ? 6 : 4}
              fill={couleur}
              stroke="var(--surface)"
              strokeWidth="2"
            />
          ))}
        </svg>
        {p && survol !== null && (
          <div
            className="chart-tooltip"
            style={{ left: Math.min(Math.max(x(survol), 70), w - 70), top: y(p.y) - 12 }}
          >
            <strong>
              {p.y}
              {unite}
            </strong>
            <span>{p.label}</span>
          </div>
        )}
      </div>
    </figure>
  )
}
