import type { Resultat, ResultatDactylo } from '../../../../shared/data'
import { LineChart, type Point } from '../../components/LineChart'
import { formatDuree, moyennesParJour, motsParMinute, precision, vitesse } from '../../games/dactylo/engine'
import { CarteErreurs, type Colonne, cumulerCompteurs, ecart, Historique, type Indicateur, NB_PARTIES_CARTE, points, Tile } from './commun'

export const COLONNES_DACTYLO: Colonne<ResultatDactylo>[] = [
  { titre: 'Liste', valeur: (r) => r.listeNom },
  { titre: 'Phrases', valeur: (r) => r.phrases, num: true },
  { titre: 'Temps', valeur: (r) => formatDuree(r.dureeMs), num: true },
  { titre: 'Frappes/min', valeur: (r) => vitesse(r), num: true },
  { titre: 'Mots/min', valeur: (r) => motsParMinute(r), num: true },
  { titre: 'Précision', valeur: (r) => `${precision(r)} %`, num: true },
  { titre: 'Erreurs', valeur: (r) => r.erreurs, num: true }
]

export function StatsDactylo({ parties, onSupprimer }: { parties: ResultatDactylo[]; onSupprimer: (r: Resultat) => void }) {
  const recentes = parties.slice(-NB_PARTIES_CARTE)
  const derniere = parties[parties.length - 1]
  const premiere = parties[0]
  const tempsTotal = parties.reduce((t, r) => t + r.dureeMs, 0)

  return (
    <>
      <div className="stats-tiles">
        <Tile valeur={String(parties.length)} label={parties.length > 1 ? 'parties jouées' : 'partie jouée'} detail={`${formatDuree(tempsTotal)} de frappe au total`} />
        <Tile
          valeur={String(vitesse(derniere))}
          label="frappes justes/min"
          detail={parties.length > 1 ? `${ecart(vitesse(derniere) - vitesse(premiere))} depuis la 1re partie` : 'dernière partie'}
        />
        <Tile
          valeur={`${precision(derniere)} %`}
          label="de précision"
          detail={parties.length > 1 ? `${ecart(precision(derniere) - precision(premiere), ' pt')} depuis la 1re partie` : 'dernière partie'}
        />
      </div>

      {parties.length > 1 && (
        <div className="stats-charts">
          <div className="card">
            <LineChart titre="Vitesse (frappes justes par minute)" points={points(parties, vitesse, (r) => r.listeNom)} />
          </div>
          <div className="card">
            <LineChart titre="Précision" unite=" %" max={100} points={points(parties, precision, (r) => r.listeNom)} />
          </div>
        </div>
      )}

      <MoyennesParJour parties={parties} />

      <CarteErreurs
        titre="Erreurs par touche"
        sousTitre={recentes.length < parties.length ? `${recentes.length} dernières parties` : 'toutes les parties'}
        erreurs={cumulerCompteurs(recentes.map((r) => r.erreursParTouche))}
        legende="Caractères les plus souvent manqués"
      />

      <Historique parties={parties} colonnes={COLONNES_DACTYLO} onSupprimer={onSupprimer} />
    </>
  )
}

// Dactylo : moyenne de vitesse et de précision par jour d'utilisation, pour
// voir la progression d'un jour à l'autre (pas dans l'export Excel).
function MoyennesParJour({ parties }: { parties: ResultatDactylo[] }) {
  const jours = moyennesParJour(parties)
  const dateJour = (jour: string) => {
    const [a, m, j] = jour.split('-').map(Number)
    return new Date(a, m - 1, j)
  }
  const court = (jour: string) => dateJour(jour).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
  const long = (jour: string) => dateJour(jour).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const pts = (y: (m: (typeof jours)[number]) => number): Point[] =>
    jours.map((m) => ({ label: `${long(m.jour)} · ${m.parties} partie${m.parties > 1 ? 's' : ''}`, axe: court(m.jour), y: y(m) }))
  return (
    <div className="card">
      <h2 className="card-title">
        Moyenne par jour <span className="card-title-sub">({jours.length} jour{jours.length > 1 ? 's' : ''} d’utilisation)</span>
      </h2>
      {jours.length > 1 && (
        <div className="stats-charts">
          <LineChart titre="Vitesse moyenne (frappes justes par minute)" points={pts((m) => m.vitesse)} />
          <LineChart titre="Précision moyenne" unite=" %" max={100} points={pts((m) => m.precision)} />
        </div>
      )}
      <table className="patients-table history-table stats-jours">
        <thead>
          <tr>
            <th>Jour</th>
            <th className="num">Parties</th>
            <th className="num">Frappes/min</th>
            <th className="num">Précision</th>
          </tr>
        </thead>
        <tbody>
          {[...jours].reverse().map((m) => (
            <tr key={m.jour}>
              <td>{long(m.jour)}</td>
              <td className="num">{m.parties}</td>
              <td className="num">{m.vitesse}</td>
              <td className="num">{m.precision} %</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export const INDICATEURS_DACTYLO: Indicateur<ResultatDactylo>[] = [
  { nom: 'Vitesse', unite: 'frappes justes/min', valeur: vitesse },
  { nom: 'Précision', unite: '%', valeur: precision }
]

// Bilan : des listes de niveaux différents ne se comparent pas entre elles.
export const GROUPE_DACTYLO = (r: ResultatDactylo) => `Liste « ${r.listeNom} »`
