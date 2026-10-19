import type { ReponseBac, Resultat, ResultatPetitBac } from '../../../../shared/data'
import { LineChart } from '../../components/LineChart'
import { IconCheck } from '../../components/Icons'
import { pourcentage } from '../../games/commun'
import { formatDuree } from '../../games/dactylo/engine'
import { etatReponse, formatTemps } from '../../games/petitbac/engine'
import { type Colonne, dateLongue, Historique, type Indicateur, points, Tile } from './commun'

const NB_GRILLES = 6

export const COLONNES_PETITBAC: Colonne<ResultatPetitBac>[] = [
  { titre: 'Lettre', valeur: (r) => r.lettre },
  { titre: 'Mots acceptés', valeur: (r) => `${r.justes} / ${r.categories}`, num: true },
  { titre: 'Réussite', valeur: (r) => `${pourcentage(r.justes, r.categories)} %`, num: true },
  { titre: 'Temps', valeur: (r) => formatDuree(r.dureeMs), num: true },
  { titre: 'Limite', valeur: (r) => formatTemps(r.tempsLimite) },
  {
    titre: 'Réponses',
    valeur: (r) => r.reponses.map((x) => `${x.categorie} : ${x.mot || '—'}${x.mot && !x.valide ? ' (refusé)' : ''}`).join(' ; '),
    exportSeul: true
  }
]

// Pourquoi une réponse n'a pas compté (rien pour une case vide).
function raisonRefus(x: ReponseBac, lettre: string): string {
  const etat = etatReponse(x.mot, lettre)
  return etat === 'vide' ? '' : etat === 'ok' ? 'Refusé' : etat === 'court' ? 'Trop court' : 'Autre lettre'
}

export function StatsPetitBac({ parties, onSupprimer }: { parties: ResultatPetitBac[]; onSupprimer: (r: Resultat) => void }) {
  const derniere = parties[parties.length - 1]
  const reussite = (r: ResultatPetitBac) => pourcentage(r.justes, r.categories)
  const totalCategories = parties.reduce((t, r) => t + r.categories, 0)
  const totalJustes = parties.reduce((t, r) => t + r.justes, 0)
  const lettre = (r: ResultatPetitBac) => `lettre ${r.lettre}`
  return (
    <>
      <div className="stats-tiles">
        <Tile valeur={String(parties.length)} label={parties.length > 1 ? 'parties jouées' : 'partie jouée'} detail={`${totalJustes} mot${totalJustes > 1 ? 's' : ''} accepté${totalJustes > 1 ? 's' : ''} au total`} />
        <Tile valeur={`${derniere.justes} / ${derniere.categories}`} label="mots acceptés" detail={`dernière partie (${lettre(derniere)})`} />
        <Tile valeur={`${pourcentage(totalJustes, totalCategories)} %`} label="de réussite en tout" detail="sur toutes les parties" />
      </div>
      {parties.length > 1 && (
        <div className="stats-charts">
          <div className="card">
            <LineChart titre="Réussite" unite=" %" max={100} points={points(parties, reussite, lettre)} />
          </div>
          <div className="card">
            <LineChart
              titre="Temps moyen par catégorie (secondes)"
              points={points(parties, (r) => Math.round(r.dureeMs / Math.max(1, r.categories) / 100) / 10, lettre)}
            />
          </div>
        </div>
      )}
      <div className="card">
        <h2 className="card-title">
          Dernières grilles <span className="card-title-sub">(mots tels que l’enfant les a tapés)</span>
        </h2>
        <div className="bac-stats-grilles">
          {parties
            .slice(-NB_GRILLES)
            .reverse()
            .map((r) => (
              <div key={r.id} className="bac-stats-grille">
                <div className="bac-stats-tete">
                  <span className="bac-stats-lettre">{r.lettre}</span>
                  <span>
                    <strong>
                      {r.justes} / {r.categories}
                    </strong>{' '}
                    <span className="muted">· {dateLongue(r.date)}</span>
                  </span>
                </div>
                <table className="bac-stats-table">
                  <tbody>
                    {r.reponses.map((x, i) => (
                      <tr key={i} className={x.mot && !x.valide ? 'refuse' : undefined}>
                        <td className="muted">{x.categorie}</td>
                        <td>
                          <strong>{x.mot || '—'}</strong>
                        </td>
                        <td className="bac-stats-etat">
                          {x.valide ? <IconCheck size={16} /> : raisonRefus(x, r.lettre)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
        </div>
      </div>
      <Historique parties={parties} colonnes={COLONNES_PETITBAC} onSupprimer={onSupprimer} />
    </>
  )
}

export const INDICATEURS_PETITBAC: Indicateur<ResultatPetitBac>[] = [
  { nom: 'Mots acceptés', unite: '%', valeur: (r) => pourcentage(r.justes, r.categories) },
  { nom: 'Temps moyen par catégorie', unite: 's', valeur: (r) => Math.round(r.dureeMs / Math.max(1, r.categories) / 100) / 10, plusPetitMieux: true }
]
