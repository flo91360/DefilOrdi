// Morceaux communs aux statistiques des jeux (espace ergothérapeute).
import type { Resultat } from '../../../../shared/data'
import { type Point } from '../../components/LineChart'
import { IconTrash } from '../../components/Icons'
import { toucheDe } from '../../keyboard/azerty'
import { couleurChaleur, Keyboard } from '../../keyboard/Keyboard'

export const NB_PARTIES_CARTE = 10

export const dateCourte = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })

export const dateLongue = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export interface Colonne<R> {
  titre: string
  valeur: (r: R) => string | number
  num?: boolean
  exportSeul?: boolean // trop long pour l'historique : seulement dans l'export Excel
}

export function secondes(ms: number): string {
  return (ms / 1000).toFixed(1).replace('.', ',')
}

export function versCsv<R extends Resultat>(parties: R[], colonnes: Colonne<R>[]): string {
  const lignes = [
    ['Date', ...colonnes.map((c) => c.titre)],
    ...parties.map((r) => [dateLongue(r.date), ...colonnes.map((c) => c.valeur(r))])
  ]
  return lignes.map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\r\n')
}

export function points<R extends Resultat>(parties: R[], y: (r: R) => number, detail: (r: R) => string): Point[] {
  return parties.map((r) => ({ label: `${dateLongue(r.date)} · ${detail(r)}`, axe: dateCourte(r.date), y: y(r) }))
}

export function cumulerCompteurs(liste: Record<string, number>[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const c of liste) for (const [k, n] of Object.entries(c)) out[k] = (out[k] ?? 0) + n
  return out
}

// Clavier coloré selon le nombre d'erreurs par touche.
export function CarteErreurs({
  titre,
  sousTitre,
  erreurs,
  legende
}: {
  titre: string
  sousTitre: string
  erreurs: Record<string, number>
  legende: string
}) {
  const chaleur: Record<string, number> = {}
  for (const [c, n] of Object.entries(erreurs)) {
    const id = toucheDe(c)
    if (id) chaleur[id] = (chaleur[id] ?? 0) + n
  }
  const pires = Object.entries(erreurs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
  const maxChaleur = Math.max(0, ...Object.values(chaleur))
  return (
    <div className="card">
      <h2 className="card-title">
        {titre} <span className="card-title-sub">({sousTitre})</span>
      </h2>
      {pires.length === 0 ? (
        <p className="ergo-help">Aucune erreur, bravo !</p>
      ) : (
        <>
          <div className="stats-kb">
            <Keyboard chaleur={chaleur} />
          </div>
          <div className="heat-legend">
            <span>Moins</span>
            {[0.15, 0.35, 0.55, 0.75, 1].map((t) => (
              <span key={t} className="heat-swatch" style={{ background: couleurChaleur(t * maxChaleur, maxChaleur) }} />
            ))}
            <span>Plus d’erreurs</span>
          </div>
          <p className="stats-pires">
            {legende} :{' '}
            {pires.map(([c, n]) => (
              <span key={c} className="stats-pire">
                <kbd>{c === ' ' ? 'Espace' : c}</kbd> {n}
              </span>
            ))}
          </p>
        </>
      )}
    </div>
  )
}

export function Historique<R extends Resultat>({
  parties,
  colonnes,
  onSupprimer
}: {
  parties: R[]
  colonnes: Colonne<R>[]
  onSupprimer: (r: Resultat) => void
}) {
  const visibles = colonnes.filter((c) => !c.exportSeul)
  return (
    <div className="card">
      <h2 className="card-title">Historique</h2>
      <table className="patients-table history-table">
        <thead>
          <tr>
            <th>Date</th>
            {visibles.map((c) => (
              <th key={c.titre} className={c.num ? 'num' : undefined}>
                {c.titre}
              </th>
            ))}
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {[...parties].reverse().map((r) => (
            <tr key={r.id}>
              <td>{dateLongue(r.date)}</td>
              {visibles.map((c) => (
                <td key={c.titre} className={c.num ? 'num' : undefined}>
                  {c.valeur(r)}
                </td>
              ))}
              <td className="row-actions">
                <button
                  className="btn btn-ghost btn-sm btn-icon"
                  aria-label="Supprimer cette partie"
                  title="Supprimer cette partie"
                  onClick={() => onSupprimer(r)}
                >
                  <IconTrash size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ecart(n: number, unite = ''): string {
  return `${n > 0 ? '+' : n < 0 ? '−' : '±'}${Math.abs(n)}${unite}`
}

export function Tile({ valeur, label, detail }: { valeur: string; label: string; detail: string }) {
  return (
    <div className="stat-tile">
      <span className="stat-value">{valeur}</span>
      <span className="stat-label">{label}</span>
      <span className="stat-detail">{detail}</span>
    </div>
  )
}

// Mesure suivie dans le bilan imprimable : valeur d'une partie et sens du progrès.
export interface Indicateur<R> {
  nom: string
  unite: string
  valeur: (r: R) => number
  plusPetitMieux?: boolean // ex. temps de réponse
}
