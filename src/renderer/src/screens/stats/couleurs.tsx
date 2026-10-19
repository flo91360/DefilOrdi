import type { Resultat, ResultatCouleurs } from '../../../../shared/data'
import { DUREES_TIMER_COULEURS } from '../../../../shared/data'
import { LineChart } from '../../components/LineChart'
import { pourcentage } from '../../games/commun'
import { type Colonne, Historique, type Indicateur, points, secondes, Tile } from './commun'

export const MODES_COULEURS_LABELS: Record<ResultatCouleurs['mode'], string> = {
  mot: 'Écrire le mot',
  couleur: 'Écrire la couleur',
  melange: 'Les deux',
  timer: 'Couleurs piégées timer'
}

export const COLONNES_COULEURS: Colonne<ResultatCouleurs>[] = [
  { titre: 'Mode', valeur: (r) => (r.mode === 'timer' ? `${MODES_COULEURS_LABELS.timer}, ${r.minutes} min` : MODES_COULEURS_LABELS[r.mode]) },
  { titre: 'Justes', valeur: (r) => `${r.justes} / ${r.manches}`, num: true },
  { titre: 'Réussite', valeur: (r) => `${pourcentage(r.justes, r.manches)} %`, num: true },
  { titre: 'Pièges déjoués', valeur: (r) => `${r.piegesJustes} / ${r.pieges}`, num: true },
  { titre: 'Temps moyen', valeur: (r) => `${secondes(r.dureeMs / Math.max(1, r.manches))} s`, num: true },
  { titre: 'Indices', valeur: (r) => r.indices, num: true }
]

export function StatsCouleurs({ parties, onSupprimer }: { parties: ResultatCouleurs[]; onSupprimer: (r: Resultat) => void }) {
  const derniere = parties[parties.length - 1]
  const reussite = (r: ResultatCouleurs) => pourcentage(r.justes, r.manches)
  const piegesTotal = parties.reduce((t, r) => t + r.pieges, 0)
  const piegesJustes = parties.reduce((t, r) => t + r.piegesJustes, 0)
  const indicesTotal = parties.reduce((t, r) => t + r.indices, 0)
  const recordsTimer = DUREES_TIMER_COULEURS.map((minutes) => ({
    minutes,
    justes: Math.max(0, ...parties.filter((r) => r.mode === 'timer' && r.minutes === minutes).map((r) => r.justes))
  })).filter((x) => parties.some((r) => r.mode === 'timer' && r.minutes === x.minutes))
  const partiesAvecIndice = parties.filter((r) => r.indices > 0).length
  return (
    <>
      <div className="stats-tiles stats-tiles-4">
        <Tile valeur={String(parties.length)} label={parties.length > 1 ? 'parties jouées' : 'partie jouée'} detail={`${parties.reduce((t, r) => t + r.manches, 0)} manches au total`} />
        <Tile valeur={`${reussite(derniere)} %`} label="de réussite" detail={`dernière partie (${MODES_COULEURS_LABELS[derniere.mode].toLowerCase()})`} />
        <Tile valeur={`${pourcentage(piegesJustes, piegesTotal)} %`} label="de pièges déjoués" detail="sur toutes les parties" />
        <Tile
          valeur={String(derniere.indices)}
          label={derniere.indices > 1 ? 'indices utilisés' : 'indice utilisé'}
          detail={`dernière partie · ${indicesTotal} au total, dans ${partiesAvecIndice} partie${partiesAvecIndice > 1 ? 's' : ''} sur ${parties.length}`}
        />
      </div>
      {parties.length > 1 && (
        <div className="stats-charts">
          <div className="card">
            <LineChart titre="Réussite" unite=" %" max={100} points={points(parties, reussite, (r) => MODES_COULEURS_LABELS[r.mode])} />
          </div>
          <div className="card">
            <LineChart
              titre="Temps moyen de réponse (secondes)"
              points={points(parties, (r) => Math.round(r.dureeMs / Math.max(1, r.manches) / 100) / 10, (r) => MODES_COULEURS_LABELS[r.mode])}
            />
          </div>
        </div>
      )}
      {recordsTimer.length > 0 && (
        <div className="card">
          <h2 className="card-title">Records</h2>
          <ul>
            {recordsTimer.map((x) => (
              <li key={x.minutes}>
                {MODES_COULEURS_LABELS.timer} · {x.minutes} minute{x.minutes > 1 ? 's' : ''} · <strong>{x.justes}</strong> bonne{x.justes > 1 ? 's' : ''} réponse{x.justes > 1 ? 's' : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
      <Historique parties={parties} colonnes={COLONNES_COULEURS} onSupprimer={onSupprimer} />
    </>
  )
}

export const INDICATEURS_COULEURS: Indicateur<ResultatCouleurs>[] = [
  { nom: 'Réussite', unite: '%', valeur: (r) => pourcentage(r.justes, r.manches) },
  { nom: 'Pièges déjoués', unite: '%', valeur: (r) => pourcentage(r.piegesJustes, r.pieges) },
  { nom: 'Temps moyen de réponse', unite: 's', valeur: (r) => Math.round(r.dureeMs / Math.max(1, r.manches) / 100) / 10, plusPetitMieux: true }
]

// Bilan : chaque mode a sa difficulté (et le mode timer, sa durée).
export const GROUPE_COULEURS = (r: ResultatCouleurs) =>
  r.mode === 'timer' ? `${MODES_COULEURS_LABELS.timer}, ${r.minutes} min` : MODES_COULEURS_LABELS[r.mode]
